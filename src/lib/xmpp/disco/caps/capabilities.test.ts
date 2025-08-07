import { describe, expect, it } from "vitest"
import { buildCapabilities, toVerHash } from "./capabilities"

describe("capabilities", () => {
  it("works", async () => {
    const capabilities = buildCapabilities(
      [{ category: "client", type: "pc", name: "Exodus 0.9.1" }],
      [
        "http://jabber.org/protocol/caps",
        "http://jabber.org/protocol/disco#info",
        "http://jabber.org/protocol/disco#items",
        "http://jabber.org/protocol/muc",
      ]
    )
    const result = await toVerHash(capabilities)
    expect(result).toBe("QgayPKawpkPSDYmwT/WM94uAlu0=")
  })

  it("kinda works", async () => {
    const caps = {
      identities: [
        {
          name: "ejabberd",
          type: "im",
          category: "server",
        },
      ],
      features: [
        "http://jabber.org/protocol/commands",
        "http://jabber.org/protocol/disco#info",
        "http://jabber.org/protocol/disco#items",
        "http://jabber.org/protocol/offline",
        "iq",
        "jabber:iq:last",
        "jabber:iq:version",
        "msgoffline",
        "presence",
        "urn:xmpp:carbons:2",
        "urn:xmpp:carbons:rules:0",
        "urn:xmpp:mam:0",
        "urn:xmpp:mam:1",
        "urn:xmpp:mam:2",
        "urn:xmpp:mam:tmp",
        "urn:xmpp:ping",
        "vcard-temp",
      ],
      formTypes: ["http://jabber.org/network/serverinfo"],
    }
    const hash = await toVerHash(caps)
    expect(hash).toBe("y+MrivqrOho22bVoG3kFFvnNx1A=")
  })
})
