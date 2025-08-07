import { featureDetection, hasFeature, isStreamFeatures } from "./featureDetection"
import { Namespaces } from "../namespaces"
import { parseXml } from "../../xml/parseXml"
import { describe, it, expect } from "vitest"

describe("featureDetection", () => {
  it("works", () => {
    const element = parseXml(
      "<stream:features xmlns:stream='http://etherx.jabber.org/streams'><mechanisms xmlns='urn:ietf:params:xml:ns:xmpp-sasl'><mechanism>PLAIN</mechanism></mechanisms></stream:features>"
    )
    expect(isStreamFeatures(element)).toBe(true)

    const features = featureDetection(element)
    const saslFeature = hasFeature(features, "mechanisms", Namespaces.SASL)
    expect(saslFeature).toStrictEqual(["PLAIN"])
  })
})
