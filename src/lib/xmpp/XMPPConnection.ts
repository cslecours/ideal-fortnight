import { ConnectionStatus } from "../websocket/websocket.models"
import { Websocket } from "../websocket/websocket"
import { render } from "../xml/render"
import { iqStanza, IqStanzaAttrs, presenceStanza } from "./stanza"
import { filter, first, map, tap, timeout } from "rxjs/operators"
import { BehaviorSubject, firstValueFrom, identity, Observable, Subject, Subscription } from "rxjs"
import { featureDetection, hasFeature, isStreamFeatures } from "./stream/featureDetection"
import { XmlNode, XmlElement } from "../xml/xmlElement"
import { Namespaces } from "./namespaces"
import { isElement } from "../xml/parseXml"
import { BindError, detectErrors } from "./xmpp.errors"
import { bindStanza, openStanza } from "./auth/XmlAuthMessages"
import { xmlStream } from "./xmlStream"
import { AuthData } from "./auth/auth.models"
import { doAuth } from "./auth/auth"
import { getXmlSerializer } from "../xml/shims"
import { XMPPPluginAPI } from "./XMPP.api"
import { createElement } from "../xml/createElement"

export enum XMPPConnectionState {
  None = "none",
  Connecting = "connecting",
  ConnectionFailed = "failed",
  Authenticating = "authenticating",
  Connected = "connected",
  Disconnecting = "disconnecting",
  Disconnected = "disconnected",
}

export class XMPPConnection implements XMPPPluginAPI {
  private websocket: Websocket

  public jid?: string

  public context: { domain?: string; features?: ReturnType<typeof featureDetection> } = {}

  private status$: BehaviorSubject<XMPPConnectionState> = new BehaviorSubject(XMPPConnectionState.None as XMPPConnectionState)

  private element$: Observable<Element>
  private subscription = new Subscription()
  private outgoingMessage$ = new Subject<XmlElement>()

  constructor() {
    this.websocket = new Websocket()
    this.element$ = xmlStream(this.websocket.message$)
    this.websocket.connectionStatus$.subscribe((s) => {
      if (s === ConnectionStatus.Closed) {
        this.status$.next(XMPPConnectionState.Disconnected)
      }
      if (s === ConnectionStatus.Failed) {
        this.status$.next(XMPPConnectionState.Disconnected)
      }
    })

    this.on({ tagName: "iq", xmlns: Namespaces.CLIENT }, (e) => {
      if (e.getAttribute("type") !== "get") {
        return
      }

      const query = e.firstChild
      if (!isElement(query)) {
        return
      }
      const isDiscoNode = query.getAttribute("xmlns") === Namespaces.DISCO_INFO
      if (isDiscoNode) {
        console.warn("    " + getXmlSerializer().serializeToString(query))
      }
    })
  }

  public async sendAsync<T>(stanza: XmlElement, mapper: (str: Element) => T | null, msTimeout?: number | undefined) {
    const resultPromise = firstValueFrom(
      this.element$.pipe(
        map(mapper),
        filter(<T>(x: T | null): x is NonNullable<T> => x != null && x != undefined),
        msTimeout ? timeout(msTimeout) : identity
      )
    )

    this.internalSend(stanza)
    return await resultPromise
  }

  public on(
    criteria: { tagName: string; xmlns?: string } | { tagName: string; xmlns?: string }[],
    callback: (e: Element) => void | XmlElement
  ): () => void {
    const criteriaArray = Array.isArray(criteria) ? criteria : [criteria]

    const subscription = this.element$
      .pipe(
        filter((el) => {
          return criteriaArray.some(({ tagName, xmlns }) => {
            const tagMatch = !tagName || el.tagName === tagName
            const xmlnsMatch = !xmlns || el.getAttribute("xmlns") === xmlns
            return tagMatch && xmlnsMatch
          })
        }),
        tap((x) => {
          const result = callback(x)
          if (result) {
            this.internalSend(result)
          }
        })
      )
      .subscribe()

    this.subscription.add(subscription)
    return () => subscription.unsubscribe()
  }

