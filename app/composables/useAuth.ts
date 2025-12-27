import axios from 'axios'
import { useState, useRuntimeConfig, navigateTo } from '#imports'

export function useAuth() {
  const user = useState<any>('user', () => null)
  const token = useState<string>('token', () => '')

  const config = useRuntimeConfig()

  // Restore from localStorage
  if (process.client && !token.value) {
    token.value = localStorage.getItem('token') || ''
    const u = localStorage.getItem('user')
    if (u) user.value = JSON.parse(u)
  }

  // Axios default base URL and token
  axios.defaults.baseURL = config.public.apiBase
  axios.interceptors.request.use((config) => {
    if (token.value) {
      config.headers.Authorization = `Bearer ${token.value}`
    }
    return config
  })

  const login = async (email: string, password: string) => {
    const res = await axios.post('/auth/login', { email, password })
    token.value = res.data.token
    user.value = res.data.user
    localStorage.setItem('token', token.value)
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  const register = async (name: string, email: string, password: string) => {
    await axios.post('/auth/register', { name, email, password })
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.clear()
    navigateTo('/auth/login')
  }

  const isLoggedIn = () => !!token.value
  const hasRole = (role: string) => user.value?.role === role

  const hasPermission = (permission: string) => {
    if (!user.value) return false;
    if (user.value.role === 'super') return true;
    return user.value.permissions?.includes(permission) ?? false;
  }


  return { user, token, login, register, logout, isLoggedIn, hasRole, hasPermission }
}
