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
import { randomUUID } from "../crypto/crypto.ponyfill"
import { BindError, detectErrors } from "./xmpp.errors"
import { bindStanza, openStanza } from "./auth/XmlAuthMessages"
import { xmlStream } from "./xmlStream"
import { AuthData } from "./auth/auth.models"
import { doAuth } from "./auth/auth"
import { getXmlSerializer } from "../xml/shims"
import { XMPPPluginAPI } from "./XMPP.api"
import { createElement } from "../xml/createElement"
import { getBareJidFromJid } from "./jid"

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

  private jid?: string

  public context: { domain?: string } = {}

  private status$: BehaviorSubject<string> = new BehaviorSubject(XMPPConnectionState.None.toString())

  private features?: ReturnType<typeof featureDetection>

  private element$: Observable<Element>

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

  public async sendAsync<T>(stanza: XmlNode, mapper: (str: Element) => T | null, msTimeout?: number | undefined) {
    const resultPromise = firstValueFrom(
      this.element$.pipe(
        map(mapper),
        filter(<T>(x: T | null): x is NonNullable<T> => x != null && x != undefined),
        msTimeout ? timeout(msTimeout) : identity
      )
    )

    this.websocket.send(render(stanza))
    return await resultPromise
  }

  private subscription = new Subscription()

  public on({ tagName, xmlns }: { tagName: string; xmlns?: string }, callback: (e: Element) => void | Element): () => void {
    const subscription = this.element$
      .pipe(
        filter((el) => {
          const tagMatch = !tagName || el.tagName === tagName
          const xmlnsMatch = !xmlns || el.getAttribute("xmlns") === xmlns
          return tagMatch && xmlnsMatch
        }),
        tap((x) => {
          const result = callback(x)
          if (result) {
            this.websocket.send(getXmlSerializer().serializeToString(result))
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

  public onConnectionStatusChange(callback: (s: string) => void) {
    this.status$.subscribe(callback)
  }

  public async sendIq(type: "set" | "get", attrs: Omit<IqStanzaAttrs, "id">, stanza: XmlElement) {
    const uniqueId = `${stanza.tagName}_${randomUUID()}`
    return await this.sendAsync(iqStanza(type, { ...attrs, id: uniqueId, from: this.jid }, stanza), (result) => {
      return result.tagName === "iq" && result.getAttribute("id") === uniqueId ? result : null
    })
  }

  private async doBind(auth: AuthData) {
    if (!hasFeature(this.features ?? [], "bind", Namespaces.BIND)) {
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
    this.features = await this.sendAsync(openStanza(auth.domain), (el) => (isStreamFeatures(el) ? featureDetection(el) : null))
  }

  async connect({ url, auth }: { url: string | URL; auth: AuthData }): Promise<void> {
    this.status$.next(XMPPConnectionState.Connecting)

    this.context = { domain: auth.domain }
    this.websocket.connect(url, ["xmpp"])
    await firstValueFrom(this.websocket.connectionStatus$.pipe(first((x) => x === ConnectionStatus.Open)))

    this.status$.next(XMPPConnectionState.Authenticating)

    await this.requestFeatures(auth)
    const mechanisms = hasFeature(this.features, "mechanisms", Namespaces.SASL) ?? []
    await doAuth(this, mechanisms, auth)
    await this.requestFeatures(auth)
    const [jid] = await Promise.all([this.doBind(auth)])
    if (jid) this.jid = jid

    this.status$.next(XMPPConnectionState.Connected)
  }

  async disconnect() {
    this.status$.next(XMPPConnectionState.Disconnecting)
    this.websocket.close()
  }

  sendMessage(options: { to: string; type: string }, message: { body: string }) {
    this.websocket.send(render(messageStanza({ from: getBareJidFromJid(this.jid ?? ""), type: options.type, to: options.to }, message)))
  }

  sendPresence() {
    this.websocket.send(render(presenceStanza()))
  }
}
function messageStanza(options: { from?: string; to: string; type: string }, message: { body: string }): XmlNode {
  return createElement("message", options, createElement("body", undefined, message.body))
}
