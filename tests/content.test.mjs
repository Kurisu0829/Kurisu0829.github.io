import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
import { buildContent, parseDate, readPost } from '../scripts/content.mjs'

const now = new Date('2026-10-18T12:00:00Z')
const source = (frontmatter = '', body = '## 第一周\n### 6.1\n水费：49元  \n日合：49元') =>
  `---\ntitle: 二六年六月流水\ndate: 2026-06-22 15:25:00 +0800\ncategories: [日常, 生活]\n${frontmatter}---\n${body}\n`

test('保留中文旧链接、时区、分类与 Markdown 换行', () => {
  const post = readPost(source(), '2026-06-22-二六年六月流水.md', { now })
  assert.equal(post.path, '/posts/二六年六月流水/')
  assert.equal(post.date, '2026-06-22T07:25:00.000Z')
  assert.deepEqual(post.categories, ['日常', '生活'])
  assert.match(post.html, /水费：49元<br>/)
  assert.match(post.html, /日合：49元/)
  assert.deepEqual(post.headings.map(item => item.id), ['第一周', '6-1'])
})

test('草稿、未发表文章和未来文章不进入站点', () => {
  for (const flag of ['draft: true\n', 'published: false\n']) {
    assert.equal(readPost(source(flag), '2026-06-22-记录.md', { now }), null)
  }
  assert.equal(readPost(source().replace('2026-06-22 15:25:00 +0800', '2027-01-01'), '2027-01-01-记录.md', { now }), null)
})

test('支持旧站 slug、显式 permalink、重复标题目录与代码高亮', () => {
  const post = readPost(source('slug: custom\npermalink: /notes/:year/:title/\n',
    '## 测试\n## 测试\n```js\nconst value = 1\n```'), '2026-06-22-记录.md', { now })
  assert.equal(post.path, '/notes/2026/custom/')
  assert.notEqual(post.headings[0].id, post.headings[1].id)
  assert.match(post.html, /hljs-keyword/)
})

test('日期错误、危险路径和非约定文件名构建失败', () => {
  assert.throws(() => parseDate('not-a-date'), /无效/)
  assert.throws(() => readPost(source(), '记录.md', { now }), /文件名/)
  assert.throws(() => readPost(source('slug: ../secret\n'), '2026-06-22-记录.md', { now }), /slug/)
  assert.throws(() => readPost(source('permalink: https://example.com\n'), '2026-06-22-记录.md', { now }), /permalink/)
})

test('文章只读取分类，忽略旧标签元数据', () => {
  const post = readPost(source('tags: [仅旧标签, "!!!"]\n'), '2026-06-22-记录.md', { now })
  assert.deepEqual(post.categories, ['日常', '生活'])
  assert.equal(Object.hasOwn(post, 'tags'), false)
  assert.ok(!JSON.stringify(post).includes('仅旧标签'))
})

