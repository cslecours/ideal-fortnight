import { createElement as h } from "../../xml/createElement"

const namespacePrefix = "urn:xmpp:mucsub"

const namespace = `${namespacePrefix}:0`
export const getRoomsSubscriptions = () => {
  return h("subscriptions", { xmlns: namespace })
}

export const subscribeToRoom = (nick?: string) => {
  return h("subscribe", { xmlns: namespace, nick }, h("event", { node: `${namespacePrefix}:nodes:messages` }))
}

export const unsubscribeFromRoom = () => {
  return h("unsubscribe", { xmlns: namespace })
}

export type MucSubSubscriptionType = "presence" | "messages" | "affiliations" | "subscribers" | "config" | "subject" | "system"
export type RoomAffiliation = "member" | "owner" | "admin"
