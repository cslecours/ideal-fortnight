export const getDomain = (jid: string) => {
  return jid.split("@")[1].split("/")[0]
}

/**
 * The term "bare JID" refers to an XMPP address of the form <localpart@domainpart> (for an account at a server) or of the form <domainpart> (for a server).
 */
export const getBareJidFromJid = (jid: string) => {
  return jid.split("/")[0]
}

export const getResourceFromJid = (jid: string) => {
  return jid.slice(jid.indexOf("/") + 1)
}

export const getNodeFromJid = (jid: string) => {
  return jid.split("@")[0]
}
