import tokens from "./tokens.json"

export function loadTokens() {
  const stylesheet = new CSSStyleSheet()
  stylesheet.insertRule(`body {
        ${Object.entries(tokens)
          .map(([key, value]) => `--${key}: ${value};`)
          .join("\n")}
        }`)
  document.adoptedStyleSheets.unshift(stylesheet)
  console.log("Tokens loaded", tokens)
}
