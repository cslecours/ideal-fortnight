import { createElement } from "./createElement"
import { render } from "./render"

describe("lib", () => {
  it("works", () => {
    const element = createElement(
      "presence",
      { from: "juliet@capulet.lit/orchard", to: "romeo@montague.lit/lane" },
      createElement("status", undefined, "Available")
    )
    const result = render(element)
    const expected = '<presence from="juliet@capulet.lit/orchard" to="romeo@montague.lit/lane"><status>Available</status></presence>'
    expect(result).toBe(expected)
  })

  it("works for a single element", () => {
    const element = createElement("status", undefined, "Available")
    const result = render(element)
    const expected = "<status>Available</status>"
    expect(result).toBe(expected)
  })

  it("supports streams stanzas", () => {
    const element = createElement("stream:error", undefined, [
      createElement("defined-condition", { xmlns: "urn:ietf:params:xml:xmpp-streams" }),
      createElement("text", { "xmlns": "urn:ietf:params:xml:ns:xmpp-streams", "xml:lang": "langcode" }, "OPTIONAL descriptive text"),
      "[OPTIONAL application-specific condition element]",
    ])
    const result = render(element)
    expect(result).toEqual(
      '<stream:error><defined-condition xmlns="urn:ietf:params:xml:xmpp-streams"/><text xmlns="urn:ietf:params:xml:ns:xmpp-streams" xml:lang="langcode">OPTIONAL descriptive text</text>[OPTIONAL application-specific condition element]</stream:error>'
    )
  })
})
