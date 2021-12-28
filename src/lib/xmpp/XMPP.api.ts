import { XmlElement } from "../xml/xmlElement"

export interface XMPPPluginAPI {
  sendAsync<T>(element: XmlElement, mapFilter: (e: Element) => T, msTimeout?: number): Promise<T>
  sendIq<T>(type: "set" | "get", stanza: XmlElement): Promise<Element>
  on(filter: { tagName: string; xmlns: string }, callback: (e: Element) => Element): void
}
