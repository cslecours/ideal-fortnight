import { XmlAttributes, XmlElement } from "../xml/xmlElement"
import { IqStanzaAttrs } from "./stanza"
import { XMPPConnectionState } from "./XMPPConnection"

export interface XMPPPluginAPI {
  context: { domain?: string }
  sendAsync<T>(element: XmlElement, mapFilter: (e: Element) => T, msTimeout?: number): Promise<T>
  sendMessage(attrs: { to: string; type: string }, children?: XmlElement): void
  sendPresence(attrs: { to?: string; type?: string }, children?: XmlElement): void
  sendIq(type: "set" | "get", attrs: Omit<IqStanzaAttrs, "id"> & XmlAttributes, stanza: XmlElement): Promise<Element>
  on(filter: { tagName: string; xmlns?: string }, callback: (e: Element) => void | XmlElement): () => void
  onConnectionStatusChange(callback: (status: XMPPConnectionState) => void): () => void
}
