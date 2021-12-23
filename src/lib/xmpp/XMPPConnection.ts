import { ConnectionStatus } from "../websocket/events"
import { Websocket } from "../websocket/websocket"
import { render } from "../stanza/render"
import { authResponseStanza, authStanza, bindStanza, iqStanza, openStanza, sessionStanza } from "./stanza"
import { filter, first, map } from "rxjs/operators"
import { firstValueFrom } from "rxjs"
import { featureDetection, hasFeature, isStreamFeatures } from "./featureDetection"
import { AuthData, plainAuthChallenge, tryParseSASL, xOauth2Challenge } from "./auth"
import { Stanza, StanzaElement } from "../stanza/stanza"
import { Namespaces } from "./namespaces"
import { parseXml } from "../stanza/parseXml"
import { nanoid } from "nanoid"

export class XMPPConnection {
  private websocket: Websocket

  private features?: ReturnType<typeof featureDetection>

  constructor(_options: { connectionTimeout: number }) {
    this.websocket = new Websocket()
    this.websocket.message$.subscribe((m) => console.log("MESSAGE\t", m))
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
    const uniqueId = `${stanza.tagName}_${nanoid()}`
    return await this.sendAndWait(iqStanza(type, { id: uniqueId }, stanza), (message) => {
      const result = parseXml(message)

      return result.tagName === "iq" && result.getAttribute("id") === uniqueId ? result : null
    })
  }

  async connect({ url, auth }: { url: string | URL; auth: AuthData }): Promise<void> {
    this.websocket.connect(url, ["xmpp"])
    await firstValueFrom(this.websocket.connectionStatus$.pipe(first((x) => x === ConnectionStatus.Open)))

    this.features = await this.sendAndWait(openStanza(auth.domain), (str) => (isStreamFeatures(str) ? featureDetection(str) : null))
    const supportsXOauth2 = hasFeature(this.features, "mechanisms", Namespaces.SASL)?.includes("X-OAUTH2")
    const [mechanism, onChallenge] = supportsXOauth2 ? ["X-OAUTH2", xOauth2Challenge] : ["PLAIN", plainAuthChallenge]

    const authResult = await this.sendAndWait(authStanza(mechanism, onChallenge(auth)), tryParseSASL)
    console.warn("ZE AUTH" + authResult)

    this.features = await this.sendAndWait(openStanza(auth.domain), (str) => (isStreamFeatures(str) ? featureDetection(str) : null))
    if (!hasFeature(this.features, "bind", Namespaces.BIND)) {
      throw new Error("BIND EXPECTED")
    }

    console.log("SENDING BIND")

    const bindResult = await this.sendIq("set", bindStanza(auth.ressource))
    console.log("BIND_RESULT", bindResult)

    if (!hasFeature(this.features, "session", Namespaces.SESSION)) {
      throw new Error("SESSION EXPECTED")
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sessionResult = await this.sendIq("set", sessionStanza())
    //await this.websocket.send(render(presenceStanza()))
  }
}
