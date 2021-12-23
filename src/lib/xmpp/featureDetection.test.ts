import { featureDetection, hasFeature, isStreamFeatures } from "./featureDetection"
import { Namespaces } from "./namespaces"

describe("featureDetection", () => {
  it("works", () => {
    const message =
      "<stream:features xmlns:stream='http://etherx.jabber.org/streams'><mechanisms xmlns='urn:ietf:params:xml:ns:xmpp-sasl'><mechanism>PLAIN</mechanism></mechanisms></stream:features>"
    expect(isStreamFeatures(message)).toBe(true)

    const features = featureDetection(message)
    const saslFeature = hasFeature(features, "mechanisms", Namespaces.SASL)
    expect(saslFeature).toStrictEqual(["PLAIN"])
  })
})
