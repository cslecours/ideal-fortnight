import { css, html, LitElement } from "lit"
import { customElement } from "lit/decorators.js"

@customElement("app-layout")
export class AppLayout extends LitElement {
  static styles = css`
    :host {
        display: grid;
        grid-template-rows: auto 1fr;
        grid-template-columns: 25% 1fr;
        height: 100vh;
    }
    .top, .top-center {
        border-bottom: 1px solid #ccc;
    }
    
    .left {
        border-right: 1px solid #ccc;
    }
    .center {
        overflow-y: overlay;
    }
`

  render() {
    return html`
      <div class="top">
        <slot name="header"></slot>
      </div>
      <div class="top-center">
        <slot name="subroute-header"></slot>
      </div>      
      <div class="left">
        <slot name="list"></slot>
      </div>
      <div class="center">
        <slot name="subroute"></slot>
      </div>`
  }
}
