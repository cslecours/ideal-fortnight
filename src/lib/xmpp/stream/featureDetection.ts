import { parseXml } from "../../stanza/parseXml"

export function isStreamFeatures(message: string) {
  return message.startsWith("<stream:features ")
}

export function featureDetection(message: string) {
  const element = parseXml(message)

  const features = Array.from(element.childNodes) as Element[]

  return features.map((x) => ({
    name: x.tagName,
    xmlns: x.attributes.getNamedItem("xmlns")?.nodeValue,
    value: Array.from(x.childNodes),
  }))
}

export function hasFeature(features: ReturnType<typeof featureDetection> | undefined, featureName: string, xmlns?: string) {
  if (!features) return null

  const feature =
    features
      ?.find((x) => x.name === featureName && (xmlns === undefined || x.xmlns === null || x.xmlns === xmlns))
      ?.value.flatMap((x) => x.textContent) || null

  return feature
}
