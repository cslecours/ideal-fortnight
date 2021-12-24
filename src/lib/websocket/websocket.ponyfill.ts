export function getWebSocketConstructor() {
  if (typeof globalThis.WebSocket !== "undefined") {
    return WebSocket
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("ws") as typeof WebSocket
  }
}
