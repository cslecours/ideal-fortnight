import { render } from "../stanza/render"
import { authResponseStanza } from "./stanza"

describe("stanza", () => {
  it("creates auth response stanza", () => {
    const result = render(authResponseStanza("TOKEN"))
    console.log('MA', result)
    expect(result).toBeTruthy()
  })
})
