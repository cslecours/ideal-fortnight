import { Subject } from "rxjs"
import { ConnectionStatus } from "./events"
import { getWebSocketConstructor } from "./websocket.ponyfill"

const WebSocket = getWebSocketConstructor()

export class Websocket {
  private socket: WebSocket | undefined

  private _messageSubject = new Subject<string>()
  private _errorSubject = new Subject<unknown>()
  private _connectionStatusSubject = new Subject<ConnectionStatus>()

  public get connectionStatus$() {
    return this._connectionStatusSubject.asObservable()
  }

  public get message$() {
    return this._messageSubject.asObservable()
  }

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
    this._messageSubject.next(ev.data)
  }

  onError(ev: Event): void {
    console.error("ERROR")
    this._connectionStatusSubject.next(ConnectionStatus.Failed)
    this._errorSubject.next(ev)
  }
  onClose(_ev: CloseEvent): void {
    console.log("CLOSE")
    this._connectionStatusSubject.next(ConnectionStatus.Closed)
  }
  onOpen(_ev: Event): void {
    console.log("OPEN")
    this._connectionStatusSubject.next(ConnectionStatus.Open)
  }
}
