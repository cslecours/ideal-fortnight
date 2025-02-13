let myCrypto: typeof crypto
if (typeof crypto === "undefined") {
  myCrypto = require("node:crypto").webcrypto
} else {
  myCrypto = crypto
}

function str2ab(str: string) {
  return new TextEncoder().encode(str)
}

// https://github.com/niklasvh/base64-arraybuffer
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
export const ab2str = (arraybuffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(arraybuffer)
  const len = bytes.length
  let base64 = ""

  for (let i = 0; i < len; i += 3) {
    base64 += chars[bytes[i] >> 2]
    base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)]
    base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)]
    base64 += chars[bytes[i + 2] & 63]
  }

  if (len % 3 === 2) {
    base64 = base64.substring(0, base64.length - 1) + "="
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + "=="
  }

  return base64
}

export const sha1 = async (str: string) => {
  return ab2str(await myCrypto.subtle.digest("SHA-1", str2ab(str)))
}
