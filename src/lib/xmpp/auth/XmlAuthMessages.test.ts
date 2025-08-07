import { describe, it, expect } from "vitest"
import { render } from "../../xml/render"
import { authResponseStanza } from "./XmlAuthMessages"

describe("stanza", () => {
  it("creates auth response stanza", () => {
    const result = render(authResponseStanza("TOKEN"))
    expect(result).toBeTruthy()
  })
})
