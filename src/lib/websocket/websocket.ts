import { ConnectionChangeEvent, ConnectionStatus, ReceivedMessageEvent } from "./events"
import { getWebSocketConstructor } from "./websocket.ponyfill"

const WebSocket = getWebSocketConstructor()

abstract class TypedEventTarget extends EventTarget {
  public addTypedEventListener<T extends Event>(type: T["type"], callback: (evt: T) => void, options?: AddEventListenerOptions | boolean) {
    this.addEventListener(type, callback as EventListener, options)
  }
}

export class Websocket extends TypedEventTarget {
  private socket: WebSocket | undefined

  connect(url: string | URL, protocols: string[]) {
    const socket = new WebSocket(url, protocols)
    socket.onopen = (ev) => this.onOpen(ev)
    socket.onclose = (ev) => this.onClose(ev)
    socket.onerror = (ev) => this.onError(ev)
    socket.onmessage = (ev) => this.onMessage(ev)
    this.socket = socket
  }

  close() {
    this.socket?.close()
  }

  send(data: string | ArrayBuffer | Blob | ArrayBufferView) {
    console.log("SEND\t", data)
    this.socket?.send(data)
  }

  onMessage(ev: MessageEvent<string>): void {
    console.log("DATA\t", ev.data)
    this.dispatchEvent(new ReceivedMessageEvent(ev.data))
  }
  onError(_ev: Event): void {
    console.error("ERROR")
    this.dispatchEvent(new ConnectionChangeEvent(ConnectionStatus.Failed))
  }
  onClose(_ev: CloseEvent): void {
    console.log("CLOSE")
    this.dispatchEvent(new ConnectionChangeEvent(ConnectionStatus.Closed))
  }
  onOpen(_ev: Event): void {
    console.log("OPEN")
    this.dispatchEvent(new ConnectionChangeEvent(ConnectionStatus.Open))
  }
}
