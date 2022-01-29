import { createElement } from "../../xml/createElement"
import { discoInfoQueryStanza, discoItemsQueryStanza } from "../disco/discoElements"
import { queryStanzaPart } from "../stanza"
import { XMPPPluginAPI } from "../XMPP.api"
import { RoomAffiliation } from "./queries"

const MUC_OWNER = "http://jabber.org/protocol/muc#owner"
const MUC_ADMIN = "http://jabber.org/protocol/muc#admin"
const MUC_USER = "http://jabber.org/protocol/muc#user"
const MUC_ROOMCONF = "http://jabber.org/protocol/muc#roomconfig"
const MUC_REGISTER = "jabber:iq:register"

export class MucSubPlugin {
  public constructor(private xmpp: XMPPPluginAPI, private context: { mucDomain: string }) {}

  async getRoomOccupants(roomJid: string) {
    return this.xmpp.sendIq("get", { to: roomJid }, discoItemsQueryStanza())
  }

  /**
   * Query publicly available rooms
   */
  async getRooms() {
    return this.xmpp.sendIq("get", { to: this.context.mucDomain }, discoItemsQueryStanza())
  }

  async getByAffiliation(roomJid: string, affiliation: RoomAffiliation) {
    return this.xmpp.sendIq("get", { to: roomJid }, queryStanzaPart({ xmlns: MUC_ADMIN }, createElement("item", { affiliation })))
  }

  async getRoomMembers(roomJid: string) {
    return Promise.allSettled([
      this.getByAffiliation(roomJid, "member"),
      this.getByAffiliation(roomJid, "owner"),
      this.getByAffiliation(roomJid, "admin"),
    ])
  }

  async getRoomInfo(roomJid: string) {
    this.xmpp.sendIq("get", { to: roomJid }, discoInfoQueryStanza())
  }
}
