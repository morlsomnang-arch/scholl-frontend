import axios from 'axios'
import { useRuntimeConfig, useState } from '#imports'

export type Student = {
  id: number
  name_kh: string
  name_en: string
  dob: string
  image?: string | null
  image_thumb?: string | null
  image_url?: string | null
}

export type Class = { id: number; name: string }
export type ClassType = { id: number; name: string; class_id: number }
export type AcademyYear = { id: number; name: string }

export type ClassClasstype = {
  id: number
  class_id: number
  classtype_id: number
  Class?: Class
  ClassType?: ClassType
}

export type Service = {
  id: number
  student_id: number
  class_classtype_id: number
  academy_year_id: number
  remark?: string
  Student?: Student
  ClassClasstype?: ClassClasstype
  AcademyYear?: AcademyYear
}

export function useServices() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const services = useState<Service[]>('services', () => [])
  const students = useState<Student[]>('students', () => [])
  const classes = useState<Class[]>('classes', () => [])
  const classTypes = useState<ClassType[]>('classTypes', () => [])
  const academyYears = useState<AcademyYear[]>('academyYears', () => [])

  const token = () => (process.client ? localStorage.getItem('token') : '')
  const headers = () => ({ Authorization: `Bearer ${token()}` })

  /* ===== GET STUDENT IMAGE ===== */
  const getStudentImage = (student?: Student) => {
    return student?.image_thumb || '/avatar.png'
  }

  /* ===== FETCH SERVICES ===== */
  const fetchServices = async () => {
    try {
      const res = await axios.get(`${apiBase}/services`, { headers: headers() })

      // map image_thumb if backend didn't return
      services.value = res.data.map((s: Service) => {
        if (s.Student) {
          s.Student.image_thumb =
            s.Student.image_thumb ||
            (s.Student.image
              ? `${apiBase}/uploads/students/${s.Student.image}?v=${Date.now()}`
              : null)
        }
        return s
      })
    } catch (err) {
      console.error('Fetch Services Error:', err)
    }
  }

  /* ===== FETCH DROPDOWNS ===== */
  const fetchDropdowns = async () => {
    try {
      const [s, c, t, y] = await Promise.all([
        axios.get(`${apiBase}/students`, { headers: headers() }),
        axios.get(`${apiBase}/classes`, { headers: headers() }),
        axios.get(`${apiBase}/class-types`, { headers: headers() }),
        axios.get(`${apiBase}/academy-years`, { headers: headers() })
      ])

      // map students to include image_thumb
      students.value = s.data.map((st: Student) => ({
        ...st,
        image_thumb: st.image
          ? `${apiBase}/uploads/students/${st.image}?v=${Date.now()}`
          : null
      }))
      classes.value = c.data
      classTypes.value = t.data
      academyYears.value = y.data
    } catch (err) {
      console.error('Fetch Dropdowns Error:', err)
    }
  }

  /* ===== CRUD ===== */
  const createService = async (data: Partial<Service>) => {
    try {
      await axios.post(`${apiBase}/services`, data, { headers: headers() })
      await fetchServices()
    } catch (err) {
      console.error('Create Service Error:', err)
    }
  }

  const updateService = async (id: number, data: Partial<Service>) => {
    try {
      await axios.put(`${apiBase}/services/${id}`, data, { headers: headers() })
      await fetchServices()
    } catch (err) {
      console.error('Update Service Error:', err)
    }
  }

  const deleteService = async (id: number) => {
    try {
      await axios.delete(`${apiBase}/services/${id}`, { headers: headers() })
      await fetchServices()
    } catch (err) {
      console.error('Delete Service Error:', err)
    }
  }

  return {
    services,
    students,
    classes,
    classTypes,
    academyYears,
    fetchServices,
    fetchDropdowns,
    createService,
    updateService,
    deleteService,
    getStudentImage
  }
}
