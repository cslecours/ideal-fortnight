import { Stanza, StanzaElement } from "./stanza";

export function createElement<T extends Record<keyof T, string>>(tagName: string, attrs?: T, children?: Stanza): StanzaElement {
    return {
        tagName,
        attrs,
        children: children
    }
}
