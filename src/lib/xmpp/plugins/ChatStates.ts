import { createElement } from "../../xml/createElement"
import type { XMPPPluginAPI } from "../XMPP.api"

export class ChatStatesPlugin {
  constructor(private xmpp: XMPPPluginAPI) {}
  sendNotification(jid: string, notification: "composing" | "active" | "paused" | "inactive" | "gone", type = "chat") {
    this.xmpp.sendMessage({ to: jid, type }, createElement(notification, { xmlns: "http://jabber.org/protocol/chatstates" }))
  }
}
