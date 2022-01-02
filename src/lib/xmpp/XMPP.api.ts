import { XmlAttributes, XmlElement } from "../xml/xmlElement"
import { IqStanzaAttrs } from "./stanza"

export interface XMPPPluginAPI {
  context: { domain?: string }
  sendAsync<T>(element: XmlElement, mapFilter: (e: Element) => T, msTimeout?: number): Promise<T>
  sendIq(type: "set" | "get", attrs: Omit<IqStanzaAttrs, "id"> & XmlAttributes, stanza: XmlElement): Promise<Element>
  on(filter: { tagName: string; xmlns?: string }, callback: (e: Element) => void | Element): () => void
}
