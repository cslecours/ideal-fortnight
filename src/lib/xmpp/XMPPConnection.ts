import { ConnectionStatus } from "../websocket/websocket.models"
import { Websocket } from "../websocket/websocket"
import { render } from "../xml/render"
import { iqStanza, presenceStanza } from "./stanza"
import { filter, first, map, timeout } from "rxjs/operators"
import { firstValueFrom, identity, Observable } from "rxjs"
import { featureDetection, hasFeature, isStreamFeatures } from "./stream/featureDetection"
import { XmlNode, XmlElement } from "../xml/xmlElement"
import { Namespaces } from "./namespaces"
import { isElement } from "../xml/parseXml"
import { randomUUID } from "../crypto/crypto.ponyfill"
import { buildCapabilities, toVerHash } from "./disco/capabilities"
import { BindError, DefinedConditions, ErrorType, StanzaError } from "./xmpp.errors"
import { authStanza, bindStanza, openStanza, sessionStanza } from "./auth/XmlAuthMessages"
import { xmlStream } from "./xmlStream"
import { AuthData } from "./auth/auth.models"
import { doAuth } from "./auth/auth"

export enum XMPPConnectionState {
  None,
  Connecting,
  ConnectionFailed,
  Authenticating,
  Connected,
  Disconnecting,
  Disconnected,
}

export class XMPPConnection {
  private websocket: Websocket

  private jid?: string

  private status: XMPPConnectionState = XMPPConnectionState.None

  private features?: ReturnType<typeof featureDetection>

  private caps = buildCapabilities([], [Namespaces.CAPS])

  private element$: Observable<Element>

  constructor(_options: { connectionTimeout: number }) {
    this.websocket = new Websocket()
    this.element$ = xmlStream(this.websocket.message$)
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

  private async sendIq(type: "set" | "get", stanza: XmlElement) {
    const uniqueId = `${stanza.tagName}_${randomUUID()}`
    return await this.sendAsync(iqStanza(type, { id: uniqueId }, stanza), (result) => {
      return result.tagName === "iq" && result.getAttribute("id") === uniqueId ? result : null
    })
  }

  // TODO Move this around
  private detectErrors(element: Element) {
    const errorElement = Array.from(element.getElementsByTagName("error"))?.[0]
    if (errorElement) {
      const errorCondition = Array.from(errorElement.childNodes).find(
        (x): x is Element => isElement(x) && x.getAttribute("xmlns") === Namespaces.STANZAS && x.tagName != "text"
      )?.tagName as DefinedConditions
      throw new StanzaError(errorElement.getAttribute("type") as ErrorType, errorCondition)
    }
  }

  private async doBind(auth: AuthData) {
    if (!hasFeature(this.features ?? [], "bind", Namespaces.BIND)) {
      throw new Error("BIND EXPECTED")
    }

    const element = await this.sendIq("set", bindStanza(auth.resource))
    if (element.getAttribute("type") === "error") {
      const conflict = element.getElementsByTagName("conflict")
      if (conflict.length > 0) {
        throw new BindError("conflict")
      }
    }

    this.detectErrors(element)

    const jid = element.getElementsByTagName("jid").item(0)?.textContent

    return jid
  }

  private async doSession() {
    if (!hasFeature(this.features, "session", Namespaces.SESSION)) {
      throw new Error("SESSION EXPECTED")
    }
    const sessionResult = await this.sendIq("set", sessionStanza())
    return sessionResult
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
    const [jid] = await Promise.all([this.doBind(auth), this.doSession()])
    if (jid) this.jid = jid

    this.status = XMPPConnectionState.Connected

    this.websocket.send(render(presenceStanza({ hash: "sha-1", ver: await toVerHash(this.caps) })))
  }

  public subscribeToPresenceEvents(handler: (presence: any) => void) {
    this.element$.pipe(filter((x) => x.getAttribute("to") === this.jid)).subscribe((presence) => {
      handler(presence)
    })
  }
}
