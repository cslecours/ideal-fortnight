export const getDomain = (jid: string) => {
  return jid.split("@")[1].split("/")[0]
}

export const getBareJidFromJid = (jid: string) => {
  return jid ? jid.split("/")[0] : null
}

export const getResourceFromJid = (jid: string) => {
  const s = jid.split("/")
  if (s.length < 2) {
    return null
  }
  s.splice(0, 1)
  return s.join("/")
}

export const getNodeFromJid = (jid: string) => {
  return jid.split("@")[0]
}
