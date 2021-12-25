/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getBareJidFromJid, getDomain, getNodeFromJid, getResourceFromJid } from "./lib/xmpp/jid"
import { XMPPConnection } from "./lib/xmpp/XMPPConnection"

const connection = new XMPPConnection({ connectionTimeout: 3000 })

const first = true
if (first) {
  const jid = "2587727402465724172@chat.platform.getgo.com/cslecours||2021"

  connection.connect({
    url: "wss://xmpp.servers.getgo.com/websocket",
    auth: {
      resource: getResourceFromJid(jid)!,
      authcid: getNodeFromJid(jid)!,
      authzid: getBareJidFromJid(jid)!,
      domain: getDomain(jid),
      pass: "{Bearer}eyJraWQiOiJvYXV0aHYyLmxtaS5jb20uMDIxOSIsImFsZyI6IlJTNTEyIn0.eyJzYyI6InJlYWQgc29jaWFsLWdyYXBoIHRydXN0IHdyaXRlIiwic3ViIjoiMjU4NzcyNzQwMjQ2NTcyNDE3MiIsImF1ZCI6ImEzZjhjNDY2LWJlN2ItNGU2Yy1iNTM5LWM2ODhmYTA2YWZiNyIsIm9nbiI6Im1zIiwibHMiOiI2ZjEwZWFjOS03ZTRiLTRjNWMtOTExYy05YWEyZDU1ODkzNjIiLCJ0eXAiOiJhIiwiZXhwIjoxNjQyOTUzNzA2LCJpYXQiOjE2NDAzNjE3MDYsImp0aSI6ImRiZmI5NDVjLTM4NTAtNGE2ZS1hMjkxLTFmZDRkYTQ1MjEwZiJ9.YXAjgeUoAVqpumJBwrvKMFor4tv95dg2rWHT4vfKdUyFshxxURWKmcMce4V7ovCvWT7kiKc7ljan5h2pI7ftyU5bDvBYlkZkOe3IDcUPbCRnDSe9cmsZfBqdH9q85DvrYsGqhc5zYqrsrLFU7KHZPWnnKx_b9LUvrfjmypwHYAFbTTKYh7svgIRXycKayNJz4UV5Ho5gvuJX_ldNOR2B4gRvkoK5SjkaIo45KD7Qdmoi07zIV9AnKQVlH13oD7hVICy2aEp0QHCONUr_QVsTCgfXAi1VC5jJtVXXwDH8lvUNQkdkayaLP4U6e3iavOJ5SRbbjjkBsIO44tnYKi_x4w",
    },
  })
}

if (!first) {
  connection.connect({
    url: "wss://ws.xabber.com:9443/websocket",
    auth: {
      resource: "cslecours||2021",
      authcid: "cslecours",
      authzid: "cslecours@xabber.org",
      domain: "xabber.org",
      pass: "4Q1UOyX0ASdTrMofltwys2gZBCYyzckL",
    },
  })
}
