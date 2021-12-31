import { XMPPPluginAPI } from "../XMPP.api"
import { Capabilities } from "./caps/capabilities"
import { capabilitiesCache } from "./caps/capabilitiesCache"
import { discoInfoQueryStanza } from "./discoElements"
import { fromDiscoResult } from "./discoResult"

export class DiscoPlugin {
  constructor(private xmpp: XMPPPluginAPI) {}

  async sendDiscoQuery(to: string, node: string): Promise<Capabilities> {
    const ver = node.split("#").pop()
    if (!ver) {
      throw new Error("node has no ver")
    }
    const cachedCapabilities = capabilitiesCache.get(ver)
    if (cachedCapabilities) {
      return cachedCapabilities
    }
    const discoResult = await this.xmpp.sendIq("get", { to: to }, discoInfoQueryStanza(node))
    const capabilities = fromDiscoResult(discoResult)
    capabilitiesCache.set(ver, capabilities)
    return capabilities
  }
}
