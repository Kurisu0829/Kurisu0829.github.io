import type { RouterConfig } from '@nuxt/schema'
import { START_LOCATION } from 'vue-router'

export default {
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp()
    const router = useRouter()
    const state = useState<{ entry: number; positions: Record<number, number> }>('content-scroll', () => ({
      entry: window.history.state?.position ?? 0,
      positions: {},
    }))

    if (from === START_LOCATION) {
      // Capture before the next page changes the container's scroll height.
      router.beforeEach(() => {
        const container = document.querySelector<HTMLElement>('.main-shell')
        if (container) state.value.positions[state.value.entry] = container.scrollTop
      })
    }

    const scroll = () => {
      if (router.currentRoute.value.fullPath !== to.fullPath) return
      const container = document.querySelector<HTMLElement>('.main-shell')
      if (!container) return
      state.value.entry = window.history.state?.position ?? 0

      if (savedPosition) {
        container.scrollTo({ top: state.value.positions[state.value.entry] ?? 0, behavior: 'instant' })
      } else if (to.hash) {
        const target = document.getElementById(decodeURIComponent(to.hash.slice(1)))
        target?.scrollIntoView({ behavior: 'instant', block: 'start' })
      } else if (to.path !== from.path || from.hash) {
        container.scrollTo({ top: 0, behavior: 'instant' })
      }
    }

    return new Promise<false>((resolve) => {
      const finish = () => {
        requestAnimationFrame(() => {
          scroll()
          resolve(false)
        })
      }
      if (from === START_LOCATION || to.path === from.path) finish()
      else nuxtApp.hooks.hookOnce('page:loading:end', finish)
    })
  },
} satisfies RouterConfig
