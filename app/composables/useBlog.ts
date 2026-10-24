import content from '~/generated/content.json'
import site from '~~/site.config.json'
import type { PostSummary, Category } from '~/types/blog'

export function useBlog() {
  return { site, posts: content.posts as PostSummary[], categories: content.categories as Category[],
    pageCount: content.pageCount }
}

export function formatDate(value: string, short = false) {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: site.timezone, year: short ? undefined : 'numeric',
    month: 'long', day: 'numeric' }).format(new Date(value))
}

export function categoryPath(name: string) {
  return `/categories/${content.categories.find(item => item.name === name)?.slug || encodeURIComponent(name)}/`
}
