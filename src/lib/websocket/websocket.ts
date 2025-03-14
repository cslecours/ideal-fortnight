import { BehaviorSubject, Subject } from "rxjs"
import { ConnectionStatus } from "./websocket.models"

export class Websocket {
  private socket: WebSocket | undefined

  private _messageSubject = new Subject<string>()
  private _outgoingMessagesSubject = new Subject<string | ArrayBuffer | Blob | ArrayBufferView>()
  private _errorSubject = new Subject<unknown>()
  private _connectionStatusSubject = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.Closed)

  public get connectionStatus$() {
    return this._connectionStatusSubject.asObservable()
  }

  public get outgoingMessages$() {
    return this._outgoingMessagesSubject.asObservable()
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
    this.socket?.close(1000)
  }

  private colorConsole(code: string, text: string) {
    return `${code}${text}\u001b[0m`
  }

  send(data: string | ArrayBuffer | Blob | ArrayBufferView) {
    console.log(this.colorConsole("\u001b[32m", "⬆ Send".padEnd(20)), data, "\n")
    if (this.socket?.readyState !== WebSocket.OPEN) {
      throw new Error("Socket is not open")
    }
    this.socket?.send(data)
    this._outgoingMessagesSubject.next(data)
  }

  onMessage(ev: MessageEvent<string>): void {
    console.log(this.colorConsole("\u001b[31m", "⬇ Recv".padEnd(20)), ev.data, "\n")
    this._messageSubject.next(ev.data)
  }

  onError(ev: Event): void {
    console.log(this.colorConsole("\u001b[31m", "ERROR".padEnd(20)), "\n")
    this._connectionStatusSubject.next(ConnectionStatus.Failed)
    this._errorSubject.next(ev)
  }

  onClose(_ev: CloseEvent): void {
    console.log(this.colorConsole("\u001b[31m", "CLOSE".padEnd(20)), "\n")
    this._connectionStatusSubject.next(ConnectionStatus.Closed)
  }
  onOpen(_ev: Event): void {
    console.log(this.colorConsole("\u001b[31m", "OPEN".padEnd(20)), "\n")
    this._connectionStatusSubject.next(ConnectionStatus.Open)
  }
}
