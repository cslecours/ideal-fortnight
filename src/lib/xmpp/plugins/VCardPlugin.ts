import { createElement } from "../../xml/createElement"
import { fromElement } from "../../xml/fromElement"
import { isElement } from "../../xml/parseXml"
import { XMPPPluginAPI } from "../XMPP.api"

// https://xmpp.org/extensions/xep-0054.html
export class VCardTempPlugin {
  constructor(private xmpp: XMPPPluginAPI) {}

  /**
   * Retrieve your own vCard by sending a request with no "to" parameter
   * @param to
   */
  async retrieveInfo(to?: string): Promise<VCard | null> {
    const result = await this.xmpp.sendIq("get", { to: to }, createElement("vCard", { xmlns: "vcard-temp" }))
    const vCard = result.firstChild
    if (isElement(vCard) && vCard.tagName === "vCard") {
      return parseVCard(vCard)
    }
    return null
  }
}

function parseVCard(element: Element): VCard {
  return Array.from(element.childNodes).reduce((acc, current) => {
    if (isElement(current)) {
      const tag = current.tagName.toLowerCase()
      switch (tag) {
        case "fn":
          acc.fn = current.textContent ?? ""
          break
        case "n":
          acc.n = {
            family: current.getElementsByTagName("FAMILY").item(0)?.textContent ?? "",
            given: current.getElementsByTagName("GIVEN").item(0)?.textContent ?? "",
          }
          break
        case "email":
          acc.email = current.textContent ?? ""
          break
        case "role":
          acc.role = current.textContent ?? ""
          break
        case "photo":
          acc.photo = current.textContent ?? ""
          break
      }
    }

    return acc
  }, {} as VCard)
}

interface VCard {
  fn: string
  n: { family: string; given: string }
  email: string
  role: string
  photo: string
}
