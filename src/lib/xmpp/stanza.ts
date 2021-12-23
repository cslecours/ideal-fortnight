import { fromB64 } from "../b64"
import { createElement as h } from "../stanza/createElement"
import { Stanza } from "../stanza/stanza"
import { Namespaces } from "./namespaces"

export function openStanza(to: string) {
  return h("open", { xmlns: Namespaces.FRAMING, to, version: "1.0" })
}

export function plainAuthStanza(children: Stanza) {
  return h("auth", { xmlns: Namespaces.SASL, mechanism: "PLAIN" }, children)
}

export function authResponseStanza(response: string) {
  return h("response", { xmlns: Namespaces.SASL }, fromB64(response))
}

type IqStanzaAttrs = { id: string } & ({ to: string } | { from: string })
export function iqStanza(type: "set" | "get", attrs: IqStanzaAttrs, children: Stanza) {
  return h("iq", { type, xmlns: Namespaces.CLIENT, ...attrs }, children)
}

type PresenceAttrs = { hash: "SHA-1"; ver: string }
export function presenceStanza({ hash, ver }: PresenceAttrs) {
  return h("presence", { xmlns: Namespaces.CLIENT }, h("c", { xmlns: Namespaces.CAPS, hash, ver }))
}
