import { resolve } from 'node:path'
import { buildContent } from './scripts/content.mjs'
import site from './site.config.json'

const content = buildContent()

export default defineNuxtConfig({
  compatibilityDate: '2026-10-18',
  devtools: { enabled: false },
  experimental: { prerenderErrorPages: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: site.language },
      titleTemplate: `%s · ${site.title}`,
      meta: [{ name: 'theme-color', content: '#f7f7f2' }],
      link: [
        { rel: 'icon', href: '/icons/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
        { rel: 'alternate', type: 'application/atom+xml', title: site.title, href: '/feed.xml' },
      ],
      script: [{ innerHTML: `try{const t=localStorage.getItem('kurisu-theme');document.documentElement.dataset.theme=t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch{}` }],
    },
  },
  nitro: {
    prerender: { crawlLinks: true, failOnError: true, routes: content.routes },
  },
  vite: {
    plugins: [{
      name: 'blog-markdown-watch',
      configureServer(server) {
        const sources = ['posts'].map(path => resolve(path).replaceAll('\\', '/'))
        server.watcher.add(sources)
        server.watcher.on('all', (_event, file) => {
          const normalized = resolve(file).replaceAll('\\', '/')
          if (sources.some(source => normalized.startsWith(`${source}/`))) {
            try {
              buildContent()
              server.ws.send({ type: 'full-reload' })
            } catch (error) { console.error('[blog]', error) }
          }
        })
      },
    }],
  },
})
