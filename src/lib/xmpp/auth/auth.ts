import { isElement } from "../../xml/parseXml"
import { Namespaces } from "../namespaces"
import { XMPPPluginAPI } from "../XMPP.api"
import { SASLError } from "../xmpp.errors"
import { AuthData } from "./auth.models"
import { plainAuthChallenge, xOauth2Challenge } from "./sasl"
import { authStanza } from "./XmlAuthMessages"

export async function doAuth(xmpp: XMPPPluginAPI, mechanisms: string[], auth: AuthData) {
  const authMechanism: Record<string, typeof plainAuthChallenge> = {
    PLAIN: plainAuthChallenge,
    "X-OAUTH2": xOauth2Challenge,
  }

  for (const mechanism of mechanisms) {
    if (mechanism in authMechanism) {
      const authChallenge = authMechanism[mechanism]
      const authResult = await xmpp.sendAsync(authStanza(mechanism, authChallenge(auth)), handleAuthResult)
      if (authResult) {
        return true
      }
    }
  }
}

export function handleAuthResult(element: Element): true | null {
  if (!element || !isElement(element) || element.getAttribute("xmlns") !== Namespaces.SASL) {
    return null
  }

  if (element.tagName === "failure") {
    throw new SASLError()
  }
  if (element.tagName === "success") {
    return true
  }
  throw new Error(`Not supported ${element.tagName}`)
}
