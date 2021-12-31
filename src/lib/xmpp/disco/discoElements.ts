import { createElement as h } from "../../xml/createElement"
import { Namespaces } from "../namespaces"

export const discoInfoQueryStanza = (node: string) => {
  return h("query", { xmlns: Namespaces.DISCO_INFO, node: node })
}
