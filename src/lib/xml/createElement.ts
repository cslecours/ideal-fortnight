import { XmlNode, XmlElement } from "./xmlElement"

export function createElement<T extends Record<keyof T, string>>(tagName: string, attrs?: T, children?: XmlNode): XmlElement {
  return {
    tagName,
    attrs,
    children: children,
  }
}
