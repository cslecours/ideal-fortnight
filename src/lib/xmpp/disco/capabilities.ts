// XEP-0115 https://xmpp.org/extensions/xep-0115.html

import { sha1 } from "../../crypto/crypto.ponyfill"

export interface Capabilities {
  identities: { category: string; type: string; name?: string; lang?: string }[]
  features: string[]
}

export function buildCapabilities(identities: Capabilities["identities"], features: Capabilities["features"]) {
  return {
    identities: identities.slice().sort((a, b) => {
      return (
        a.category.localeCompare(b.category) ||
        a.type.localeCompare(b.type) ||
        (a.name ?? "").localeCompare(b.name ?? "") ||
        (a.lang ?? "").localeCompare(b.lang ?? "")
      )
    }),
    features: features.slice().sort(),
  }
}

export function toVerHash(d: ReturnType<typeof buildCapabilities>) {
  const identitiesHash = d.identities.map(({ category, type, lang, name }) => [category, type, lang, name].join("/") + "<")
  const featuresHash = d.features.map((x) => x + "<").join("")
  return sha1(identitiesHash + featuresHash)
}
