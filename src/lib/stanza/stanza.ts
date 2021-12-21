export type StanzaAttributes = { [key: string]: string }

export interface StanzaElement {
  tagName: string
  attrs?: StanzaAttributes
  children?: Stanza
}

export type Stanza = string | StanzaElement | (StanzaElement | string)[]
