export interface Heading { id: string; text: string; level: number }
export interface PostSummary {
  slug: string
  path: string
  title: string
  date: string
  updated: string | null
  categories: string[]
  excerpt: string
  readingMinutes: number
  words: number
  contentFile: string
}
export interface Post extends Omit<PostSummary, 'contentFile'> {
  html: string
  headings: Heading[]
  previous: { title: string; path: string } | null
  next: { title: string; path: string } | null
}
export interface Category { name: string; slug: string; count: number }
export interface SearchEntry { title: string; path: string; date: string; categories: string[]; text: string }
