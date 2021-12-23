import { featureDetection, isStreamFeatures } from "./featureDetection"

describe("featureDetection", () => {
  it("works", () => {
    const message =
      "<stream:features xmlns:stream='http://etherx.jabber.org/streams'><mechanisms xmlns='urn:ietf:params:xml:ns:xmpp-sasl'><mechanism>PLAIN</mechanism></mechanisms></stream:features>"
    expect(isStreamFeatures(message)).toBe(true)

    const result = featureDetection(message)
    expect(result).toStrictEqual({ mechanisms: ["PLAIN"] })
  })
})
