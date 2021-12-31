import { ConnectionStatus } from "../websocket/websocket.models"
import { Websocket } from "../websocket/websocket"
import { render } from "../xml/render"
import { iqStanza, IqStanzaAttrs, presenceStanza } from "./stanza"
import { filter, first, map, tap, timeout } from "rxjs/operators"
import { firstValueFrom, identity, Observable, Subscription } from "rxjs"
import { featureDetection, hasFeature, isStreamFeatures } from "./stream/featureDetection"
import { XmlNode, XmlElement } from "../xml/xmlElement"
import { Namespaces } from "./namespaces"
import { isElement } from "../xml/parseXml"
import { randomUUID } from "../crypto/crypto.ponyfill"
import { buildCapabilities } from "./disco/caps/capabilities"
import { BindError, detectErrors } from "./xmpp.errors"
import { bindStanza, openStanza, sessionStanza } from "./auth/XmlAuthMessages"
import { xmlStream } from "./xmlStream"
import { AuthData } from "./auth/auth.models"
import { doAuth } from "./auth/auth"
import { getXmlSerializer } from "../xml/shims"
import { XMPPPluginAPI } from "./XMPP.api"

export enum XMPPConnectionState {
  None,
  Connecting,
  ConnectionFailed,
  Authenticating,
  Connected,
  Disconnecting,
  Disconnected,
}

export class XMPPConnection implements XMPPPluginAPI {
  private websocket: Websocket

  private jid?: string

  private status: XMPPConnectionState = XMPPConnectionState.None

  private features?: ReturnType<typeof featureDetection>

  private element$: Observable<Element>

  constructor(_options: { connectionTimeout: number }) {
    this.websocket = new Websocket()
    this.element$ = xmlStream(this.websocket.message$)

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
        filter(<T>(x: T | null): x is NonNullable<T> => !!x),
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
    this.status = XMPPConnectionState.Connecting

    this.websocket.connect(url, ["xmpp"])
    await firstValueFrom(this.websocket.connectionStatus$.pipe(first((x) => x === ConnectionStatus.Open)))

    this.status = XMPPConnectionState.Authenticating

    await this.requestFeatures(auth)
    const mechanisms = hasFeature(this.features, "mechanisms", Namespaces.SASL) ?? []
    await doAuth(this, mechanisms, auth)
    await this.requestFeatures(auth)
    const [jid] = await Promise.all([this.doBind(auth)])
    if (jid) this.jid = jid

    this.status = XMPPConnectionState.Connected
  }

  sendPresence() {
    this.websocket.send(render(presenceStanza()))
  }
}
