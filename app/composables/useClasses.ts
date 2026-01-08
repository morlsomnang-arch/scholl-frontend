import axios from 'axios'
import { useAuth } from '~/composables/useAuth'

export interface ClassItem {
  id: number
  name: string
  ClassClasstypes?: {
    id: number
    class_id: number
    classtype_id: number
    group_no: number
    ClassType: {
      id: number
      name: string
    }
  }[]
}


export const useClasses = () => {
  const config = useRuntimeConfig()
  const { token } = useAuth()

  const api = axios.create({
    baseURL: config.public.apiBase,
    headers: {
      Authorization: token.value ? `Bearer ${token.value}` : ''
    }
  })

  const getClasses = async (): Promise<ClassItem[]> => {
    const res = await api.get('/classes')
    return res.data
  }

  const createClass = async (data: { name: string }) => {
    return await api.post('/classes', data)
  }

  const updateClass = async (id: number, data: { name: string }) => {
    return await api.put(`/classes/${id}`, data)
  }

  const deleteClass = async (id: number) => {
    return await api.delete(`/classes/${id}`)
  }

  return {
    getClasses,
    createClass,
    updateClass,
    deleteClass
  }
}
