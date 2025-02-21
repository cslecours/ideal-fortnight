import { AuthForm } from "./components/AuthForm"
import "./components/ConnectionScreen"

export default function (
  element: Element,
  data: Record<"url" | "user" | "password", string | undefined>,
  onSubmit: (data: Record<"url" | "user" | "password", string | undefined>) => void
) {
  customElements.define("auth-form", AuthForm)

  const authFormElement = document.createElement("auth-form") as AuthForm
  authFormElement.data = data

  authFormElement.addEventListener("submit", (e) => {
    onSubmit(e.detail)
  })

  element.append(authFormElement)
}
