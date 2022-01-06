import { createElement } from "../../xml/createElement"
import { XMPPPluginAPI } from "../XMPP.api"
import { XMPPConnection, XMPPConnectionState } from "../XMPPConnection"

export function withCarbons(connection: XMPPConnection): XMPPConnection {
  connection.onConnectionStatusChange((status) => {
    if (status === XMPPConnectionState.Connected) {
      console.log(connection.context)
      connection.sendIq("set", {}, enableCarbon())
    }
  })
  return connection
}

export function enableCarbon() {
  return createElement("enable", { xmlns: "urn:xmpp:carbons:2" })
}
