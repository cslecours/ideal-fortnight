export const getDomain = (jid: string) => {
    return jid.split('@')[1].split('/')[0]    
}