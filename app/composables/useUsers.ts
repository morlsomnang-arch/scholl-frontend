import axios from 'axios'
import { useState, useRuntimeConfig } from '#imports'

export function useUsers() {
  const config = useRuntimeConfig()
  const users = useState<any[]>('users', () => [])
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${config.public.apiBase}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      users.value = res.data
    } catch (err) {
      console.error('Fetch users failed:', err)
    }
  }

  const upgradeUser = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${config.public.apiBase}/users/upgrade/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchUsers() // Refresh list
    } catch (err) {
      console.error('Upgrade failed:', err)
    }
  }

  return { users, fetchUsers, upgradeUser }
}
