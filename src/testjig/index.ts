/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { randomUUID } from "../lib/crypto/crypto.ponyfill"
import { getBareJidFromJid, getDomain, getNodeFromJid, getResourceFromJid } from "../lib/xmpp/jid"
import { XMPPConnection } from "../lib/xmpp/XMPPConnection"
import authForm from "./authForm"
import connectionStatusIndicator from "./connectionStatusIndicator"
import { discoServerSectionComponent } from "./disco"
import { rosterComponent } from "./roster"

const container = document.getElementById("app")!
let connection = new XMPPConnection()

let authData = {
  url: localStorage.getItem("xmpp-server-url") ?? "",
  user: localStorage.getItem("xmpp-user") ?? "",
  password: localStorage.getItem("xmpp-password") ?? "",
}

function connect() {
  connection.connect({
    url: authData.url,
    auth: {
      authcid: getNodeFromJid(authData.user)!,
      authzid: getBareJidFromJid(authData.user)!,
      domain: getDomain(authData.user)!,
      resource: getResourceFromJid(authData.user) + randomUUID().slice(30),
      pass: authData.password.trim(),
    },
  })
}

if (authData.url && authData.user && authData.password) {
  connect()
} else {
  const authElement = document.createElement("div")
  container.append(authElement)
  authForm(authElement, authData, (data) => {
    authData = { url: data.url ?? "", user: data.user ?? "", password: data.password ?? "" }
    localStorage.setItem("xmpp-server-url", data.url ?? "")
    localStorage.setItem("xmpp-user", data.user ?? "")
    localStorage.setItem("xmpp-password", data.password ?? "")
    connect()
    authElement.remove()
  })
}

const updater = connectionStatusIndicator(container)
connection.onConnectionStatusChange((c) => {
  updater(c.toString())
})

const actionsElement = document.createElement("div")
function addAction(actionName: string, action: () => void) {
  const btn = document.createElement("button")
  btn.textContent = actionName
  btn.addEventListener("click", action)
  actionsElement.append(btn)
}

addAction("send presence", () => connection.sendPresence())
addAction("connect", () => connect())
addAction("disconnect", () => connection.disconnect())
container.append(actionsElement)

const rosterElement = document.createElement("div")
container.append(rosterElement)
rosterComponent(connection, rosterElement)

const discoServerSection = document.createElement("div")
container.append(discoServerSection)
discoServerSectionComponent(connection, discoServerSection)
