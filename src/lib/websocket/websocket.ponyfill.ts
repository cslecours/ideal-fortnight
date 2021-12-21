export function getWebSocketConstructor() {
    if(typeof globalThis.WebSocket !== 'undefined'){
        return WebSocket
    }else {
        return require('ws') as typeof WebSocket
    }
}