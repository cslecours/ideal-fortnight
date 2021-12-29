import { buildCapabilities } from "./capabilities"

export const fromDiscoResult = (element: Element) => {
  const identities = Array.from(element.getElementsByTagName("identity")).map((identity) => {
    return {
      name: identity.getAttribute("name") ?? "",
      type: identity.getAttribute("type") ?? "",
      category: identity.getAttribute("category") ?? "",
    }
  })

  const features = Array.from(element.getElementsByTagName("feature")).map((x) => x.getAttribute("var") ?? "")

  const formTypes = Array.from(element.getElementsByTagName("value")).map((value) => value.textContent ?? "")

  return buildCapabilities(identities, features, formTypes)
}
