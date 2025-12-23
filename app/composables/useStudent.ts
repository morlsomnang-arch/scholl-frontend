import { ref } from 'vue'
import { useRuntimeConfig } from '#app'


export const useStudent = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const getStudents = async (): Promise<Student[]> => {
    try {
      const res = await $fetch<Student[]>(`${apiBase}/students`, {
        headers: { 'Content-Type': 'application/json' }
      })
      return res
    } catch (err) {
      console.error('getStudents error:', err)
      return []
    }
  }

  const createStudent = async (form: FormData) => {
    try {
      await $fetch(`${apiBase}/students`, {
        method: 'POST',
        body: form
      })
    } catch (err) {
      console.error('createStudent error:', err)
    }
  }

  const updateStudent = async (id: number, form: FormData) => {
    try {
      await $fetch(`${apiBase}/students/${id}`, {
        method: 'PUT',
        body: form
      })
    } catch (err) {
      console.error('updateStudent error:', err)
    }
  }

  const deleteStudent = async (id: number) => {
    try {
      await $fetch(`${apiBase}/students/${id}`, {
        method: 'DELETE'
      })
    } catch (err) {
      console.error('deleteStudent error:', err)
    }
  }
  return { getStudents, createStudent, updateStudent, deleteStudent }
}
