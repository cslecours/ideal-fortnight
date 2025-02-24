import { LitElement, html, css, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { repeat } from "lit/directives/repeat.js"
import { withCarbons } from "../../lib/xmpp/plugins/Carbon"
import { withStreamManagement } from "../../lib/xmpp/plugins/StreamManagement"
import { XMPPConnection } from "../../lib/xmpp/XMPPConnection"
import "./AppLayout"
import { getBareJidFromJid, getDomain, getNodeFromJid, getResourceFromJid } from "../../lib/xmpp/jid"

import "./AuthForm"
import { XmlElement } from "../../lib/xml/xmlElement"
import { Roster, RosterItem } from "../../lib/xmpp/roster/RosterPlugin"
import { createElement } from "../../lib/xml/createElement"
import { DiscoPlugin } from "../../lib/xmpp/disco/discoPlugin"
import { MessageArchiveManagementPlugin } from "../../lib/xmpp/plugins/MessageArchive"

@customElement("app-component")
export class AppComponent extends LitElement {
  static styles = css``

  connection = withCarbons(withStreamManagement(new XMPPConnection()))
  authData?: { url: string; user: string; password: string }

  @state() status = ""
  @state() jid = ""
  @state() roster: RosterItem[] = []
  @state() messages: Element[] = []

  rosterPlugin = new Roster(this.connection)
  discoPlugin = new DiscoPlugin(this.connection)

  connectedCallback(): void {
    super.connectedCallback()

    this.authData = {
      url: localStorage.getItem("xmpp-server-url") ?? "",
      user: localStorage.getItem("xmpp-user") ?? "",
      password: localStorage.getItem("xmpp-password") ?? "",
    }

    this.connection.onConnectionStatusChange((status) => {
      this.status = status.toString()
      if (status === "connected") {
        this.rosterPlugin.getRoster().then((list) => {
          console.log("Roster", list)
          this.roster = list
        })
        this.connection.sendPresence({ type: "available" })

        const discoInfoQuery = this.discoPlugin.sendDiscoInfoQuery(this.connection.context.domain!)
        discoInfoQuery.then((c) => {
          console.log("Disco Info", c)
        })
        const discoItemQuery = this.discoPlugin.sendDiscoItemQuery(this.connection.context.domain!)
        discoItemQuery.then((x) => {
          console.log("Disco Items", x)
        })

        this.connection.on({ tagName: "presence", xmlns: "jabber:client" }, (el) => {
          const jid = el.getAttribute("from")
          if (jid && this.roster.find((e) => e.jid === jid)) {
            this.rosterPlugin.authorizeSubscription(jid)
          }
        })

        this.rosterPlugin.onRosterPush((item, list) => {
          this.roster = this.rosterPlugin.state
        })
      }
    })
  }

  disconnectedCallback(): void {}

  render() {
    return html`
            <app-layout>
            <div slot="header">
            ${this.status === "connected" ? html`<button @click="${() => this.connection.disconnect()}">Disconnect</button>` : nothing}
            ${this.status === "connecting" ? html`<button disabled>Connecting</button>` : nothing}
            ${this.status === "disconnecting" ? html`<button disabled>Disconnecting</button>` : nothing}
            ${
              this.status === "disconnected"
                ? html`<button @click="${() =>
                    this.connection.connect({
                      url: this.authData!.url,
                      auth: {
                        authcid: getNodeFromJid(this.authData!.user)!,
                        authzid: getBareJidFromJid(this.authData!.user)!,
                        domain: getDomain(this.authData!.user)!,
                        resource: getResourceFromJid(this.authData!.user) + crypto.randomUUID().slice(30),
                        pass: this.authData!.password.trim(),
                      },
                    })}">Connect</button>`
                : nothing
            }
            <button @click="${() => (this.shadowRoot?.getElementById("settingsDialog") as HTMLDialogElement).showModal()}">Settings</button>
            <dialog id="settingsDialog">
              <auth-form method="dialog" @submit="${(e) => {
                this.authData = e.detail
                localStorage.setItem("xmpp-server-url", e.detail.url ?? "")
                localStorage.setItem("xmpp-user", e.detail.user ?? "")
                localStorage.setItem("xmpp-password", e.detail.password ?? "")
                this.shadowRoot?.querySelector<HTMLDialogElement>("#settingsDialog")?.close()
              }}" .data="${this.authData}"></auth-form>
            </dialog>
            </div>
            <div slot="list">
              ${this.status === "connected" ? this.renderRoster() : html``}
            </div>
            <div slot="subroute" style="height:100%; display:flex; flex-direction: column;">
              ${this.renderChatScreen()}
            </div>
            </app-layout>
        `
  }

  private renderChatScreen() {
    return html`
      <header>${this.jid}</header>
      <hr style="width:100%">
      <div style="overflow-y: auto; height: 100%;">
        ${repeat(
          this.messages,
          (message) => message.getAttribute("id"),
          (message) => {
            const forwardedMessage = message.querySelector("forwarded message")
            return html`<li>${new Date(message.querySelector("delay")?.getAttribute("stamp")).toLocaleTimeString()} : ${forwardedMessage?.getAttribute("from")} <br/> ${forwardedMessage?.querySelector("body")}</li>`
          }
        )}
      </div>
      <hr style="width:100%">
      <div>
        <input type="text" id="text" name="text" />
        <button @click=${(e: MouseEvent) => this.connection.sendMessage({ to: this.jid, type: "chat" }, createElement("body", {}, this.shadowRoot?.querySelector<HTMLInputElement>("#text")?.value) ?? "ERROR_INPUT")}>Send</button>
      </div>
    `
  }
  private renderRoster() {
    return html`
      <button @click=${(e) => {
        const jid = prompt("JID to Add To Roster")
        if (!jid) return
        const name = prompt("Name")
        if (!name) return
        this.rosterPlugin.sendRosterSet(jid, name)
      }}>Add to Roster</button>
      <ul style="padding:0;">${repeat(
        this.roster,
        (item) => item.jid,
        (item) => html`<li @click=${() => this.updateJid(item.jid)}>${item.jid}</li>`
      )}</ul>`
  }

  updateJid(jid: string) {
    this.jid = jid
    new MessageArchiveManagementPlugin(this.connection).query({ jid: jid, max: 10 }, [createElement("after")]).then((result) => {
      this.messages = result.results
      console.log(result)
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-component": AppComponent
  }
}
