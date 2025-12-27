import { ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import axios from 'axios'
import { useAuth } from '~/composables/useAuth'

export type Student = {
  id: number
  name: string
  age: number
  phone: string
  image?: string
}

export const useStudent = () => {
  const students = ref<Student[]>([])
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const { token } = useAuth()
  const axiosInstance = axios.create({
    baseURL: apiBase,
    headers: {
      Authorization: `Bearer ${token.value}`
    }
  })

  const getStudents = async () => {
    try {
      const res = await axiosInstance.get('/students')
      students.value = res.data
      return students.value
    } catch (err) {
      console.error(err)
      return []
    }
  }

  const createStudent = async (form: FormData) => {
    await axiosInstance.post('/students', form)
  }

  const updateStudent = async (id: number, form: FormData) => {
    await axiosInstance.put(`/students/${id}`, form)
  }

  const deleteStudent = async (id: number) => {
    await axiosInstance.delete(`/students/${id}`)
  }

  return { students, getStudents, createStudent, updateStudent, deleteStudent }
}
