import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const output = resolve('.output/public')
const content = JSON.parse(readFileSync('app/generated/content.json', 'utf8'))
assert.ok(!existsSync(join(output, 'tags')), '不应生成标签页面')
assert.ok(!content.routes.some(route => route.startsWith('/tags/')), '不应包含标签路由')
assert.equal(Object.hasOwn(content, 'tags'), false, '摘要索引不应包含标签')
assert.doesNotMatch(readFileSync(join(output, 'sitemap.xml'), 'utf8'), /\/tags\//, '站点地图不应包含标签路由')
const search = JSON.parse(readFileSync(join(output, '_content/search.json'), 'utf8'))
assert.ok(search.every(entry => Array.isArray(entry.categories) && !Object.hasOwn(entry, 'tags')), '搜索索引应仅使用分类')
for (const route of content.routes) {
  const file = join(output, route, 'index.html')
  assert.ok(existsSync(file), `没有生成页面：${route}`)
  const html = readFileSync(file, 'utf8')
  assert.match(html, /<html[^>]*lang="zh-CN"/, `页面缺少语言属性：${route}`)
  assert.match(html, /rel="canonical"/, `页面缺少 canonical：${route}`)
}
for (const post of content.posts) {
  const html = readFileSync(join(output, post.path, 'index.html'), 'utf8')
  const data = JSON.parse(readFileSync(join(output, post.contentFile), 'utf8'))
  assert.ok(!Object.hasOwn(post, 'tags') && !Object.hasOwn(data, 'tags'), `文章数据不应包含标签：${post.path}`)
  assert.ok(html.includes(post.title), `文章标题没有预渲染：${post.path}`)
  assert.ok(html.includes(data.html.slice(0, Math.min(data.html.length, 120))), `文章正文没有预渲染：${post.path}`)
  assert.ok(html.includes('application/ld+json'), `缺少文章结构化数据：${post.path}`)
}
for (const file of ['.nojekyll', '404.html', 'feed.xml', 'sitemap.xml', 'robots.txt', 'sw.min.js', 'img/Head.jpg', 'icons/favicon.ico', 'icons/apple-touch-icon.png', '_content/search.json']) {
  assert.ok(existsSync(join(output, file)), `缺少静态文件：${file}`)
}
let htmlCount = 0
let linkCount = 0
function inspect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) inspect(path)
    else if (entry.name.endsWith('.html')) {
      htmlCount++
      const html = readFileSync(path, 'utf8')
      for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
        const href = match[1].replaceAll('&amp;', '&')
        if (!href.startsWith('/') || href.startsWith('//')) continue
        const target = decodeURIComponent(href.split(/[?#]/)[0])
        if (!target) continue
        assert.ok(!target.startsWith('/tags/'), `页面不应链接到标签：${path}`)
        assert.ok(existsSync(join(output, target)) || existsSync(join(output, target, 'index.html')),
          `内部链接或资源不存在：${href}（${path}）`)
        linkCount++
      }
    }
  }
}
inspect(output)
console.log(`验证通过：${content.posts.length} 篇文章，${content.routes.length} 条预生成路由，${htmlCount} 个 HTML，${linkCount} 个内部链接和资源。`)
