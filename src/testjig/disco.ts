import { DiscoPlugin } from "../lib/xmpp/disco/discoPlugin"
import { type XMPPConnection, XMPPConnectionState } from "../lib/xmpp/XMPPConnection"

export const discoServerSectionComponent = (connection: XMPPConnection, element: Element) => {
  connection.onConnectionStatusChange((c) => {
    if (c !== XMPPConnectionState.Connected) {
      return
    }
    element.innerHTML = "DISCO"
    const disco = new DiscoPlugin(connection)

    const discoInfoElement = document.createElement("pre")
    element.append(discoInfoElement)

    const discoItemElement = document.createElement("pre")
    element.append(discoItemElement)

    disco.sendDiscoInfoQuery(connection.context.domain!).then((x) => {
      discoInfoElement.innerHTML = JSON.stringify(x, undefined, 2)
    })

    const discoItemQuery = disco.sendDiscoItemQuery(connection.context.domain!)

    discoItemQuery.then((x) => {
      x.forEach((y) => {
        disco.sendDiscoInfoQuery(y.jid).then((result) => (discoItemElement.innerHTML += "\n" + JSON.stringify(result, undefined, 2)))
        disco.sendDiscoItemQuery(y.jid).then((result) => (discoItemElement.innerHTML += "\n" + JSON.stringify(result, undefined, 2)))
      })
    })

    discoItemQuery.then((x) => {
      discoItemElement.innerHTML = JSON.stringify(x, undefined, 2)
    })
  })
}
