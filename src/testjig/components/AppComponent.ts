import { LitElement, html, css, nothing, PropertyValues } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { repeat } from "lit/directives/repeat.js"
import { withCarbons } from "../../lib/xmpp/plugins/Carbon"
import { resumeStream, withStreamManagement } from "../../lib/xmpp/plugins/StreamManagement"
import { XMPPConnection } from "../../lib/xmpp/XMPPConnection"
import "./AppLayout"
import { getBareJidFromJid, getDomain, getNodeFromJid, getResourceFromJid } from "../../lib/xmpp/jid"

import "./AuthForm"
import { Roster, RosterItem } from "../../lib/xmpp/roster/RosterPlugin"
import { createElement } from "../../lib/xml/createElement"
import { DiscoPlugin } from "../../lib/xmpp/disco/discoPlugin"
import { MessageArchiveManagementPlugin } from "../../lib/xmpp/plugins/MessageArchive"
import { render } from "../../lib/xml/render"
import { parseXml } from "../../lib/xml/parseXml"

@customElement("app-component")
export class AppComponent extends LitElement {
  static styles = css`

  #user-menu button {
    text-align:left;
  }

  #user-menu:popover-open {
    display:flex;
    flex-direction: column;
    justify-items: stretch;
    justify-content: stretch;
    gap: 4px;
    min-width: 200px;
    height: auto;
    position: absolute;
    inset: unset;
    top: 40px;
    right: 1rem;
    border: none;
    background: #444;
  }
  hr {
    width:100%;
    border-style: solid;
    border-color: #777;
  }
  `

  connection = withCarbons(withStreamManagement(new XMPPConnection()))
  authData?: { url: string; user: string; password: string }

  @state() status = ""
  @state() jid = ""
  @state() roster: RosterItem[] = []
  @state() messages: any[] = []
  @state() presence = ""
  presenceData = new Map<string, [string, string]>()

  rosterPlugin = new Roster(this.connection)
  discoPlugin = new DiscoPlugin(this.connection)
  mamPlugin = new MessageArchiveManagementPlugin(this.connection)

  result?: {
    results: Element[]
    set: { count?: number }
    hasNextPage: boolean
    nextPageParams: () => boolean | Parameters<MessageArchiveManagementPlugin["query"]>[0]
    previousPageParams: () => boolean | Parameters<MessageArchiveManagementPlugin["query"]>[0]
  }
  listObserver: MutationObserver

  connectedCallback(): void {
    super.connectedCallback()

    this.authData = {
      url: localStorage.getItem("xmpp-server-url") ?? "",
      user: localStorage.getItem("xmpp-user") ?? "",
      password: localStorage.getItem("xmpp-password") ?? "",
    }

    // Outgoing message
    this.connection.onOutgoingMessage({ tagName: "message" }, (el) => {
      if (this.jid === el.attrs?.to) {
        if (el.children && !Array.isArray(el.children)) {
          el.children = [el.children]
        }
        if (Array.isArray(el.children)) {
          el.children.push(createElement("delay", { stamp: new Date().toISOString() }))
        }

        const parsedElement = parseXml(render(el))
        this.messages = [...this.messages, parsedElement]
      }
    })

    // Outgoing message
    this.connection.on({ tagName: "message" }, (el) => {
      const isRealMessage = !el.querySelector("forwarded")
      if (!isRealMessage) {
        return
      }

      el.appendChild(parseXml(render(createElement("delay", { stamp: new Date().toISOString() }))))
      console.log("Message", el)
      if (this.jid === getBareJidFromJid(el.getAttribute("from")!)) {
        this.messages = [...this.messages, el]
      }
    })

    this.connection.on({ tagName: "presence", xmlns: "jabber:client" }, (el) => {
      const jid = el.getAttribute("from")
      if (jid && this.roster.find((e) => e.jid === jid)) {
        this.rosterPlugin.authorizeSubscription(jid)
      }
    })

    this.connection.on({ tagName: "presence", xmlns: "jabber:client" }, (el: Element) => {
      const jid = el.getAttribute("from")
      const type = el.getAttribute("type")

      if (jid) {
        console.log("SETTING", getBareJidFromJid(jid), type, el.innerHTML)
        this.presenceData.set(getBareJidFromJid(jid), [type ?? "", type ?? ""])
      }
    })

    this.rosterPlugin.onRosterPush((item, list) => {
      this.roster = this.rosterPlugin.state
    })

    this.connection.onConnectionStatusChange((status) => {
      this.status = status.toString()
      if (status !== "connected") {
        this.presence = ""
      }
      if (status === "connected") {
        this.rosterPlugin.getRoster().then((list) => {
          console.log("Roster", list)
          this.roster = list
          this.jid = this.roster.find(Boolean)?.jid!
        })
        this.presence = "chat"
        this.connection.sendPresence({ type: "available" })

        const discoInfoQuery = this.discoPlugin.sendDiscoInfoQuery(this.connection.context.domain!)
        discoInfoQuery.then((c) => {
          console.log("Disco Info", c)
        })
        const discoItemQuery = this.discoPlugin.sendDiscoItemQuery(this.connection.context.domain!)
        discoItemQuery.then((x) => {
          console.log("Disco Items", x)
        })
      }
    })

    this.attemptConnection()
  }

