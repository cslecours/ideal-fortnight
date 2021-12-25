export type XmlAttributes = { [key: string]: string }

export interface XmlElement {
  tagName: string
  attrs?: XmlAttributes
  children?: XmlNode
}

export type XmlNode = string | XmlElement | (XmlElement | string)[]
