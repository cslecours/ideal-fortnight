import { ConnectionStatus } from "../websocket/events"
import { Websocket } from "../websocket/websocket"
import { render } from "../stanza/render"
import { openStanza, plainAuthStanza } from "./stanza"
import { filter, first, map } from "rxjs/operators"
import { firstValueFrom } from "rxjs"
import { featureDetection, isStreamFeatures } from "./featureDetection"
import { AuthData, plainAuthChallenge, tryParseSASL } from "./auth"
import { Stanza } from "../stanza/stanza"

export class XMPPConnection {
  private websocket: Websocket

  private features?: { mechanisms: string[] }

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

    this.sendAndWait(openStanza(auth.domain), (str) => (isStreamFeatures(str) ? featureDetection(str) : null))
    this.features = await firstValueFrom(this.websocket.message$.pipe(first(isStreamFeatures), map(featureDetection)))
    if (this.features.mechanisms.includes("PLAIN")) {
      const authResult = await this.sendAndWait(plainAuthStanza(plainAuthChallenge(auth)), tryParseSASL)

      console.warn("ZE AUTH" + authResult)
    } else {
      throw new Error("UNSUPPORTED SASL")
    }
  }
}
