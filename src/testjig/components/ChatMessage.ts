import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("chat-message")
export class ChatMessage extends LitElement {
  static styles = css`
  :host {
    display:block;
  }
    .message-bubble {
      padding: var(--padding-base); 
      border-radius: var(--chat-bubble-radius);  
      max-width:var(--chat-bubble-max-width); 

      .mine & {
        background-color: var(--chat-bubble-mine);
      }
      .other & {
        background-color: var(--chat-bubble-other);
      }
    }

    .mine{
      display:flex;
      flex-direction: row-reverse;
    }
    .other{
      display:flex;
      flex-direction: row;
    }

    .date {
      text-align: center;
      color: var(--chat-bubble-date);
    }

    .author {
      font-size:80%;
      color: var(--chat-bubble-author);
    }
    `
  @property({ attribute: false }) date: Date | undefined
  @property({ type: Boolean, attribute: "from-me" }) isFromMe = false

  render() {
    return html`
    <div title="${this.date?.toISOString() ?? ""}">
      <div class="date">
        <slot name="date"></slot>
      </div>
      <div class="author ${this.isFromMe ? "mine" : "other"}"><slot name="author"></slot></div>
      <div class="message ${this.isFromMe ? "mine" : "other"}">
        <div class="message-bubble">
          <slot></slot>
        </div>
    </div>
    </div>`
  }
}