test('生成全量路由、分页、搜索与 XML，删除文章时清理对应数据', () => {
  const parent = resolve('node_modules/.cache/blog-tests')
  mkdirSync(parent, { recursive: true })
  const root = mkdtempSync(join(parent, 'blog-'))
  try {
    mkdirSync(join(root, 'posts'))
    writeFileSync(join(root, 'site.config.json'), JSON.stringify({ title: 'A & B', author: 'Kurisu', url: 'https://example.com', pageSize: 1 }))
    writeFileSync(join(root, 'posts/2026-06-22-记录一.md'), source('tags: [仅旧标签, "!!!"]\n'))
    writeFileSync(join(root, 'posts/2026-05-22-记录二.md'), source().replace('2026-06-22', '2026-05-22'))
    const built = buildContent(root, { now })
    assert.equal(built.posts.length, 2)
    assert.ok(built.routes.includes('/page/2/'))
    assert.ok(!built.routes.some(route => route.startsWith('/tags/')))
    assert.ok(built.routes.includes('/categories/日常/'))
    assert.ok(built.routes.includes('/categories/生活/'))
    assert.deepEqual(built.categories.map(item => item.count), [2, 2])
    assert.equal(Object.hasOwn(built, 'tags'), false)
    assert.ok(built.posts.every(post => !Object.hasOwn(post, 'tags')))
    const index = JSON.parse(readFileSync(join(root, 'app/generated/content.json'), 'utf8'))
    assert.deepEqual(index, built)
    const firstFile = join(root, 'public', built.posts[0].contentFile)
    assert.match(readFileSync(firstFile, 'utf8'), /水费：49元/)
    for (const post of built.posts) {
      const document = readFileSync(join(root, 'public', post.contentFile), 'utf8')
      assert.equal(Object.hasOwn(JSON.parse(document), 'tags'), false)
      assert.equal(readFileSync(join(root, 'app/generated/posts', post.contentFile.split('/').pop()), 'utf8'), document)
    }
    assert.match(readFileSync(join(root, 'public/feed.xml'), 'utf8'), /A &amp; B/)
    const search = JSON.parse(readFileSync(join(root, 'public/_content/search.json'), 'utf8'))
    assert.ok(search.every(entry => !Object.hasOwn(entry, 'tags')))
    assert.deepEqual(search[0].categories, ['日常', '生活'])
    assert.match(search[0].text, /水费：49元/)
    for (const file of ['app/generated/content.json', 'public/_content/search.json', 'public/feed.xml', 'public/sitemap.xml']) {
      assert.doesNotMatch(readFileSync(join(root, file), 'utf8'), /仅旧标签|\/tags\//)
    }
    rmSync(join(root, 'posts/2026-06-22-记录一.md'))
    assert.equal(buildContent(root, { now }).posts.length, 1)
    assert.throws(() => readFileSync(firstFile), /ENOENT/)
  } finally {
    if (!resolve(root).startsWith(`${parent}${sep}`)) throw new Error('测试清理路径超出边界')
    rmSync(root, { recursive: true, force: true })
  }
})

test('分类名称的空 slug 和冲突仍会阻止部署', () => {
  const parent = resolve('node_modules/.cache/blog-tests')
  mkdirSync(parent, { recursive: true })
  const root = mkdtempSync(join(parent, 'categories-'))
  try {
    mkdirSync(join(root, 'posts'))
    writeFileSync(join(root, 'site.config.json'), JSON.stringify({ title: '测试博客', author: 'Kurisu', url: 'https://example.com', pageSize: 10 }))
    for (const categories of ['["!!!"]', '[A B, A-B]']) {
      writeFileSync(join(root, 'posts/2026-06-22-记录.md'), source().replace('[日常, 生活]', categories))
      assert.throws(() => buildContent(root, { now }), /分类的 URL 重复或为空/)
    }
    writeFileSync(join(root, 'posts/2026-06-22-记录.md'), source().replace('[日常, 生活]', '日常'))
    assert.deepEqual(buildContent(root, { now }).categories, [{ name: '日常', slug: '日常', count: 1 }])
    writeFileSync(join(root, 'posts/2026-06-22-记录.md'), source().replace('categories: [日常, 生活]\n', ''))
    const built = buildContent(root, { now })
    assert.deepEqual(built.categories, [])
    assert.ok(built.routes.includes('/categories/'))
  } finally {
    if (!resolve(root).startsWith(`${parent}${sep}`)) throw new Error('测试清理路径超出边界')
    rmSync(root, { recursive: true, force: true })
  }
})

test('重复文章链接会阻止部署', () => {
  const parent = resolve('node_modules/.cache/blog-tests')
  mkdirSync(parent, { recursive: true })
  const root = mkdtempSync(join(parent, 'duplicate-'))
  try {
    mkdirSync(join(root, 'posts'))
    writeFileSync(join(root, 'site.config.json'), JSON.stringify({ pageSize: 10 }))
    for (const filename of ['2026-05-01-相同.md', '2026-06-01-相同.md']) writeFileSync(join(root, 'posts', filename), source())
    assert.throws(() => buildContent(root, { now }), /重复的文章链接/)
  } finally {
    if (!resolve(root).startsWith(`${parent}${sep}`)) throw new Error('测试清理路径超出边界')
    rmSync(root, { recursive: true, force: true })
  }
})
