import axios from 'axios'
import { useState, useRuntimeConfig } from '#imports'

export function useAcademyYears() {
  const config = useRuntimeConfig()
  const academyYears = useState<any[]>('academyYears', () => [])

  const token = () => localStorage.getItem('token') || ''

  const fetchAcademyYears = async () => {
    const res = await axios.get(`${config.public.apiBase}/academy-years`, {
      headers: { Authorization: `Bearer ${token()}` }
    })
    academyYears.value = res.data
  }

  const createAcademyYear = async (data: { name: string }) => {
    await axios.post(`${config.public.apiBase}/academy-years`, data, {
      headers: { Authorization: `Bearer ${token()}` }
    })
    await fetchAcademyYears()
  }

  const updateAcademyYear = async (id: number, data: { name: string }) => {
    await axios.put(`${config.public.apiBase}/academy-years/${id}`, data, {
      headers: { Authorization: `Bearer ${token()}` }
    })
    await fetchAcademyYears()
  }

  const deleteAcademyYear = async (id: number) => {
    await axios.delete(`${config.public.apiBase}/academy-years/${id}`, {
      headers: { Authorization: `Bearer ${token()}` }
    })
    await fetchAcademyYears()
  }

  return {
    academyYears,
    fetchAcademyYears,
    createAcademyYear,
    updateAcademyYear,
    deleteAcademyYear
  }
}
