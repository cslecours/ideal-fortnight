import { createElement } from "../../xml/createElement"
import { discoInfoQueryStanza, discoItemsQueryStanza } from "../disco/discoElements"
import { Namespaces } from "../namespaces"
import { queryStanzaPart } from "../stanza"
import { XMPPPluginAPI } from "../XMPP.api"
import { RoomAffiliation } from "./queries"

const namespacePrefix = "http://jabber.org/protocol/muc"
const MUC_OWNER = `${namespacePrefix}#owner`
const MUC_ADMIN = `${namespacePrefix}#admin`
const MUC_USER = `${namespacePrefix}#user`
const MUC_ROOMCONF = `${namespacePrefix}#roomconfig`
const MUC_REGISTER = `jabber:iq:register`

export class MucSubPlugin {
  public constructor(
    private xmpp: XMPPPluginAPI,
    private context: { mucDomain: string }
  ) {}

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
    return this.xmpp.sendIq("get", { to: roomJid }, discoInfoQueryStanza())
  }

  /**
   * TODO
   */
  configureRoom(roomJid: string, _config: Record<string, string>) {
    return this.xmpp.sendIq(
      "set",
      { to: roomJid },
      queryStanzaPart({ xmlns: MUC_OWNER }, createElement("x", { type: "submit", xmlns: Namespaces.DATA }))
    )
  }
}
