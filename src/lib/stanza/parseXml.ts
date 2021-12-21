import { getXMLParser } from "./shims"

let _parser: DOMParser | undefined
function getDomParser(): DOMParser {
  if (_parser) {
    return _parser
  }
  return (_parser = getXMLParser())
}

export function parseXml(xml: string) {
  return getDomParser().parseFromString(xml, "text/xml")
}
