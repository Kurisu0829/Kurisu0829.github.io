import site from '~~/site.config.json'
import type { MaybeRefOrGetter } from 'vue'

export function usePageSeo(title: MaybeRefOrGetter<string>, description: MaybeRefOrGetter<string> = site.description) {
  const route = useRoute()
  const canonical = computed(() => `${site.url}${route.path === '/' ? '/' : `${route.path.replace(/\/+$/, '')}/`}`)
  useSeoMeta({ title, description, ogTitle: () => `${toValue(title)} · ${site.title}`,
    ogDescription: description, ogType: 'website', ogLocale: 'zh_CN', ogSiteName: site.title,
    ogUrl: canonical, ogImage: `${site.url}${site.avatar}`, twitterCard: 'summary' })
  useHead({ link: [{ rel: 'canonical', href: canonical }] })
}
