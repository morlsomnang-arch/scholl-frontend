export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()

  const allowedRoles = to.meta.roles as string[] | undefined

  if (allowedRoles && !allowedRoles.includes(user.value?.role)) {
    return navigateTo('/403')
  }
})
