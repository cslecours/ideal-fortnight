import { LitElement, html, css } from "lit"
import { customElement } from "lit/decorators.js"

@customElement("app-layout")
export class AppLayout extends LitElement {
  static styles = css`
    :host {
        display: grid;
        grid-template-rows: auto 1fr;
        grid-template-columns: 25% 1fr;
        background: #333;
        height: 100vh;
    }
    .top {
        grid-column: span 2;
        border-bottom: 1px solid #ccc;
    }
    .left {
        border-right: 1px solid #ccc;
        padding: 1rem 0 1rem 0;
    }
    .center {
        padding: 0.5rem;
        overflow-y: overlay;
    }
`

  render() {
    return html`
      <div class="top">
        <slot name="header"></slot>
      </div>
      <div class="left">
        <slot name="list"></slot>
      </div>
      <div class="center">
        <slot name="subroute"></slot>
      </div>`
  }
}
