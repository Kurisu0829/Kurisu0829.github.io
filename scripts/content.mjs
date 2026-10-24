import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { dirname, join, resolve } from 'node:path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import hljs from 'highlight.js/lib/common'

export const slugify = value => String(value).normalize('NFC').toLowerCase()
  .replace(/[^\p{L}\p{N}\p{M}]+/gu, '-').replace(/^-|-$/g, '')

export const escapeXml = value => String(value).replace(/[<>&"']/g, character => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
})[character])

export function parseDate(value, fallback) {
  const input = value ?? fallback
  const date = input instanceof Date ? input : new Date(String(input)
    .replace(/^(\d{4}-\d\d-\d\d) (\d\d:\d\d(?::\d\d)?) ?([+-]\d{2})(\d{2})$/, '$1T$2$3:$4')
    .replace(/^(\d{4}-\d\d-\d\d)$/, '$1T00:00:00+08:00'))
  if (Number.isNaN(date.getTime())) throw new Error(`无效的文章日期：${input}`)
  return date.toISOString()
}

export function createMarkdown() {
  return new MarkdownIt({
    html: true,
    linkify: true,
    highlight(code, language) {
      return language && hljs.getLanguage(language)
        ? hljs.highlight(code, { language, ignoreIllegals: true }).value : ''
    },
  }).use(anchor, { slugify })
}

