export function isStreamFeatures(element: Element) {
  return element.tagName === "stream:features"
}

export function featureDetection(element: Element) {
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
      ?.value.map((x) => x.textContent)
      .filter(<T>(x: T): x is NonNullable<T> => !!x)
      .flatMap((x) => x) || null

  return feature
}
