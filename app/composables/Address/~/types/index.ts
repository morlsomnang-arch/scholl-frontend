export type StudentAddress = {
  id: number
  student_id: string
  type: 'birth' | 'current'
  province_id: string | null
  district_id: string | null
  commune_id: string | null
  village_id: string | null
}