  @state() isScrolledToBottom = true

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties)
    if (this.shadowRoot?.querySelector("#messages")) {
      this.listObserver = new MutationObserver((mutations) => {
        const element = this.shadowRoot?.querySelector("#messages")!

        if (this.isScrolledToBottom) {
          element.lastElementChild?.scrollIntoView({ behavior: "smooth" })
        }
      })
      this.listObserver.observe(this.shadowRoot.querySelector("#messages")!, { childList: true })
    }
  }

  async attemptConnection(skipBind = false) {
    if (this.authData?.user && this.authData?.password && this.authData?.url) {
      await this.connection.connect({
        url: this.authData.url,
        auth: {
          authcid: getNodeFromJid(this.authData.user),
          authzid: getBareJidFromJid(this.authData.user),
          domain: getDomain(this.authData.user),
          resource: getResourceFromJid(this.authData.user) + crypto.randomUUID().slice(30),
          pass: this.authData.password.trim(),
        },
        skipBind: skipBind,
      })
      if (skipBind) {
        this.connection.sendAsync(resumeStream())
      }
    } else {
      this.shadowRoot?.querySelector<HTMLDialogElement>("#settingsDialog")?.showModal()
    }
  }

  disconnectedCallback(): void {
    this.connection.unsubscribe()
    this.listObserver.disconnect()
  }

  render() {
    return html`
            <app-layout>
            <div slot="header" style="display:flex; gap: 1rem; padding: 1rem;">
              ${this.renderHeader()}
            </div>
            </div>
            <div slot="list">
              ${this.status === "connected" ? this.renderRoster() : html``}
            </div>
            <div slot="subroute" style="height:100%; display:flex; flex-direction: column; overflow-y: overlay;">
              ${this.renderChatScreen()}
            </div>
            </app-layout>
        `
  }

  private renderHeader() {
    return html`<button @click="${() => (this.shadowRoot?.getElementById("settingsDialog") as HTMLDialogElement).showModal()}">Settings</button>
    <dialog id="settingsDialog">
      <auth-form method="dialog" @submit="${(e) => {
        this.authData = e.detail
        localStorage.setItem("xmpp-server-url", e.detail.url ?? "")
        localStorage.setItem("xmpp-user", e.detail.user ?? "")
        localStorage.setItem("xmpp-password", e.detail.password ?? "")
        this.shadowRoot?.querySelector<HTMLDialogElement>("#settingsDialog")?.close()
      }}" .data="${this.authData}"></auth-form>
    </dialog>
    <div style="flex: 1;"></div>
    <div>
      <button popovertarget="user-menu">
        ${this.presence === "chat" ? "🟢" : ""}
        ${this.presence === "dnd" ? "⛔️" : ""}
        ${this.presence === "away" ? "🟡" : ""}
        ${this.presence === "xa" ? "🟠" : ""}
        ${this.authData?.user} 
        ${this.status === "disconnected" ? "⚪️" : ""}
      </button>
      <div popover id="user-menu">
        ${
          this.status === "connected"
            ? html`
        <button @click=${(e) => this.sendPresence("chat")}>🟢 Online </button>
        <button @click=${(e) => this.sendPresence("away")}>🟡 Away</button> 
        <button @click=${(e) => this.sendPresence("dnd")}>⛔️ Do not disturb</button>
        <button @click=${(e) => this.sendPresence("xa")}>🟠 Extended away</button>
        <button @click="${() => this.sendPresence((prompt('Presence = "chat" | "away" | "dnd" | "xa"', "chat") as Parameters<typeof this.sendPresence>[0]) ?? "chat", prompt("Status") ?? "")}">Set Status</button>
        <hr/>
        `
            : nothing
        }
        ${this.status === "connected" ? html`<button @click="${() => this.connection.disconnect()}">🛑 Disconnect</button>` : nothing}
        ${this.status === "connecting" ? html`<button disabled>🟢 Connecting</button>` : nothing}
        ${this.status === "disconnecting" ? html`<button disabled>🛑 Disconnecting</button>` : nothing}
        ${this.status === "disconnected" ? html`<button @click="${this.attemptConnection}">🟢 Connect</button>` : nothing}
        ${this.status === "disconnected" ? html`<button @click="${this.attemptConnection(true)}">Pause</button>` : nothing}
      </div>`
  }

  private renderChatScreen() {
    return html`
      <header>${this.jid} : ${this.presenceData.get(this.jid)}</header>
      <hr style="width:100%">
      <div id="messages" style="overflow-y: auto; height: 100%;">
        ${
          this.result &&
          this.result.hasNextPage &&
          html`<button @click=${() => {
            const previousPageParams = this.result?.previousPageParams() ?? false
            if (typeof previousPageParams === "object") {
              this.mamPlugin.query(previousPageParams).then((result) => {
                this.messages = [...result.results.map((c) => c), ...this.messages]

                this.result = result
              })
            }
          }}>Load more</button>`
        }
        ${this.messages.map((c) => {
          const message = this.mapMessage(c)
          return html`<li>${new Date(message.stamp!).toLocaleTimeString()} : <span title="${message.from ?? ""}">${getNodeFromJid(message.from ?? "")}</span> <br/> ${message.body}</li>`
        })}
      </div>
      <hr style="width:100%">
      <form @submit="${(e) => {
        e.preventDefault()
        this.connection.sendMessage(
          { to: this.jid, type: "chat" },
          createElement("body", {}, this.shadowRoot?.querySelector<HTMLInputElement>("#text")?.value) ?? "ERROR_INPUT"
        )
        e.target.reset()
      }}"
        >
        <div style="display:flex;">
        <input type="text" style="flex: 1;" id="text" name="text" />
        <button type="submit"
        >Send</button>
        <label><input type="checkbox" ?checked=${this.isScrolledToBottom} @change=${(c) => (this.isScrolledToBottom = !this.isScrolledToBottom)}>Scroll on new messages</label>
      </div>
      </form>
    `
  }
  private renderRoster() {
    return html`<div style="display: flex; flex-direction: column; padding: 0 0.5rem">
      <button @click=${(e) => {
        const jid = prompt("JID to Add To Roster")
        if (!jid) return
        const name = prompt("Name")
        if (!name) return
        this.rosterPlugin.sendRosterSet(jid, name)
      }}>Add to Roster</button>
      </div>
      <ul style="padding:0;list-style: none;">${this.roster.map(
        (item) =>
          html`<li @click=${() => this.updateJid(item.jid)} style="cursor: pointer; padding: 1rem 0.5rem; ${this.jid === item.jid ? "background: #555" : ""}">
              ${getNodeFromJid(item.jid)}
          </li>`
      )}</ul>`
  }

  sendPresence(presence: "chat" | "away" | "dnd" | "xa", status?: string) {
    try {
      this.connection.sendPresence({}, [createElement("show", {}, presence), createElement("status", {}, status ?? "")])
      this.presence = presence
    } catch (e) {
      console.log("ERROR")
      this.presence = ""
      console.error(e)
    }
  }

  mapMessage(c: Element) {
    const messageElement = c.querySelector("forwarded message") ?? c.querySelector("message") ?? c
    const date = c?.querySelector("delay")?.getAttribute("stamp")
    const message = {
      id: messageElement?.getAttribute("id") ?? "",
      stamp: date ? new Date(date) : undefined,
      from: messageElement?.getAttribute("from") ?? undefined,
      to: messageElement?.getAttribute("to") ?? undefined,
      body: messageElement?.textContent ?? undefined,
    }

    return message
  }

  updateJid(jid: string) {
    this.result = undefined
    this.jid = jid

    this.mamPlugin.query({ jid: jid, max: 10, queryid: crypto.randomUUID() }).then((result) => {
      this.messages = result.results.map((c) => c)
      this.result = result
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-component": AppComponent
  }
}
