export class AuthForm extends HTMLElement {
  public data?: Partial<Record<"url" | "user" | "password", string | undefined>> = {}

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    const styleSheet = new CSSStyleSheet()
    styleSheet.replaceSync(`
      :host {
      }
      label { display:block; font-family: inherit; width: 100%; }
      input { margin:3px; flex:1; width: 100%; }
      form { width : 300px; }
    `)
    this.shadowRoot?.adoptedStyleSheets.push(styleSheet)

    this.render()
  }

  connectedCallback() {
    this.render()
  }

  private render() {
    if (!this.shadowRoot) {
      return
    }
    this.shadowRoot.innerHTML = `<form method="${this.getAttribute("method")}">
        <label>XMPP : <input name="url" type="text" value="${this.data.url ?? ""}" /></label>
        <label>User : <input name="user" type="text" value="${this.data.user ?? ""}" /></label>
        <label>Pass : <input name="password" id="authForm-password" value="${this.data.password ?? ""}" /></label>
        <button type="submit">Save</button>
      </form>`

    this.shadowRoot.querySelector("form")?.addEventListener("submit", (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.dispatchEvent(
        new CustomEvent("submit", {
          detail: {
            url: (e.target as HTMLFormElement).url.value,
            user: (e.target as HTMLFormElement).user.value,
            password: (e.target as HTMLFormElement).password.value,
          },
        })
      )
    })
  }
}
customElements.define("auth-form", AuthForm)
