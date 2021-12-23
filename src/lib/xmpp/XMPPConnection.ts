import { ConnectionStatus } from "../websocket/events"
import { Websocket } from "../websocket/websocket"
import { render } from "../stanza/render"
import { openStanza, plainAuthStanza, setBindStanza } from "./stanza"
import { filter, first, map } from "rxjs/operators"
import { firstValueFrom } from "rxjs"
import { featureDetection, hasFeature, isStreamFeatures } from "./featureDetection"
import { AuthData, plainAuthChallenge, tryParseSASL } from "./auth"
import { Stanza } from "../stanza/stanza"
import { Namespaces } from "./namespaces"
import { parseXml } from "../stanza/parseXml"

export class XMPPConnection {
  private websocket: Websocket

  private features?: ReturnType<typeof featureDetection>

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

  async connect({ url, auth }: { url: string | URL; auth: AuthData }): Promise<void> {
    this.websocket.connect(url, ["xmpp"])
    this.websocket.message$.subscribe((m) => console.log("MESSAGE\t", m))
    await firstValueFrom(this.websocket.connectionStatus$.pipe(first((x) => x === ConnectionStatus.Open)))

    this.features = await this.sendAndWait(openStanza(auth.domain), (str) => (isStreamFeatures(str) ? featureDetection(str) : null))
    if (!hasFeature(this.features, "mechanisms", Namespaces.SASL)?.includes("PLAIN")) {
      throw new Error("UNSUPPORTED SASL")
    }
    const authResult = await this.sendAndWait(plainAuthStanza(plainAuthChallenge(auth)), tryParseSASL)
    console.warn("ZE AUTH" + authResult)

    this.features = await this.sendAndWait(openStanza(auth.domain), (str) => (isStreamFeatures(str) ? featureDetection(str) : null))
    if (!hasFeature(this.features, "bind", Namespaces.BIND)) {
      throw new Error("BIND EXPECTED")
    }

    console.log("SENDING BIND")

    const bindIqId = "_bind_auth_2"
    const bindResult = await this.sendAndWait(setBindStanza(bindIqId, auth.ressource), (message: string) => {
      const result = parseXml(message)
      console.log("TESTING", result.getAttribute("id"))
      return result.getAttribute("id") === bindIqId ? result : null
    })

    console.log("BIND_RESULT", bindResult)

    //<iq type='set' id='_bind_auth_2' xmlns='jabber:client'>
    //  <bind xmlns='urn:ietf:params:xml:ns:xmpp-bind'>
    //    <resource>web-client||3896</resource>
    //  </bind>
    //</iq>
  }
}
