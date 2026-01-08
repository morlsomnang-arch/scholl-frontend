import { ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import axios from 'axios'
import { useAuth } from '~/composables/useAuth'

export type Student = {
  id: number
  name_kh: string
  name_en: string
  dob: string
  phone: string
  gender: 'M' | 'F' | 'O'
  image?: string

  services?: Array<{
    id?: number
    class_classtype_id: number
    academy_year_id: number
    remark?: string
  }>
  parents?: Array<{
    id?: number
    name_kh: string
    name_en?: string
    gender: 'M' | 'F' | 'O'
    type_parent_id: number
    phone?: string
    occupation?: string
  }>
  addresses?: Array<{
    id?: number
    address_type: 'birth' | 'current'
    province_id: number
    district_id: number
    commune_id: number
    village_id: number
  }>
}

export const useStudent = () => {
  const students = ref<Student[]>([])
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const { token } = useAuth()

  const axiosInstance = axios.create({
    baseURL: apiBase,
    headers: { Authorization: `Bearer ${token.value}` }
  })

  const getStudents = async (): Promise<Student[]> => {
    try {
      const res = await axiosInstance.get('/students')
      students.value = res.data
      return students.value
    } catch (err) {
      console.error('Failed to fetch students:', err)
      return []
    }
  }

  const getStudent = async (id: number): Promise<Student> => {
    try {
      const res = await axiosInstance.get(`/students/${id}`)
      return res.data
    } catch (err) {
      console.error('Failed to get student:', err)
      throw err
    }
  }

  const createStudent = async (form: FormData) => {
    try {
      await axiosInstance.post('/students', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    } catch (err) {
      console.error('Failed to create student:', err)
      throw err
    }
  }

  const updateStudent = async (id: number, form: FormData) => {
    try {
      await axiosInstance.put(`/students/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    } catch (err) {
      console.error('Failed to update student:', err)
      throw err
    }
  }

  const deleteStudent = async (id: number) => {
    try {
      await axiosInstance.delete(`/students/${id}`)
    } catch (err) {
      console.error('Failed to delete student:', err)
      throw err
    }
  }

  return { students, getStudents, getStudent, createStudent, updateStudent, deleteStudent }
}