const textOf = content => content.replace(/```[\s\S]*?```/g, ' ')
  .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/<[^>]+>/g, ' ').replace(/[#*_>`~|]/g, '').replace(/\s+/g, ' ').trim()
const listOf = value => value == null ? [] : (Array.isArray(value) ? value : [value]).map(String)

export function readPost(source, filename, { now = new Date(), updated = null } = {}) {
  const { data, content } = matter(source)
  if (data.published === false || data.draft === true) return null
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/i)
  if (!match) throw new Error(`文章文件名应为 YYYY-MM-DD-标题.md：${filename}`)
  const date = parseDate(data.date, match[1])
  if (new Date(date) > now) return null
  const slug = String(data.slug || match[2]).normalize('NFC')
  if (!slug || /[/?#\\]/.test(slug) || slug === '.' || slug === '..') throw new Error(`无效的文章 slug：${slug}`)
  // Match Chirpy's /posts/:title/ URLs, including its Unicode slug rules.
  const legacySlug = data.slug ? slug : slugify(slug)
  let path = data.permalink ? String(data.permalink)
    .replace(/:title/g, legacySlug).replace(/:year/g, match[1].slice(0, 4))
    .replace(/:month/g, match[1].slice(5, 7)).replace(/:day/g, match[1].slice(8, 10)) : `/posts/${legacySlug}/`
  if (!path.startsWith('/') || path.includes('..') || /[?#\\:]/.test(path)) throw new Error(`无效的 permalink：${path}`)
  path = `${path.replace(/\/+$/, '')}/`
  const md = createMarkdown()
  const tokens = md.parse(content, {})
  const headings = tokens.flatMap((token, i) => token.type === 'heading_open' && ['h2', 'h3'].includes(token.tag)
    ? [{ id: token.attrGet('id'), text: textOf(tokens[i + 1]?.content || ''), level: Number(token.tag.slice(1)) }] : [])
  const plainText = textOf(content)
  const words = (plainText.match(/[\p{Script=Han}]|[\p{L}\p{N}]+/gu) || []).length
  return {
    slug: legacySlug, path, title: String(data.title || match[2]), date,
    updated: data.last_modified_at ? parseDate(data.last_modified_at) : updated && updated > date ? updated : null,
    categories: listOf(data.categories),
    excerpt: textOf(String(data.description || data.excerpt || plainText)).slice(0, 120),
    readingMinutes: Math.max(1, Math.ceil(words / 350)), words, headings,
    html: md.renderer.render(tokens, md.options, {}), plainText,
  }
}

function write(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  const body = typeof value === 'string' ? value : JSON.stringify(value)
  if (!existsSync(path) || readFileSync(path, 'utf8') !== body) writeFileSync(path, body)
}

export function buildContent(root = process.cwd(), { now = new Date() } = {}) {
  const site = JSON.parse(readFileSync(join(root, 'site.config.json'), 'utf8'))
  const postsDirectory = join(root, 'posts')
  const posts = readdirSync(postsDirectory).filter(file => file.endsWith('.md')).map(file => {
    let updated = null
    try {
      const result = execFileSync('git', ['log', '--follow', '-1', '--format=%cI', '--', `posts/${file}`],
        { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
      if (result) updated = parseDate(result)
    } catch { /* A source archive can be built without Git history. */ }
    return readPost(readFileSync(join(postsDirectory, file), 'utf8'), file, { now, updated })
  }).filter(Boolean).sort((a, b) => b.date.localeCompare(a.date) || a.path.localeCompare(b.path))
  const paths = new Set()
  for (const post of posts) {
    if (paths.has(post.path)) throw new Error(`重复的文章链接：${post.path}`)
    paths.add(post.path)
  }
  const categories = [...new Set(posts.flatMap(post => post.categories))].map(name => ({
    name, slug: slugify(name), count: posts.filter(post => post.categories.includes(name)).length,
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'))
  if (new Set(categories.map(item => item.slug)).size !== categories.length || categories.some(item => !item.slug)) {
    throw new Error('分类的 URL 重复或为空，请调整名称。')
  }
  const pageCount = Math.max(1, Math.ceil(posts.length / site.pageSize))
  const routes = ['/', '/archives/', '/categories/', '/about/', '/search/',
    ...Array.from({ length: pageCount - 1 }, (_, i) => `/page/${i + 2}/`),
    ...posts.map(post => post.path), ...categories.map(item => `/categories/${item.slug}/`)]
  const contentDirectory = resolve(root, 'public/_content/posts')
  const serverContentDirectory = resolve(root, 'app/generated/posts')
  mkdirSync(contentDirectory, { recursive: true })
  mkdirSync(serverContentDirectory, { recursive: true })
  const generatedFiles = new Set()
  const summaries = posts.map((post, index) => {
    const { html, plainText, headings, ...summary } = post
    const file = `${createHash('sha256').update(post.path).digest('hex').slice(0, 20)}.json`
    generatedFiles.add(file)
    const document = { ...summary, html, headings,
      previous: posts[index + 1] ? { title: posts[index + 1].title, path: posts[index + 1].path } : null,
      next: posts[index - 1] ? { title: posts[index - 1].title, path: posts[index - 1].path } : null }
    write(join(contentDirectory, file), document)
    write(join(serverContentDirectory, file), document)
    return { ...summary, contentFile: `/_content/posts/${file}` }
  })
  // Only remove obsolete files owned by this generator, never source Markdown.
  for (const directory of [contentDirectory, serverContentDirectory]) {
    for (const file of readdirSync(directory)) {
      if (file.endsWith('.json') && !generatedFiles.has(file)) unlinkSync(join(directory, file))
    }
  }
  const index = { posts: summaries, categories, pageCount, routes }
  write(join(root, 'app/generated/content.json'), index)
  write(join(root, 'public/_content/search.json'), posts.map(post => ({
    title: post.title, path: post.path, date: post.date, categories: post.categories, text: post.plainText,
  })))
  const canonical = path => `${site.url.replace(/\/$/, '')}${path}`
  write(join(root, 'public/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.filter(path => path !== '/search/').map(path => `<url><loc>${escapeXml(canonical(path))}</loc></url>`).join('')}</urlset>`)
  write(join(root, 'public/robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${canonical('/sitemap.xml')}\n`)
  write(join(root, 'public/feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><title>${escapeXml(site.title)}</title><id>${escapeXml(site.url)}</id><link href="${escapeXml(canonical('/feed.xml'))}" rel="self"/><link href="${escapeXml(site.url)}"/><updated>${posts[0]?.updated || posts[0]?.date || now.toISOString()}</updated><author><name>${escapeXml(site.author)}</name></author>${posts.slice(0, 20).map(post => `<entry><title>${escapeXml(post.title)}</title><id>${escapeXml(canonical(post.path))}</id><link href="${escapeXml(canonical(post.path))}"/><published>${post.date}</published><updated>${post.updated || post.date}</updated><summary>${escapeXml(post.excerpt)}</summary></entry>`).join('')}</feed>`)
  return index
}
