import axios from 'axios'
import { useAuth } from '~/composables/useAuth'

interface AssignPayload {
  class_id: number
  classtype_ids: number[]
  group_no?: number
}

export const useClassClasstype = () => {
  const config = useRuntimeConfig()
  const { token } = useAuth()

  const api = axios.create({
    baseURL: config.public.apiBase,
    headers: {
      Authorization: token.value ? `Bearer ${token.value}` : ''
    }
  })

  // ✅ Assign or update class types
  const assignOrUpdate = async (payload: AssignPayload) => {
    // Use the /assign endpoint
    const res = await api.post('/class-classtypes/assign', payload)
    return res.data
  }

  // Get class types by class ID
  const getByClassId = async (classId: number) => {
    const res = await api.get(`/class-classtypes/${classId}`)
    return res.data
  }

  return {
    assignOrUpdate,
    getByClassId
  }
}
