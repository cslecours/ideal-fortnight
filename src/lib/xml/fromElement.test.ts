import { describe, expect, it } from "vitest"
import { Namespaces } from "../xmpp/namespaces"
import { fromElement } from "./fromElement"
import { parseXml } from "./parseXml"

describe("fromElement", () => {
  it("works", () => {
    const xml = `<stream:features xmlns:stream='http://etherx.jabber.org/streams'><bind xmlns='urn:ietf:params:xml:ns:xmpp-bind'/><session xmlns='urn:ietf:params:xml:ns:xmpp-session'><optional/></session><c ver='y+MrivqrOho22bVoG3kFFvnNx1A=' node='http://www.process-one.net/en/ejabberd/' hash='sha-1' xmlns='http://jabber.org/protocol/caps'/><sm xmlns='urn:xmpp:sm:2'/><sm xmlns='urn:xmpp:sm:3'/><csi xmlns='urn:xmpp:csi:0'/></stream:features>`
    const element = parseXml(xml)
    const result = fromElement(element)
    expect(result).toStrictEqual({
      tagName: "stream:features",
      "xmlns:stream": Namespaces.STREAM,
      children: [
        {
          tagName: "bind",
          xmlns: Namespaces.BIND,
        },
        {
          tagName: "session",
          optional: true,
          xmlns: Namespaces.SESSION,
        },
        {
          tagName: "c",
          xmlns: Namespaces.CAPS,
          hash: "sha-1",
          node: "http://www.process-one.net/en/ejabberd/",
          ver: "y+MrivqrOho22bVoG3kFFvnNx1A=",
        },
        {
          tagName: "sm",
          xmlns: "urn:xmpp:sm:2",
        },
        {
          tagName: "sm",
          xmlns: "urn:xmpp:sm:3",
        },
        {
          tagName: "csi",
          xmlns: "urn:xmpp:csi:0",
        },
      ],
    })
  })

  it("works too", () => {
    const xml = `<stream:features xmlns:stream='http://etherx.jabber.org/streams'><mechanisms xmlns='urn:ietf:params:xml:ns:xmpp-sasl'><mechanism>PLAIN</mechanism></mechanisms></stream:features>`
    const element = parseXml(xml)
    const result = fromElement(element)
    expect(result).toStrictEqual({
      tagName: "stream:features",
      "xmlns:stream": Namespaces.STREAM,
      mechanisms: { items: ["PLAIN"], xmlns: Namespaces.SASL, tagName: "mechanisms" },
    })
  })
})
