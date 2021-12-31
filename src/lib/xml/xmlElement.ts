export type XmlAttributes = { [key: string]: string | undefined }

export interface XmlElement {
  tagName: string
  attrs?: XmlAttributes
  children?: XmlNode
}

export type XmlNode = string | XmlElement | (XmlElement | string)[]
