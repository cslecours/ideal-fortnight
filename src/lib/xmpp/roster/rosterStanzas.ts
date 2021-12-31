import { createElement as h } from "../../xml/createElement"
import { XmlNode } from "../../xml/xmlElement"
import { Namespaces } from "../namespaces"
import { queryStanzaPart } from "../stanza"

const rosterQuery = (children?: XmlNode) => queryStanzaPart({ xmlns: Namespaces.ROSTER }, children)

export const rosterGet = () => rosterQuery()

export const rosterSet = (jid: string, name?: string, subscription?: string) => rosterQuery(h("item", { jid, subscription, name }))
