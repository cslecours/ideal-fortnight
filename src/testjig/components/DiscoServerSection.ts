import { css, html, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"
import { DiscoPlugin } from "../../lib/xmpp/disco/discoPlugin"
import type { XMPPConnection } from "../../lib/xmpp/XMPPConnection"
import { XMPPConnectionState } from "../../lib/xmpp/XMPPConnection"

@customElement("disco-server-section")
export class DiscoServerSection extends LitElement {
  static styles = css`
    pre {
      margin: 2em;
      background-color: #555;
      padding: 1em;
      border-radius: 4px;
      overflow-x: auto;
    }
  `

  @property({ type: Object })
  connection?: XMPPConnection

  @property({ type: Object })
  discoInfo: unknown = null

  @property({ type: Array })
  discoItems: Array<{ jid: string }> = []

  @property({ type: Array })
  discoItemDetails: Array<{ jid: string; info: unknown; items: unknown }> = []

  connectedCallback() {
    super.connectedCallback()
    if (this.connection) {
      this.connection.onConnectionStatusChange((c: XMPPConnectionState) => {
        if (c !== XMPPConnectionState.Connected) return
        this.fetchDisco()
      })
    }
  }

  async fetchDisco() {
    if (!this.connection) return
    const disco = new DiscoPlugin(this.connection)
    const domain = this.connection.context?.domain
    if (!domain) return
    this.discoInfo = await disco.sendDiscoInfoQuery(domain)
    const items = await disco.sendDiscoItemQuery(domain)
    this.discoItems = items as Array<{ jid: string }>
    this.discoItemDetails = []
    for (const item of this.discoItems) {
      const info = await disco.sendDiscoInfoQuery(item.jid)
      const subItems = await disco.sendDiscoItemQuery(item.jid)
      this.discoItemDetails = [...this.discoItemDetails, { jid: item.jid, info, items: subItems }]
      this.requestUpdate()
    }
  }

  render() {
    return html`
      <div>DISCO</div>
      <pre>${JSON.stringify(this.discoInfo, undefined, 2)}</pre>
      <pre>${JSON.stringify(this.discoItems, undefined, 2)}</pre>
      <div>
        ${this.discoItemDetails.map((d) => {
          const detail = d as { jid: string; info: unknown; items: unknown }
          return html`
              <div>
                <strong>${detail.jid}</strong>
                <pre>${JSON.stringify(detail.info, undefined, 2)}</pre>
                <pre>${JSON.stringify(detail.items, undefined, 2)}</pre>
              </div>
            `
        })}
      </div>
    `
  }
}
