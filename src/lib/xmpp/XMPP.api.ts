import { XmlElement } from "../xml/xmlElement"

export interface XMPPPluginAPI {
  sendAsync<T>(element: XmlElement, mapFilter: (e: Element) => T, msTimeout?: number): Promise<T>
}
