import { getDummyXMLDomDocument, getXmlSerializer } from "./shims"
import { Stanza } from "./stanza"

export function render(stanza: Stanza) {
    const doc = getDummyXMLDomDocument()
    const serializer = getXmlSerializer()

    const result = createDocumentElement(stanza, doc)
    if (Array.isArray(result)) {
        return result.map(c => serializer.serializeToString(c)).join()
    }

    return serializer.serializeToString(result)
}

export function createDocumentElement(stanza: Stanza, doc = getDummyXMLDomDocument()): Element | Element[] | Text {
    if (typeof stanza === 'string') {
        return doc.createTextNode(stanza)
    }
    if (Array.isArray(stanza)) {
        return stanza.map(s => createDocumentElement(s, doc) as Element)
    }

    const { tagName, attrs, children } = stanza

    const element = doc.createElement(tagName)
    if (attrs) {
        Object.entries(attrs).forEach(([attr, value]) => { element.setAttribute(attr, value.toString()) })
    }

    if (children) {
        const childrenElements = createDocumentElement(children, doc)
        if (Array.isArray(childrenElements)) {
            element.append(...childrenElements)
        } else {
            element.append(childrenElements)
        }

    }

    return element as Element
}
