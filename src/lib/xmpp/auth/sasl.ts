import { toB64 } from "../../crypto/b64"
import type { AuthData } from "./auth.models"

export function plainAuthChallenge({ authcid, authzid, domain, pass }: AuthData) {
  // Only include authzid if it differs from authcid.
  // See: https://tools.ietf.org/html/rfc6120#section-6.3.8

  const auth_str = [authzid !== `${authcid}@${domain}` ? authzid : "", authcid, pass].join("\u0000")
  return toB64(utf16to8(auth_str))
}

export function xOauth2Challenge({ authzid, pass }: AuthData) {
  const auth_str = ["", authzid, pass].join("\u0000")
  return toB64(utf16to8(auth_str))
}

function utf16to8(str: string) {
  let i, c
  let out = ""
  for (i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    if (c >= 0x0000 && c <= 0x007f) {
      out += str.charAt(i)
    } else if (c > 0x07ff) {
      out += String.fromCharCode(0xe0 | ((c >> 12) & 0x0f))
      out += String.fromCharCode(0x80 | ((c >> 6) & 0x3f))
      out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f))
    } else {
      out += String.fromCharCode(0xc0 | ((c >> 6) & 0x1f))
      out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f))
    }
  }
  return out
}
