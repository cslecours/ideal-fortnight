import { createElement } from "../../xml/createElement"
import { isElement } from "../../xml/parseXml"
import { XmlElement } from "../../xml/xmlElement"
import { Namespaces } from "../namespaces"
import { iqStanza, queryStanzaPart } from "../stanza"
import { detectErrors } from "../xmpp.errors"
import { XMPPConnection } from "../XMPPConnection"

const xmlns = "urn:xmpp:mam:2"

export interface QueryOptions {
  jid: string
  queryid?: string
  before?: string
  after?: string
  max?: number
}

export interface QueryResult {
  results: Element[]
  set: { count?: number }
  hasNextPage: boolean
  nextPageParams: () => false | QueryOptions
  previousPageParams: () => false | QueryOptions
}

export class MessageArchiveManagementPlugin {
  constructor(private xmpp: XMPPConnection) {}

  query(options: QueryOptions, queryChildren: XmlElement[] = []): Promise<QueryResult> {
    const result: Element[] = []
    const id = crypto.randomUUID()
    const queryid = options.queryid ?? crypto.randomUUID()
    const xmppRequest = this.xmpp.sendAsync(
      iqStanza(
        "set",
        { to: options.jid, from: this.xmpp.jid, id: id },
        queryStanzaPart({ xmlns: xmlns, queryid: options.queryid }, [
          ...queryChildren,
          createElement("set", { xmlns: Namespaces.RSM }, [
            createElement("max", {}, `${options.max ?? " "}`),
            ...(!options.after || options.before ? [createElement("before", {}, `${options.before ?? ""}`)] : []),
            ...(options.after ? [createElement("after", {}, `${options.after}`)] : []),
          ]),
        ])
      ),
      (e) => {
        if (e.tagName === "message" && e.querySelector("result")?.getAttribute("queryid") === queryid) {
          // UNSURE WHEN TO STOP
          result.push(e)
        }
        if (e.tagName === "iq" && e.getAttribute("from") === options.jid && e.getAttribute("id") === id) {
          if (e.getAttribute("type") === "error") {
            detectErrors(e)
          }
          const finElement = e.getElementsByTagName("fin").item(0)
          const setElement = finElement?.getElementsByTagName("set").item(0)
          if (!finElement || !setElement) {
            throw new Error("expected a set element in the last archive message")
          }

          const fin: { complete: boolean } = {
            complete: finElement.getAttribute("complete") === "true",
          }
          const set: { count?: number; first?: string; last?: string } = {
            count: parseInt(setElement.getElementsByTagName("count").item(0)?.textContent ?? ""),
            first: setElement.getElementsByTagName("first").item(0)?.textContent ?? undefined,
            last: setElement.getElementsByTagName("last").item(0)?.textContent ?? undefined,
          }

          const currentSet = {
            count: result.length,
            first: (result?.[0]?.firstChild as Element)?.id,
            last: (result?.[result.length - 1]?.firstChild as Element)?.id,
          }

          // https://xmpp.org/extensions/xep-0297.html Stanza Forwarding

          console.log(currentSet)

          return {
            results: result,
            hasNextPage: !fin.complete,
            nextPageParams: () => {
              return !fin.complete && { jid: options.jid, queryid: crypto.randomUUID(), max: options.max, after: currentSet.last }
            },
            previousPageParams: () => {
              return { jid: options.jid, queryid: crypto.randomUUID(), max: options.max, before: currentSet.first }
            },
            fin: fin,
            set: set,
          }
        }
        return null
      }
    )
    return xmppRequest
  }
}
