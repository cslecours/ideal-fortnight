import { LitElement, html, css, nothing, PropertyValues } from "lit"
import { customElement, state } from "lit/decorators.js"
import { withCarbons } from "../../lib/xmpp/plugins/Carbon"
import { withStreamManagement } from "../../lib/xmpp/plugins/StreamManagement"
import { XMPPConnection } from "../../lib/xmpp/XMPPConnection"
import { getBareJidFromJid, getDomain, getNodeFromJid, getResourceFromJid } from "../../lib/xmpp/jid"
import { Roster, RosterItem } from "../../lib/xmpp/roster/RosterPlugin"
import { createElement } from "../../lib/xml/createElement"
import { DiscoPlugin } from "../../lib/xmpp/disco/discoPlugin"
import { MessageArchiveManagementPlugin, QueryResult } from "../../lib/xmpp/plugins/MessageArchive"
import { render } from "../../lib/xml/render"
import { parseXml } from "../../lib/xml/parseXml"
import "./AppLayout"
import "./AuthForm"
import "./Roster/RosterList"
import "./ChatMessage"

@customElement("app-component")
export class AppComponent extends LitElement {
  static styles = css`

  #messages {
    display:flex;
    flex-direction: column;
    overflow-y: auto; height: 100%; padding: 0 var(--padding-base);
    gap: 0.25rem;
  }

  .header-slot {
    display:flex; gap: 1rem; padding: 1rem;
  }
  .list-slot{
    height:100%; display:flex; flex-direction: column; overflow-y: overlay; justify-content: stretch;
  }

  .subroute-slot {
    height:100%; display:flex; flex-direction: column; overflow-y: overlay;
  }

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
    left: 1rem;
    border: none;
    
  }

  .form {
    border-top: 1px solid #ccc;
    padding: var(--padding-base);
  }

  .form-line {
    display:flex;
    flex-direction:row;
    gap: 1rem;
  }

  button {
      --background-color: var(--button-background-color-secondary);
      --color: var(--button-text-color);

      font-family: var(--font-family);
      
      background: var(--background-color);
      color: var(--color);
      border-radius: var(--button-border-radius);
      border: 1px solid var(--border-color);
      padding: var(--padding-base);

      &:hover {
        background: oklch(from var(--background-color)  calc(l - 0.1) c h);
      }
      
      &[variant="primary"] {
        --background-color: var(--button-background-color);
        --color: var(--button-text-color);
      }
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

  result?: QueryResult
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

    this.connection.on({ tagName: "message" }, (el) => {
      const isChatMarker = el.querySelector("received")
      if (isChatMarker) {
        console.warn("CHAT MARKER", isChatMarker)
        return
      }

      const isRealMessage = !el.querySelector("forwarded")
      if (!isRealMessage) {
        return
      }

      el.appendChild(parseXml(render(createElement("delay", { stamp: new Date().toISOString() }))))
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
          this.roster = list
          this.updateJid(this.roster.find(Boolean)?.jid!)
        })
        this.presence = "chat"
        this.connection.sendPresence({ type: "available" })
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
          console.log("SCROLLING TO BOTTOM", element.lastElementChild)
          element.lastElementChild?.scrollIntoView({ behavior: this.messages.length > 20 ? "smooth" : "instant" })
        }
      })
      this.listObserver.observe(this.shadowRoot.querySelector("#messages")!, { childList: true })
    }
  }

  async attemptConnection() {
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
      })
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
              <div slot="header" class="header-slot">
                ${this.renderHeader()}
              </div>
            <div slot="subroute-header" class="header-slot">
              ${this.renderChatHeader()}
            </div>
            </div>
            <div slot="list" class="list-slot">
              ${this.renderRoster()}
            </div>
            <div slot="subroute" class="subroute-slot">
              ${this.renderChatScreen()}
            </div>
            </div>
            </app-layout>
        `
  }

  private renderHeader() {
    return html`<div>
    <button popovertarget="user-menu">
      ${this.presence === "" ? "⚪️" : ""}
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
    </div>
    ${
      this.status === "disconnected"
        ? html`
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
    `
        : nothing
    }
  </div>`
  }

  private renderChatHeader() {
    return html`
    <div style="flex: 1;align-self: center;">
      <span title="${this.jid}">${this.roster.find((c) => c.jid === this.jid)?.name} ${this.presenceData.get(this.jid)?.[0] ?? ""}</span>
    </div>
    `
  }

  private renderChatScreen() {
    return html`
      <div id="messages">
        ${
          this.result &&
          this.result.hasNextPage &&
          html`<div><button @click=${() => {
            const previousPageParams = this.result?.previousPageParams() ?? false
            if (typeof previousPageParams === "object") {
              this.mamPlugin.query(previousPageParams).then((result) => {
                this.messages = [...result.results.map((c) => c), ...this.messages]

                this.result = result
              })
            }
          }}>Load more</button></div>`
        }
        ${this.messages.map((c, index) => {
          const message = this.mapMessage(c)
          return this.renderMessage(
            message,
            new Date(
              this.messages
                .at(index - 1)
                ?.querySelector("delay")
                ?.getAttribute("stamp")
            ),
            this.messages
              .at(index - 1)
              ?.querySelector("message")
              ?.getAttribute("from") ?? undefined
          )
        })}
      </div>
      <form class="form" @submit="${(e) => {
        e.preventDefault()
        this.connection.sendMessage(
          { to: this.jid, type: "chat" },
          createElement("body", {}, this.shadowRoot?.querySelector<HTMLInputElement>("#text")?.value) ?? "ERROR_INPUT"
        )
        e.target.reset()
      }}"
        >
        <div class="form-line">
        <input required type="text" style="flex: 1; height:30px; padding-left:4px;" id="text" name="text" placeholder="Send a message"/>
        <button type="submit"
        >Send</button>
        </div>
        <div class="form-line"><label><input type="checkbox" ?checked=${this.isScrolledToBottom} @change=${(c) => (this.isScrolledToBottom = !this.isScrolledToBottom)}>Scroll on new messages</label></div>
      </form>
    `
  }
  renderMessage(
    message: {
      id: string
      stamp: Date | undefined
      from: string | undefined
      to: string | undefined
      body: string | undefined
    },
    lastMessageTimeStamp: Date,
    lastMessageAuthor: string | undefined
  ): any {
    const lastMessageInSameMinute = (message.stamp?.getTime() || 0) - 1000 * 60 < (lastMessageTimeStamp?.getTime() || 0)
    console.log(
      "Last Message Author",
      getBareJidFromJid(lastMessageAuthor ?? ""),
      "Current Message Author",
      getBareJidFromJid(message.from)
    )
    // const lastMessageSameAuthor = getBareJidFromJid(message.from ?? "") === getBareJidFromJid(lastMessageAuthor ?? "")
    const date = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(message.stamp))
    const name = this.roster.find((c) => c.jid === getBareJidFromJid(message.from!))?.name ?? message.from
    const isFromMe = getBareJidFromJid(message.from ?? "") === getBareJidFromJid(this.connection.jid ?? "")
    return html`
    <chat-message .isFromMe=${isFromMe}>
    <span slot="date">${
      lastMessageInSameMinute
        ? nothing
        : html`
          ${date}
          `
    }</span>
    ${html`<span slot="author" title="${message.from ?? ""}">${name}</span>`}
    ${message.body}
    </chat-message>`
  }
  private renderRoster() {
    if (this.isConnected) {
      return html`<roster-list .jid=${this.jid} @selected=${(event: CustomEvent<string>) => this.updateJid(event.detail)} .roster=${this.roster}></roster-list>
      <div style="display: flex; flex-direction: column; padding: var(--padding-base);">
      <button @click=${(e) => {
        const jid = prompt("JID to Add To Roster")
        if (!jid) return
        const name = prompt("Name")
        if (!name) return
        this.rosterPlugin.sendRosterSet(jid, name)
      }}>Add to Roster</button>
      </div>`
    }
    return nothing
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
    this.messages = []
    this.mamPlugin.query({ jid: jid, max: 20, queryid: crypto.randomUUID() }).then((result) => {
      this.messages = result.results.filter((c) => !c.querySelector("received") && !c.querySelector("displayed")).map((c) => c)
      this.result = result
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-component": AppComponent
  }
}
