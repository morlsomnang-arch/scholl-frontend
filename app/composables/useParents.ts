import axios from 'axios'
import { useState, useRuntimeConfig } from '#imports'

export function useParents() {
  const config = useRuntimeConfig()
  const parents = useState<any[]>('parents', () => [])

  const token = () => localStorage.getItem('token') || ''

  const fetchParents = async () => {
    const res = await axios.get(`${config.public.apiBase}/parents`, {
      headers: { Authorization: `Bearer ${token()}` }
    })
    parents.value = res.data
  }

  const createParent = async (data: any) => {
    await axios.post(`${config.public.apiBase}/parents`, data, {
      headers: { Authorization: `Bearer ${token()}` }
    })
    await fetchParents()
  }

  const updateParent = async (id: number, data: any) => {
    await axios.put(`${config.public.apiBase}/parents/${id}`, data, {
      headers: { Authorization: `Bearer ${token()}` }
    })
    await fetchParents()
  }

  const deleteParent = async (id: number) => {
    await axios.delete(`${config.public.apiBase}/parents/${id}`, {
      headers: { Authorization: `Bearer ${token()}` }
    })
    await fetchParents()
  }

  return {
    parents,
    fetchParents,
    createParent,
    updateParent,
    deleteParent
  }
}
