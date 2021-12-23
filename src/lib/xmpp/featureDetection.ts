import { parseXml } from "../stanza/parseXml"

export function isStreamFeatures(message: string) {
  return message.startsWith("<stream:features ")
}

export function featureDetection(message: string) {
  const element = parseXml(message)
  const mechanisms = Array.from(element.getElementsByTagName("mechanism"))

  return {
    mechanisms: mechanisms.map((x) => x.textContent ?? ""),
  }
}
