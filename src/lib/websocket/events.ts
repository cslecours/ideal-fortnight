export enum ConnectionStatus {
  Failed,
  Open,
  Closed,
}

export class ConnectionChangeEvent extends Event {
  constructor(public readonly status: ConnectionStatus, eventInitDict?: EventInit) {
    super("connection", eventInitDict)
  }
}

export class ReceivedMessageEvent extends Event {
  constructor(public readonly data: string, eventInitDict?: EventInit) {
    super("message", eventInitDict)
  }
}
