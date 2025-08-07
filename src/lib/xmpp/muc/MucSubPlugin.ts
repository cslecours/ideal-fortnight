import { fromElement } from "../../xml/fromElement"
import { XMPPPluginAPI } from "../XMPP.api"
import { getRoomsSubscriptions, subscribeToRoom, unsubscribeFromRoom } from "./queries"

export class MucSubPlugin {
  public constructor(
    private xmpp: XMPPPluginAPI,
    private context: { mucDomain: string }
  ) {}

  async subscribeToMucSub(roomJid: string, nick?: string) {
    return this.xmpp.sendIq("set", { to: roomJid }, subscribeToRoom(nick))
  }

  async unsubscribeFromMucSub(roomJid: string) {
    return this.xmpp.sendIq("set", { to: roomJid }, unsubscribeFromRoom())
  }

  async getSubscriptions() {
    return this.xmpp.sendIq("get", { to: this.context.mucDomain }, getRoomsSubscriptions())
  }

  async getRooms() {
    const result = await this.xmpp.sendIq("get", { to: this.context.mucDomain }, getRoomsSubscriptions())
    return fromElement(result)
  }
}
