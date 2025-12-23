export default defineNuxtRouteMiddleware(() => {
  if (process.client) {
    const { isLoggedIn } = useAuth()
    if (isLoggedIn()) {
      return navigateTo('/dashboard')
    }
  }
})
