import axios from 'axios'
import { useState, useRuntimeConfig } from '#imports'

export function useUsers() {
  const config = useRuntimeConfig()
  const users = useState<any[]>('users', () => [])

  const getToken = () => localStorage.getItem('token') || ''

  /** Fetch all users */
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${config.public.apiBase}/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      users.value = res.data
    } catch (err) {
      console.error('Fetch users failed:', err)
    }
  }

  /** Upgrade user role to super */
  const upgradeUser = async (id: number) => {
    try {
      await axios.put(`${config.public.apiBase}/users/upgrade/${id}`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      await fetchUsers()
    } catch (err) {
      console.error('Upgrade failed:', err)
    }
  }

  /** Create new user */
  const createUser = async (data: { name: string; email: string; role: string }) => {
    try {
      await axios.post(`${config.public.apiBase}/users`, data, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      await fetchUsers()
    } catch (err) {
      console.error('Create user failed:', err)
    }
  }

  /** Update existing user */
  const updateUser = async (id: number, data: { name: string; email: string; role: string }) => {
    try {
      await axios.put(`${config.public.apiBase}/users/${id}`, data, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      await fetchUsers()
    } catch (err) {
      console.error('Update user failed:', err)
    }
  }

  /** Delete user */
  const deleteUser = async (id: number) => {
    try {
      await axios.delete(`${config.public.apiBase}/users/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      await fetchUsers()
    } catch (err) {
      console.error('Delete user failed:', err)
    }
  }

  return { users, fetchUsers, upgradeUser, createUser, updateUser, deleteUser }
}
