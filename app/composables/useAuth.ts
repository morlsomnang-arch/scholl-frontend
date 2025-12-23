import axios from 'axios'
import { useState, useRuntimeConfig, navigateTo } from '#imports'

export function useAuth() {
  const user = useState<any>('user', () => null)
  const token = useState<string>('token', () => '')

  const config = useRuntimeConfig()

  if (process.client && !token.value) {
    token.value = localStorage.getItem('token') || ''
    const u = localStorage.getItem('user')
    if (u) user.value = JSON.parse(u)
  }

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${config.public.apiBase}/auth/login`, { email, password })
      token.value = res.data.token
      user.value = res.data.user

      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
    } catch (err: any) {
      // THROW so the catch block in your page runs
      throw err
    }
  }



  const register = async (name: string, email: string, password: string) => {
    try {
      await axios.post(
        `${config.public.apiBase}/auth/register`,
        { name, email, password }
      )
    } catch (err) {
      throw err // 🔥 REQUIRED for toast
    }
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.clear()
    navigateTo('/auth/login')
  }

  const isLoggedIn = () => !!token.value

  return { user, token, login, register, logout, isLoggedIn }
}
