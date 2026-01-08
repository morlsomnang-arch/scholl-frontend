import axios from 'axios'
import { useState, useRuntimeConfig } from '#imports'

export function useTypeParents() {
  const config = useRuntimeConfig()
  const typeParents = useState<any[]>('typeParents', () => [])

  const token = () => localStorage.getItem('token') || ''

  const fetchTypeParents = async () => {
    const res = await axios.get(`${config.public.apiBase}/type-parents`, {
      headers: { Authorization: `Bearer ${token()}` }
    })
    typeParents.value = res.data
  }

  const createTypeParent = async (name: string) => {
    await axios.post(
      `${config.public.apiBase}/type-parents`,
      { name },
      { headers: { Authorization: `Bearer ${token()}` } }
    )
    await fetchTypeParents()
  }

  return { typeParents, fetchTypeParents, createTypeParent }
}
