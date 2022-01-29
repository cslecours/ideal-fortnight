import { createElement } from "../../xml/createElement"
import { fromElement } from "../../xml/fromElement"
import { isElement } from "../../xml/parseXml"
import { detectErrors } from "../xmpp.errors"
import { Namespaces } from "./../namespaces"
import { queryStanzaPart } from "./../stanza"
import { XMPPPluginAPI } from "./../XMPP.api"
import { rosterSet } from "./rosterStanzas"

export interface RosterItem {
  jid: string
  subscription: "none" | "to" | "from" | "both"
  name: string
}

const rosterReducer = (state: RosterItem[], item: RosterItem | (Omit<RosterItem, "subscription"> & { subscription: "remove" })) => {
  switch (item.subscription) {
    case "remove":
      return state.filter((x) => x.jid != item.jid)
    default:
      return [...state.filter((x) => x.jid != item.jid), item]
  }
}

export class Roster {
  state: RosterItem[] = []

  constructor(private xmpp: XMPPPluginAPI) {}
  async getRoster(): Promise<RosterItem[]> {
    const rosterResult = await this.xmpp.sendIq("get", {}, queryStanzaPart({ xmlns: Namespaces.ROSTER }))
    const rosterResultObj = Array.from(rosterResult.getElementsByTagName("query").item(0)?.childNodes ?? [])
      .filter(isElement)
      .map((x) => {
        const { subscription, jid, name } = fromElement<RosterItem>(x)
        return { subscription, jid, name }
      })
    this.state = rosterResultObj
    return rosterResultObj
  }

  /**
   * 
   * @param jid 
   There are several reasons why a client might update a roster item:
   1.  Adding a group
   2.  Deleting a group
   3.  Changing the handle
   4.  Deleting the handle

   * @param subscription 
   */
  async sendRosterSet(jid: string, name?: string, subscription?: "remove"): Promise<void> {
    const rosterSetResult = await this.xmpp.sendIq("set", {}, rosterSet(jid, name, subscription))
    detectErrors(rosterSetResult)
  }

  authorizeSubscription(jid: string, message?: string) {
    this.xmpp.sendPresence({ to: jid, type: "subscribed" }, (message && createElement("status", {}, message)) || undefined)
  }

  unauthorizeSubscription(jid: string, message?: string) {
    this.xmpp.sendPresence({ to: jid, type: "unsubscribed" }, (message && createElement("status", {}, message)) || undefined)
  }

  onRosterPush(callback: (item: RosterItem, roster: RosterItem[]) => void) {
    const subscription = this.xmpp.on({ tagName: "iq" }, (element) => {
      const query = isElement(element.firstChild) && element.firstChild.tagName === "query" && element.firstChild
      if (!query) {
        return
      }
      if (query.getAttribute("xmlns") === Namespaces.ROSTER && isElement(query.firstChild)) {
        const { subscription, jid, name } = fromElement<RosterItem>(query.firstChild)
        const rosterItem = { subscription, jid, name }
        if (["none", "to", "from", "both", "remove"].includes(subscription)) {
          this.state = rosterReducer(this.state, rosterItem)
          callback(rosterItem, this.state.slice())
          /**
           * As mandated by the semantics of the IQ stanza as defined in
           * [XMPP-CORE], each resource that receives a roster push from the
           * server is supposed to reply with an IQ stanza of type "result" or
           * "error" (however, it is known that many existing clients do not reply
           * to roster pushes).
           */
        }
      }
    })
    return subscription
  }
}
