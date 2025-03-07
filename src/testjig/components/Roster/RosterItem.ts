import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("roster-item")
export class RosterItem extends LitElement {
  name = ""
  status = ""

  @property({ type: Boolean, attribute: true }) selected = false

  static styles = css`
        :host {
            display: grid;
            grid-template-columns: 20px 1fr;
            padding: 8px;

        }
        :host([selected]) {
          background-color:#999;
          .name {
            font-weight: bold;
        }
        }
        
        .status {
            color: #666;
        }
    `

  render() {
    return html`
            <!-- <div class="avatar"></div> -->
            <div class="presence">⚪️</div>
            <div class="name">${this.name}</div>
            
            <!-- <div class="status">${this.status}</div> -->
        `
  }
}
