import { createElement } from "../lib/xml/createElement"
import { getBareJidFromJid, getDomain, getNodeFromJid, getResourceFromJid } from "../lib/xmpp/jid"
import { Namespaces } from "../lib/xmpp/namespaces"
import { VCardTempPlugin } from "../lib/xmpp/plugins/VCardPlugin"

import authForm from "./authForm"
import connectionStatusIndicator from "./connectionStatusIndicator"
import { discoServerSectionComponent } from "./disco"
import { rosterComponent } from "./roster"

import "./components/AppComponent.js"
import { AppComponent } from "./components/AppComponent.js"

const appComponent = document.createElement("app-component") as AppComponent
document.getElementById("app")!.appendChild(appComponent)

// function connect() {
//   connection.connect({
//     url: authData.url,
//     auth: {
//       authcid: getNodeFromJid(authData.user)!,
//       authzid: getBareJidFromJid(authData.user)!,
//       domain: getDomain(authData.user)!,
//       resource: getResourceFromJid(authData.user) + crypto.randomUUID().slice(30),
//       pass: authData.password.trim(),
//     },
//   })
// }

// try {
//   connect()
// } catch (e) {
//   const authElement = document.createElement("div")
//   authElement.slot = "header"
//   appLayout.append(authElement)
//   authForm(authElement, authData, (data) => {
//     console.log("SUBMIT", data)
//     authData = { url: data.url ?? "", user: data.user ?? "", password: data.password ?? "" }
//     localStorage.setItem("xmpp-server-url", data.url ?? "")
//     localStorage.setItem("xmpp-user", data.user ?? "")
//     localStorage.setItem("xmpp-password", data.password ?? "")
//     connect()
//     authElement.remove()
//   })
// }

// const updater = connectionStatusIndicator(appLayout)
// connection.onConnectionStatusChange((c) => {
//   updater(c.toString())
// })

// const actionsElement = document.createElement("div")
// function addAction(actionName: string, action: () => void) {
//   const btn = document.createElement("button")
//   btn.textContent = actionName
//   btn.addEventListener("click", action)
//   actionsElement.append(btn)
// }

// addAction("send presence", () => connection.sendPresence())
// addAction("connect", () => connect())
// addAction("disconnect", () => connection.disconnect())
// addAction("retrieve your vCard", () => vCardPlugin.retrieveInfo().then(console.log))
// addAction("retrieve a vCard", () => vCardPlugin.retrieveInfo(prompt("JID")!).then(console.log))
// addAction("get subscriptions", () => {
//   connection.sendIq(
//     "get",
//     { to: "conference." + connection.context.domain },
//     createElement("pubsub", { xmlns: Namespaces.PUBSUB }, createElement("subscriptions"))
//   )
// })
// header.appendChild(actionsElement)

// const rosterElement = document.createElement("div")
// rosterElement.slot = "list"
// appLayout.append(rosterElement)
// rosterComponent(connection, rosterElement)

// const discoServerSection = document.createElement("div")
// container.append(discoServerSection)
// discoServerSectionComponent(connection, discoServerSection)
