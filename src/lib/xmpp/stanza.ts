import { createElement as h } from "../stanza/createElement"
import { Stanza } from "../stanza/stanza"
import { Namespaces } from "./namespaces"

export function openStanza(to: string) {
  return h("open", { xmlns: Namespaces.FRAMING, to, version: "1.0" })
}

export function authStanza(mechanism: string, children: Stanza) {
  return h("auth", { xmlns: Namespaces.SASL, mechanism }, children)
}

export function authResponseStanza(response: string) {
  return h("response", { xmlns: Namespaces.SASL }, response)
}

type IqStanzaAttrs = { id: string } & ({ to: string } | { from: string } | Record<string, string | never>)
export function iqStanza(type: "set" | "get", attrs: IqStanzaAttrs, children: Stanza) {
  return h("iq", { type, xmlns: Namespaces.CLIENT, ...attrs }, children)
}

export function bindStanza(ressource: string) {
  return h("bind", { xmlns: Namespaces.BIND }, h("ressource", {}, ressource))
}

export function sessionStanza() {
  return h("session", { xmlns: Namespaces.SESSION })
}

type PresenceAttrs = { hash: "sha-1"; ver: string }
export function presenceStanza({ hash, ver }: PresenceAttrs) {
  return h("presence", { xmlns: Namespaces.CLIENT }, h("c", { xmlns: Namespaces.CAPS, hash, ver }))
}
