import { XmlNode, XmlElement, XmlAttributes } from "./xmlElement"

export function createElement<T extends XmlAttributes>(tagName: string, attrs?: T, children?: XmlNode): XmlElement {
  return {
    tagName,
    attrs,
    children: children,
  }
}
