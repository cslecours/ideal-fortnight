import { createElement as h } from "../../xml/createElement"
import { XmlNode } from "../../xml/xmlElement"
import { Namespaces } from "./../namespaces"

export function openStanza(to: string) {
  return h("open", { xmlns: Namespaces.FRAMING, to, version: "1.0", "xml:lang": "en" })
}

export function authStanza(mechanism: string, children: XmlNode) {
  return h("auth", { xmlns: Namespaces.SASL, mechanism }, children)
}

export function authResponseStanza(response: string) {
  return h("response", { xmlns: Namespaces.SASL }, response)
}

export function bindStanza(ressource: string) {
  return h("bind", { xmlns: Namespaces.BIND }, h("ressource", {}, ressource))
}

export function sessionStanza() {
  return h("session", { xmlns: Namespaces.SESSION })
}
