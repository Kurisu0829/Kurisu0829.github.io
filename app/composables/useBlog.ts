import content from '~/generated/content.json'
import site from '~~/site.config.json'
import type { PostSummary, Taxon } from '~/types/blog'

export function useBlog() {
  return { site, posts: content.posts as PostSummary[], categories: content.categories as Taxon[],
    tags: content.tags as Taxon[], pageCount: content.pageCount }
}

export function formatDate(value: string, short = false) {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: site.timezone, year: short ? undefined : 'numeric',
    month: 'long', day: 'numeric' }).format(new Date(value))
}

export function taxonomyPath(type: 'tags' | 'categories', name: string) {
  const items = type === 'tags' ? content.tags : content.categories
  return `/${type}/${items.find(item => item.name === name)?.slug || encodeURIComponent(name)}/`
}
