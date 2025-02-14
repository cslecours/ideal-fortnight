import { createElement } from "../lib/xml/createElement"
import { getBareJidFromJid, getDomain, getNodeFromJid, getResourceFromJid } from "../lib/xmpp/jid"
import { Namespaces } from "../lib/xmpp/namespaces"
import { withCarbons } from "../lib/xmpp/plugins/Carbon"
import { withStreamManagement } from "../lib/xmpp/plugins/StreamManagement"
import { VCardTempPlugin } from "../lib/xmpp/plugins/VCardPlugin"
import { XMPPConnection } from "../lib/xmpp/XMPPConnection"
import authForm from "./authForm"
import connectionStatusIndicator from "./connectionStatusIndicator"
import { discoServerSectionComponent } from "./disco"
import { rosterComponent } from "./roster"

const container = document.getElementById("app")!
const connection = withCarbons(withStreamManagement(new XMPPConnection()))

const vCardPlugin = new VCardTempPlugin(connection)

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
      resource: getResourceFromJid(authData.user) + crypto.randomUUID().slice(30),
      pass: authData.password.trim(),
    },
  })
}

try {
  connect()
} catch (e) {
  const authElement = document.createElement("div")
  container.append(authElement)
  authForm(authElement, authData, (data) => {
    console.log("SUBMIT", data)
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
addAction("retrieve your vCard", () => vCardPlugin.retrieveInfo().then(console.log))
addAction("get subscriptions", () => {
  connection.sendIq(
    "get",
    { to: "conference." + connection.context.domain },
    createElement("pubsub", { xmlns: Namespaces.PUBSUB }, createElement("subscriptions"))
  )
})
container.append(actionsElement)

const rosterElement = document.createElement("div")
container.append(rosterElement)
rosterComponent(connection, rosterElement)

const discoServerSection = document.createElement("div")
container.append(discoServerSection)
discoServerSectionComponent(connection, discoServerSection)
