import { Roster, RosterItem } from "../lib/xmpp/roster/RosterPlugin"
import { XMPPConnection } from "../lib/xmpp/XMPPConnection"

function renderRoster(roster: RosterItem[], element: Element) {
  element.innerHTML = `<table><caption>Roster</caption>
  <tr style="font-weight:bold;"><td>JID</td><td>Name</td><td>Subscription</td></tr>
  ${roster.map((x) => `<tr><td>${x.jid}</td><td>${x.name}</td><td>${x.subscription}</td></tr>`).join("")}
  </table>`
}

export const rosterComponent = (connection: XMPPConnection, element: Element) => {
  const roster = new Roster(connection)
  const rosterEventContainer = document.createElement("div")
  rosterEventContainer.id = "rosterEventContainer"
  element.append(rosterEventContainer)

  const rosterList = document.createElement("div")
  rosterList.id = "rosterList"

  const getRosterBtn = document.createElement("button")
  getRosterBtn.textContent = "Get Roster"
  getRosterBtn.addEventListener("click", () => {
    roster.getRoster().then((list) => renderRoster(list, rosterList))
  })
  rosterEventContainer.append(getRosterBtn)

  const lastRosterUpdate = document.createElement("span")
  rosterEventContainer.append(lastRosterUpdate)

  element.append(rosterList)
  roster.onRosterPush((item, list) => {
    lastRosterUpdate.innerHTML = `Last update ${new Date().toTimeString()}: ${item.jid} - ${item.name} - ${item.subscription}`
    renderRoster(list, rosterList)
  })
}
