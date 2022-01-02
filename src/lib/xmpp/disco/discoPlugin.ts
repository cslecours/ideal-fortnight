import { fromElement } from "../../xml/fromElement"
import { XMPPPluginAPI } from "../XMPP.api"
import { Capabilities } from "./caps/capabilities"
import { capabilitiesCache } from "./caps/capabilitiesCache"
import { discoInfoQueryStanza, discoItemsQueryStanza } from "./discoElements"
import { fromDiscoResult } from "./discoResult"

export class DiscoPlugin {
  constructor(private xmpp: XMPPPluginAPI) {}

  async sendDiscoInfoQuery(to: string, node?: string): Promise<Capabilities> {
    let ver = undefined
    if (node) {
      ver = node.split("#").pop()
      if (!ver) {
        throw new Error("node has no ver")
      }
      const cachedCapabilities = capabilitiesCache.get(ver)
      if (cachedCapabilities) {
        return cachedCapabilities
      }
    }
    const discoResult = await this.xmpp.sendIq("get", { to: to }, discoInfoQueryStanza(node))
    const capabilities = fromDiscoResult(discoResult)
    if (ver) {
      capabilitiesCache.set(ver, capabilities)
    }

    return capabilities
  }

  async sendDiscoItemQuery(to: string): Promise<{ jid: string; node: string; name: string }[]> {
    const result = await this.xmpp.sendIq("get", { to: to }, discoItemsQueryStanza())
    return Array.from(result.getElementsByTagName("item")).map((t) => fromElement<{ jid: string; node: string; name: string }>(t, false))
  }
}
