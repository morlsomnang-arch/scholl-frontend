import axios from 'axios'
import { useAuth } from '~/composables/useAuth'

export interface ClassTypeItem {
  id: number
  name: string
}
export interface ClassType {    // <-- add this
  id: number
  name: string
}

export const useClassTypes = () => {
  const config = useRuntimeConfig()
  const { token } = useAuth()

  const api = axios.create({
    baseURL: config.public.apiBase,
    headers: {
      Authorization: token.value ? `Bearer ${token.value}` : ''
    }
  })

  const getClassTypes = async (): Promise<ClassTypeItem[]> => {
    const res = await api.get('/class-types')
    return res.data
  }

  const createClassType = async (data: { name: string }) => {
    return await api.post('/class-types', data)
  }

  const updateClassType = async (id: number, data: { name: string }) => {
    return await api.put(`/class-types/${id}`, data)
  }

  const deleteClassType = async (id: number) => {
    return await api.delete(`/class-types/${id}`)
  }

  return {
    getClassTypes,
    createClassType,
    updateClassType,
    deleteClassType
  }
}
