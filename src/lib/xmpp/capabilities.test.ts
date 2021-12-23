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
})
