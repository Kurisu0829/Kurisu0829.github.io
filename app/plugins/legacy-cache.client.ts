export default defineNuxtPlugin(() => {
  // Retire only the former Chirpy worker; leave other Pages projects alone.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        const worker = registration.active || registration.waiting || registration.installing
        if (worker && new URL(worker.scriptURL).pathname === '/sw.min.js') {
          void registration.unregister()
        }
      }
    }).catch(() => {})
  }
})
