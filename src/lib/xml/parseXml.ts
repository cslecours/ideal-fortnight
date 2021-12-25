import { getXMLParser } from "./shims"

let _parser: DOMParser | undefined
function getDomParser(): DOMParser {
  if (_parser) {
    return _parser
  }
  return (_parser = getXMLParser())
}

export function parseXml(xml: string): Element {
  return getDomParser().parseFromString(xml, "text/xml").firstChild as Element
}

export function isElement(node: Node | null): node is Element {
  return !!node && node.nodeType === node.ELEMENT_NODE
}

export function isTextNode(node: Node): node is Text {
  return node.nodeType === node.TEXT_NODE
}
