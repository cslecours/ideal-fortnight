import { createElement as h } from "../../xml/createElement"

const namespace = "urn:xmpp:mucsub:0"
export const getRoomsSubscriptions = () => {
  return h("subscriptions", { xmlns: namespace })
}

export const subscribeToRoom = () => {
  return h("subscribe", { xmlns: namespace })
}

export type MucSubSubscriptionType = "presence" | "messages" | "affiliations" | "subscribers" | "config" | "subject" | "system"
