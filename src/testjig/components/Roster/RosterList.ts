import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"
import type { RosterItem } from "../../../lib/xmpp/roster/RosterPlugin"
import "./RosterItem"

@customElement("roster-list")
export class RosterList extends LitElement {
  @property({ type: Array, state: true }) roster: (RosterItem & { presence?: string; status?: string })[] = []
  @property({ type: String }) jid = ""

  static styles = css`
  :host {
    display:flex;
    flex-direction: column;
    flex: 1;
  }`

  render() {
    return html`
      ${this.roster.map(
        (item) =>
          html`
          <roster-item @click=${() => this.dispatchEvent(new CustomEvent<string>("selected", { detail: item.jid }))} 
            ?selected=${this.jid === item.jid} 
            .name=${item.name} 
            .jid=${item.jid} 
            .status=${item.status ?? ""}
            >
            ${item.name}
          </roster-item>`
      )}`
  }
}
