import { fromElement } from "../../xml/fromElement"
import { XMPPPluginAPI } from "../XMPP.api"
import { getRoomsSubscriptions } from "./queries"

export class MucPlugin {
  public constructor(private xmpp: XMPPPluginAPI, private context: { mucDomain: string }) {}

  async getRooms() {
    const result = await this.xmpp.sendIq("get", { to: this.context.mucDomain }, getRoomsSubscriptions())
    return fromElement(result)
  }
}
