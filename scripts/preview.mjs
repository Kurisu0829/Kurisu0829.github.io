import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, resolve, sep } from 'node:path'

const root = resolve('.output/public')
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : fallback
}
const port = Number(argument('--port', '4173'))
const host = argument('--host', '127.0.0.1')
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.webp': 'image/webp', '.woff2': 'font/woff2' }
try { await stat(join(root, 'index.html')) } catch {
  console.error('请先运行 pnpm generate 生成静态站点。')
  process.exit(1)
}
const server = createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method || '')) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end()
      return
    }
    const url = new URL(request.url || '/', 'http://localhost')
    const pathname = decodeURIComponent(url.pathname)
    let file = resolve(root, `.${pathname}`)
    if (file !== root && !file.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end()
      return
    }
    let status = 200
    try {
      if ((await stat(file)).isDirectory()) {
        if (!url.pathname.endsWith('/')) {
          response.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end()
          return
        }
        file = join(file, 'index.html')
      }
      await stat(file)
    } catch { status = 404; file = join(root, '404.html') }
    const body = await readFile(file)
    response.writeHead(status, { 'Content-Type': types[extname(file)] || 'application/octet-stream',
      'Content-Length': body.length, 'Cache-Control': 'no-store' })
    response.end(request.method === 'HEAD' ? undefined : body)
  } catch { response.writeHead(400).end('Bad request') }
})
server.listen(port, host, () => console.log(`Static preview: http://${host}:${port}/`))
server.on('error', error => { console.error(error.message); process.exitCode = 1 })
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)))
