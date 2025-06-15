import { loadTokens } from "./components/design-system/loadTokens"
loadTokens()

import "./components/AppComponent.js"
import { AppComponent } from "./components/AppComponent.js"

const appElement = document.getElementById("app")
if (appElement) {
  const appComponent = document.createElement("app-component") as AppComponent
  appElement.appendChild(appComponent)
} else {
  console.error('Element with id "app" not found.')
}