  public onSelfPresence(callback: (e: any) => void) {
    this.on({ tagName: "presence", xmlns: Namespaces.CLIENT }, (e) => {
      const from = e.getAttribute("from")
      if (from === this.jid) {
        callback(e)
      }
    })
  }

  public onOutgoingMessage(
    criteria: { tagName: string; xmlns?: string } | { tagName: string; xmlns?: string }[],
    callback: (e: XmlElement) => void
  ): () => void {
    console
    const criteriaArray = Array.isArray(criteria) ? criteria : [criteria]

    const subscription = this.outgoingMessage$
      .pipe(
        filter((el) => {
          return criteriaArray.some(({ tagName, xmlns }) => {
            const tagMatch = !tagName || el.tagName === tagName
            const xmlnsMatch = !xmlns || el.attrs?.xmlns === xmlns
            return tagMatch && xmlnsMatch
          })
        })
      )
      .subscribe((x) => {
        try {
          callback(x)
        } catch (e) {
          console.error(e)
        }
      })

    this.subscription.add(subscription)
    return () => subscription.unsubscribe()
  }

  public onConnectionStatusChange(callback: (s: XMPPConnectionState) => void) {
    const subscription = this.status$.subscribe(callback)

    this.subscription.add(subscription)
    return () => subscription.unsubscribe()
  }

  public async sendIq(type: "set" | "get", attrs: Omit<IqStanzaAttrs, "id">, stanza: XmlElement) {
    const uniqueId = `${stanza.tagName}_${crypto.randomUUID()}`
    return await this.sendAsync(iqStanza(type, { ...attrs, id: uniqueId, from: this.jid }, stanza), (result) => {
      return result.tagName === "iq" && result.getAttribute("id") === uniqueId ? result : null
    })
  }

  private async doBind(auth: AuthData) {
    if (!hasFeature(this.context.features ?? [], "bind", Namespaces.BIND)) {
      throw new Error("BIND EXPECTED")
    }

    const element = await this.sendIq("set", {}, bindStanza(auth.resource))
    if (element.getAttribute("type") === "error") {
      const conflict = element.getElementsByTagName("conflict")
      if (conflict.length > 0) {
        throw new BindError("conflict")
      }
    }

    detectErrors(element)

    const jid = element.getElementsByTagName("jid").item(0)?.textContent ?? undefined

    return jid
  }

  private async requestFeatures(auth: AuthData) {
    this.context.features = await this.sendAsync(openStanza(auth.domain), (el) => (isStreamFeatures(el) ? featureDetection(el) : null))
  }

  async connect({ url, auth, skipBind }: { url: string | URL; auth: AuthData; skipBind?: boolean }): Promise<void> {
    this.status$.next(XMPPConnectionState.Connecting)

    this.context = { domain: auth.domain }
    this.websocket.connect(url, ["xmpp"])
    await firstValueFrom(this.websocket.connectionStatus$.pipe(first((x) => x === ConnectionStatus.Open)))

    this.status$.next(XMPPConnectionState.Authenticating)

    await this.requestFeatures(auth)
    const mechanisms = hasFeature(this.context.features, "mechanisms", Namespaces.SASL) ?? []
    await doAuth(this, mechanisms, auth)
    await this.requestFeatures(auth)

    if (skipBind) {
      const [jid] = await Promise.all([this.doBind(auth)])
      if (jid) this.jid = jid
    }

    this.status$.next(XMPPConnectionState.Connected)
  }

  async disconnect() {
    this.status$.next(XMPPConnectionState.Disconnecting)
    this.websocket.close()
  }

  async unsubscribe() {
    this.subscription.unsubscribe()
  }

  private internalSend(element: XmlElement) {
    this.websocket.send(render(element))
    this.outgoingMessage$.next(element)
  }

  sendMessage(attrs: { to: string; type: string }, children?: XmlNode): void {
    this.internalSend(createElement("message", { from: this.jid, ...attrs }, children))
  }

  sendPresence(attrs?: { to?: string; type?: string }, children?: XmlNode) {
    this.internalSend(presenceStanza(attrs, children))
  }
}
