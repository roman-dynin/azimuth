import { Buffer } from 'node:buffer'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const host = event.node.req.headers.host
    if (!host || /^[\x00-\x7F]*$/.test(host)) return

    try {
      const utf8Host = Buffer.from(host, 'latin1').toString('utf8')
      const colon = utf8Host.indexOf(':')
      const hostname = colon >= 0 ? utf8Host.slice(0, colon) : utf8Host
      const port = colon >= 0 ? utf8Host.slice(colon) : ''
      event.node.req.headers.host = new URL(`http://${hostname}`).host + port
    } catch {}
  })
})
