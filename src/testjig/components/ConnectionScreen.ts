import { LitElement, html, css } from "lit"
import { property } from "lit/decorators.js"

class ConnectionScreen extends LitElement {
  @property({ type: String }) server = ""
  @property({ type: String }) user = ""
  @property({ type: String }) password = ""

  static styles = css`
        .form-group {
            margin-bottom: 1em;
        }
        label {
            display: block;
            margin-bottom: 0.5em;
        }
        input {
            width: 100%;
            padding: 0.5em;
            box-sizing: border-box;
        }
        button {
            padding: 0.5em 1em;
            background-color: #007bff;
            color: white;
            border: none;
            cursor: pointer;
        }
        button:hover {
            background-color: #0056b3;
        }
    `

  render() {
    return html`
            <form @submit="${this._handleSubmit}">
                <div class="form-group">
                    <label for="server">Server</label>
                    <input type="text" id="server" .value="${this.server}" @input="${this._handleInputChange}" />
                </div>
                <div class="form-group">
                    <label for="user">User</label>
                    <input type="text" id="user" .value="${this.user}" @input="${this._handleInputChange}" />
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" .value="${this.password}" @input="${this._handleInputChange}" />
                </div>
                <button type="submit">Connect</button>
            </form>
        `
  }

  _handleInputChange(event: Event) {
    const target = event.target as HTMLInputElement
    this[target.id as "server" | "user" | "password"] = target.value
  }

  _handleSubmit(event: Event) {
    event.preventDefault()
    console.log("Server:", this.server)
    console.log("User:", this.user)
    console.log("Password:", this.password)
    // Add your connection logic here
  }
}

customElements.define("connection-screen", ConnectionScreen)
