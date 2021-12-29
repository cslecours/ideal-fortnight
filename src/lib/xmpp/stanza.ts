import { createElement as h } from "../xml/createElement"
import { XmlNode } from "../xml/xmlElement"
import { Namespaces } from "./namespaces"

export type IqStanzaAttrs = { id: string } & ({ to: string } | { from: string } | Record<string, string | never>)
export function iqStanza(type: "set" | "get", attrs: IqStanzaAttrs, children: XmlNode) {
  return h("iq", { type, xmlns: Namespaces.CLIENT, ...attrs }, children)
}

type PresenceAttrs = { hash: "sha-1"; node: string; ver: string }
export function presenceStanza({ hash, node, ver }: PresenceAttrs) {
  return h("presence", { xmlns: Namespaces.CLIENT }, h("c", { xmlns: Namespaces.CAPS, hash, node, ver }))
}

export function queryStanzaPart(attrs: { xmlns: string; [s: string]: string }, children?: XmlNode) {
  return h("query", attrs, children)
}
