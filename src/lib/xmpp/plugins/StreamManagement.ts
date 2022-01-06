import { createElement } from "../../xml/createElement"
import { XmlElement } from "../../xml/xmlElement"
import { detectErrors } from "../xmpp.errors"
import { XMPPConnection, XMPPConnectionState } from "../XMPPConnection"
const namespace = "urn:xmpp:sm:3"

export const withStreamManagement = (connection: XMPPConnection) => {
  let smContext: { enabled: boolean; max: number | undefined; id: string | undefined } = { enabled: false, max: undefined, id: undefined }

  const counts = { incoming: 0, outgoing: 0 }
  connection.onOutgoingMessage((message) => {
    if (smContext.enabled) {
      if (["iq", "presence", "query"].includes(message.tagName)) {
        counts.outgoing++
      }
    }
  })
  connection.on([{ tagName: "iq" }, { tagName: "presence" }, { tagName: "query" }], (e) => {
    if (smContext.enabled) {
      counts.incoming++
    }
  })

  connection.on({ tagName: "r" }, (_e) => {
    return createElement("a", { xmlns: namespace, h: counts.incoming.toString() })
  })

  connection.onConnectionStatusChange(async (status) => {
    if (status === XMPPConnectionState.Connected) {
      const canEnable = connection.context.features?.some((x) => x.xmlns === namespace && x.name == "sm")
      if (!canEnable) return

      const result = await connection.sendAsync(enableStreamManagement("true"), (e) => {
        if (e.getAttribute("xmlns") !== namespace) {
          return null
        }
        if (e.tagName === "enabled") {
          smContext = { enabled: true, id: e.getAttribute("id") ?? undefined, max: parseInt(e.getAttribute("max") ?? "") }

          return smContext
        }
        if (e.tagName === "error") {
          detectErrors(e)
        }
      })

      console.log("sm:result", result)
    }
  })
  return connection
}

function enableStreamManagement(resume: "true" | undefined): XmlElement {
  return createElement("enable", { xmlns: namespace, resume: resume })
}

function resumeStream(h: string, previd: string): XmlElement {
  return createElement("resume", { xmlns: namespace, h: h, previd: previd })
}
