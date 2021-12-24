import { ConnectionStatus } from "../websocket/websocket.models"
import { Websocket } from "../websocket/websocket"
import { render } from "../stanza/render"
import { authStanza, bindStanza, iqStanza, openStanza, presenceStanza, sessionStanza } from "./stanza"
import { filter, first, map } from "rxjs/operators"
import { firstValueFrom, Observable } from "rxjs"
import { featureDetection, hasFeature, isStreamFeatures } from "./stream/featureDetection"
import { AuthData, detectAuthErrors, plainAuthChallenge, waitForAuthResult, xOauth2Challenge } from "./auth/auth"
import { Stanza, StanzaElement } from "../stanza/stanza"
import { Namespaces } from "./namespaces"
import { isElement, parseXml } from "../stanza/parseXml"
import { randomUUID } from "../crypto/crypto.ponyfill"
import { buildCapabilities, toVerHash } from "./disco/capabilities"
import { BindError, DefinedConditions, ErrorType, StanzaError } from "./xmpp.errors"

export class XMPPConnection {
  private websocket: Websocket

  private features?: ReturnType<typeof featureDetection>

  private caps = buildCapabilities([], [Namespaces.CAPS])

  constructor(_options: { connectionTimeout: number }) {
    this.websocket = new Websocket()
  }

  private async sendAndWait<T>(stanza: Stanza, mapper: (str: string) => T | null) {
    const resultPromise = firstValueFrom(
      this.websocket.message$.pipe(
        map(mapper),
        filter(<T>(x: T | null): x is NonNullable<T> => !!x)
      )
    )

    this.websocket.send(render(stanza))
    return await resultPromise
  }

  private async sendIq(type: "set" | "get", stanza: StanzaElement) {
    const uniqueId = `${stanza.tagName}_${randomUUID()}`
    return await this.sendAndWait(iqStanza(type, { id: uniqueId }, stanza), (message) => {
      const result = parseXml(message)

      return result.tagName === "iq" && result.getAttribute("id") === uniqueId ? result : null
    })
  }

  private async doAuth(auth: AuthData) {
    const features = await this.sendAndWait(openStanza(auth.domain), (str) => (isStreamFeatures(str) ? featureDetection(str) : null))
    const supportsXOauth2 = hasFeature(features, "mechanisms", Namespaces.SASL)?.includes("X-OAUTH2")
    const [mechanism, onChallenge] = supportsXOauth2 ? ["X-OAUTH2", xOauth2Challenge] : ["PLAIN", plainAuthChallenge]
    const authResult = await this.sendAndWait(authStanza(mechanism, onChallenge(auth)), waitForAuthResult)
    detectAuthErrors(authResult)
    return authResult
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

  async connect({ url, auth }: { url: string | URL; auth: AuthData }): Promise<void> {
    this.websocket.connect(url, ["xmpp"])
    await firstValueFrom(this.websocket.connectionStatus$.pipe(first((x) => x === ConnectionStatus.Open)))

    await this.doAuth(auth)
    this.features = await this.sendAndWait(openStanza(auth.domain), (str) => (isStreamFeatures(str) ? featureDetection(str) : null))
    const [jid] = await Promise.all([this.doBind(auth), this.doSession()])

    console.log("CURRENT JID\t", jid)

    this.websocket.send(render(presenceStanza({ hash: "sha-1", ver: await toVerHash(this.caps) })))
  }
}
