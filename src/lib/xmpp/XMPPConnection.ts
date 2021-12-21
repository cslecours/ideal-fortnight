import { ConnectionChangeEvent, ConnectionStatus, ReceivedMessageEvent } from "../websocket/events";
import { Websocket } from "../websocket/websocket";
import { render } from "../stanza/render";
import { openStanza } from "./stanza";
import { parseXml } from "../stanza/parseXml";


export class XMPPConnection {

    private websocket: Websocket

    constructor(options: {
        connectionTimeout: number
    }) {
        this.websocket = new Websocket()
    }

    async connect({ url, domain }: { url: string | URL, domain: string }): Promise<void> {

        await new Promise((resolve, reject) => {

            this.websocket.addTypedEventListener('connection', (ev: ConnectionChangeEvent) => {
                if (ev.status === ConnectionStatus.Open) {
                    resolve(undefined)
                } else {
                    reject()
                }
            }, { once: true })

            this.websocket.addTypedEventListener('message', (ev: MessageEvent) => {
                console.log('RECEIVED', ev.data)
            }, { once: true })


            this.websocket.connect(url, ['xmpp'])
        })

        

        // this.addMessageHandler(message => {
        //     const stanza = parseXml(message)
        //     const openNodes = stanza.firstChild?.nodeName == 'open'
        //     const streamFeaturesNodes = stanza.firstChild?.nodeName === 'stream:features'
        //     console.log({openNodes, streamFeaturesNodes, message})
        // })
        this.websocket.send(render(openStanza(domain)))
    }

    private addMessageHandler(handler: (message: string) => void): void{
        this.websocket.addTypedEventListener('message', (evt:ReceivedMessageEvent) => handler(evt.data))
    }
}