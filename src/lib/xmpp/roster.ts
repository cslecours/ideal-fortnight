import { createElement } from "../xml/createElement"
import { fromElement } from "../xml/fromElement"
import { isElement } from "../xml/parseXml"
import { Namespaces } from "./namespaces"
import { queryStanzaPart } from "./stanza"
import { XMPPPluginAPI } from "./XMPP.api"

export interface RosterItem {
  jid: string
  subscription: string
  name: string
}

export class Roster {
  constructor(private xmpp: XMPPPluginAPI) {}
  async getRoster(): Promise<RosterItem[]> {
    const rosterResult = await this.xmpp.sendIq("get", {}, queryStanzaPart({ xmlns: Namespaces.ROSTER }))
    const rosterResultObj = Array.from(rosterResult.getElementsByTagName("query").item(0)?.childNodes ?? [])
      .filter(isElement)
      .map((x) => {
        const { subscription, jid, name } = fromElement<RosterItem>(x)
        return { subscription, jid, name }
      })

    console.log(JSON.stringify(rosterResultObj, undefined, 2))
    return rosterResultObj
  }

  async addToRoster(jid: string, name: string): Promise<any> {
    return await this.xmpp.sendIq("set", {}, queryStanzaPart({ xmlns: Namespaces.ROSTER }, createElement("item", { jid, name })))
  }
}
