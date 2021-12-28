import { isElement, isTextNode } from "./parseXml"

export function fromElement(element: Element): BasicReturnType {
  return fromElementToObject(element)
}

interface BasicReturnType extends Record<Exclude<"items" | "children", string>, string | boolean | null> {
  tagName: string
  items?: (BasicReturnType | string | boolean)[]
  children?: (BasicReturnType | string | boolean)[]
}

function fromElementToObject(element: Element): BasicReturnType

// This code can probably be simplified, the items mapping could be moved elsewhere.
function fromElementToObject(element: Element): BasicReturnType | boolean | string | null {
  if (element.attributes.length === 0 && element.childNodes.length === 0) {
    return true
  }

  if (element.attributes.length === 0 && element.childNodes.length === 1 && !!element.firstChild) {
    if (isTextNode(element.firstChild)) {
      return element.firstChild.textContent
    }
    if (isElement(element.firstChild)) {
      return fromElementToObject(element.firstChild)
    }
  }

  if (element.childNodes.length > 0 && Array.from(element.childNodes).every((x) => isElement(x) && x.tagName + "s" === element.tagName)) {
    return {
      tagName: element.tagName,
      items: Array.from(element.childNodes)
        .map((x) => fromElementToObject(x as Element))
        .filter(<T>(x: T): x is NonNullable<T> => !!x),
      ...Object.fromEntries(Array.from(element.attributes).map((attr) => [attr.name, element.getAttribute(attr.name)])),
    }
  }

  if (element.childNodes.length !== 1) {
    return {
      tagName: element.tagName,
      ...Object.fromEntries(Array.from(element.attributes).map((attr) => [attr.name, element.getAttribute(attr.name)])),
      ...(element.childNodes.length > 1 && {
        children: Array.from(element.childNodes)
          .map((x) => fromElementToObject(x as Element))
          .filter(<T>(x: T): x is NonNullable<T> => !!x),
      }),
    }
  }

  if (element.childNodes.length === 1) {
    return {
      tagName: element.tagName,
      ...Object.fromEntries(Array.from(element.attributes).map((attr) => [attr.name, element.getAttribute(attr.name)])),
      ...Object.fromEntries(
        Array.from(element.childNodes).map((node) => {
          const childElement = node as Element
          return [childElement.tagName, fromElementToObject(childElement)]
        })
      ),
    }
  }

  return null
}
