export function toB64(source:string){
    return Buffer.from(source).toString('base64')
}

export function fromB64(source:string){
    return Buffer.from(source, 'base64').toString()
}