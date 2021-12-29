import { XmlElement } from "../xml/xmlElement"
import { IqStanzaAttrs } from "./stanza"

export interface XMPPPluginAPI {
  sendAsync<T>(element: XmlElement, mapFilter: (e: Element) => T, msTimeout?: number): Promise<T>
  sendIq(type: "set" | "get", attrs: Omit<IqStanzaAttrs, "id">, stanza: XmlElement): Promise<Element>
  on(filter: { tagName: string; xmlns: string }, callback: (e: Element) => Element): void
}
