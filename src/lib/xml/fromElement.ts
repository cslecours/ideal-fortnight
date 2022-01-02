import { isElement, isTextNode } from "./parseXml"

export function fromElement<T>(element: Element, includeTagName: boolean = true): T & BasicReturnType {
  return fromElementToObject(element, includeTagName) as T & BasicReturnType
}

interface BasicReturnType extends Record<Exclude<"items" | "children", string>, string | boolean | null> {
  tagName?: string
  items?: (BasicReturnType | string | boolean)[]
  children?: (BasicReturnType | string | boolean)[]
}

function fromElementToObject(element: Element, includeTagName: boolean): BasicReturnType

// This code can probably be simplified, the items mapping could be moved elsewhere.
function fromElementToObject(element: Element, includeTagName: boolean): BasicReturnType | boolean | string | null {
  if (element.attributes.length === 0 && element.childNodes.length === 0) {
    return true
  }

  if (element.attributes.length === 0 && element.childNodes.length === 1 && !!element.firstChild) {
    if (isTextNode(element.firstChild)) {
      return element.firstChild.textContent
    }
    if (isElement(element.firstChild)) {
      return fromElementToObject(element.firstChild, includeTagName)
    }
  }

  if (element.childNodes.length > 0 && Array.from(element.childNodes).every((x) => isElement(x) && x.tagName + "s" === element.tagName)) {
    return {
      ...((includeTagName && { tagName: element.tagName }) || {}),
      items: Array.from(element.childNodes)
        .map((x) => fromElementToObject(x as Element, includeTagName))
        .filter(<T>(x: T): x is NonNullable<T> => !!x),
      ...Object.fromEntries(Array.from(element.attributes).map((attr) => [attr.name, element.getAttribute(attr.name)])),
    }
  }

  if (element.childNodes.length !== 1) {
    return {
      ...((includeTagName && { tagName: element.tagName }) || {}),
      ...Object.fromEntries(Array.from(element.attributes).map((attr) => [attr.name, element.getAttribute(attr.name)])),
      ...(element.childNodes.length > 1 && {
        children: Array.from(element.childNodes)
          .map((x) => fromElementToObject(x as Element, includeTagName))
          .filter(<T>(x: T): x is NonNullable<T> => !!x),
      }),
    }
  }

  if (element.childNodes.length === 1) {
    return {
      ...((includeTagName && { tagName: element.tagName }) || {}),
      ...Object.fromEntries(Array.from(element.attributes).map((attr) => [attr.name, element.getAttribute(attr.name)])),
      ...Object.fromEntries(
        Array.from(element.childNodes).map((node) => {
          const childElement = node as Element
          return [childElement.tagName, fromElementToObject(childElement, includeTagName)]
        })
      ),
    }
  }

  return null
}
