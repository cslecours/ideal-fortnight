import { describe, expect, it } from "vitest"

import { getDomain } from "./jid"

describe("jid", () => {
  it("works", () => {
    expect(getDomain("jid@domain.com/test")).toBe("domain.com")
  })
})
