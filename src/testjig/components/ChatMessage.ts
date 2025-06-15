import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("chat-message")
export class ChatMessage extends LitElement {
  static styles = css`
  :host {
    display:block;
  }
    .message-bubble {
        padding: var(--padding-base); border-radius: var(--chat-bubble-radius);  max-width:var(--chat-bubble-max-width); 
    }

    .mine {
      background-color: var(--chat-bubble-mine);
    }

    .other {
      background-color: var(--chat-bubble-other);
    }

    .date {
      text-align: center;
      color: var(--chat-bubble-date);
    }

    .author {
      font-size:80%; display:flex;
    }
    `
  @property({ type: Boolean, attribute: "from-me" }) isFromMe = false

  render() {
    return html`
    <div>
    </span>  
    <div class="date">
          <slot name="date"></slot>
    </div>
    <div class="message" style="display:flex; flex-direction: ${this.isFromMe ? "row-reverse" : "row"};">
      <div class="author" style=" flex-direction: ${this.isFromMe ? "row-reverse" : "row"};"></div>
        <slot name="author"></slot>
      </div>
      <div class="content" style="display:flex; flex-direction: ${this.isFromMe ? "row-reverse" : "row"};">
        <div class="message-bubble ${this.isFromMe ? "mine" : "other"}">
          <slot></slot>
        </div>
      </div>
    </div>`
  }
}
