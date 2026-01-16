import { ref } from 'vue'
import axios from 'axios'
import type { StudentAddress } from '../Address/~/types'

export const useStudentAddresses = () => {
  const addresses = ref<StudentAddress[]>([])
  const loading = ref(false)
const getAddresses = async () => {
  try {
    const res = await axios.get('/student-addresses')
    addresses.value = res.data
    console.log('✅ Addresses fetched from backend:', addresses.value)
  } catch (err) {
    console.error('❌ Error fetching addresses:', err)
  }
}

  const createAddress = async (data: Partial<StudentAddress>) => {
    await axios.post('/student-addresses', data)
  }

  const updateAddress = async (id: number, data: Partial<StudentAddress>) => {
    await axios.put(`/student-addresses/${id}`, data)
  }

  const deleteAddress = async (id: number) => {
    await axios.delete(`/student-addresses/${id}`)
  }

  const getAddressOptions = async () => {
    const [provinces, districts, communes, villages] = await Promise.all([
      axios.get('/student-addresses/json/provinces'),
      axios.get('/student-addresses/json/districts'),
      axios.get('/student-addresses/json/communes'),
      axios.get('/student-addresses/json/villages')
    ])

    return {
      provinces: provinces.data,
      districts: districts.data,
      communes: communes.data,
      villages: villages.data
    }
  }

  return {
    addresses,
    loading,
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    getAddressOptions
  }
}
