<script setup lang="ts">
import { h, resolveComponent, ref, computed, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { StudentAddress } from '../../composables/Address/~/types'
import { useStudentAddresses } from '~/composables/Address/useStudentAddresses'
import { useStudent } from '~/composables/useStudent'
import { useAuth } from '~/composables/useAuth'

const { students, getStudents } = useStudent()

const UButton = resolveComponent('UButton')
const UInput = resolveComponent('UInput')
const USelect = resolveComponent('USelect')
const UModal = resolveComponent('UModal')
const UTable = resolveComponent('UTable')
const UPagination = resolveComponent('UPagination')

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { hasPermission } = useAuth()
const canCreate = computed(() => hasPermission('create_addresses'))
const canEdit = computed(() => hasPermission('update_addresses'))
const canDelete = computed(() => hasPermission('delete_addresses'))

const {
  addresses,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getAddressOptions
} = useStudentAddresses()

const loading = ref(false)
const searchQuery = ref('')
const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)

const student_id = ref<string | null>(null)
const type = ref<'birth' | 'current'>('birth')
const province_id = ref<string | null>(null)
const district_id = ref<string | null>(null)
const commune_id = ref<string | null>(null)
const village_id = ref<string | null>(null)

const provinces = ref<any[]>([])
const districts = ref<any[]>([])
const communes = ref<any[]>([])
const villages = ref<any[]>([])

const loadDropdowns = async () => {
  const opts = await getAddressOptions()
  provinces.value = opts.provinces
  districts.value = opts.districts
  communes.value = opts.communes
  villages.value = opts.villages
}

const filteredDistricts = computed(() =>
  province_id.value
    ? districts.value.filter(d => String(d.province_id) === String(province_id.value))
    : []
)

const filteredCommunes = computed(() =>
  district_id.value
    ? communes.value.filter(c => String(c.district_id) === String(district_id.value))
    : []
)

const filteredVillages = computed(() =>
  commune_id.value
    ? villages.value.filter(v => String(v.commune_id) === String(commune_id.value))
    : []
)


const currentPage = ref(1)
const perPage = ref(35)
const perPageOptions = [35, 100, 150, 200]

const filteredData = computed(() => {
  if (!searchQuery.value) return addresses.value
  return addresses.value.filter(a =>
    a.student_id?.toString().includes(searchQuery.value) ||
    a.type.includes(searchQuery.value)
  )
})

const totalItems = computed(() => filteredData.value.length)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredData.value.slice(start, start + perPage.value)
})



const selectedItems = ref<number[]>([])
const toggleSelection = (id: number) => {
  selectedItems.value.includes(id)
    ? selectedItems.value = selectedItems.value.filter(i => i !== id)
    : selectedItems.value.push(id)
}

const toggleAll = (checked: boolean) => {
  selectedItems.value = checked ? paginatedData.value.map(i => i.id) : []
}

const resetForm = () => {
  isEdit.value = false
  currentId.value = null
  student_id.value = null
  type.value = 'birth'
  province_id.value = null
  district_id.value = null
  commune_id.value = null
  village_id.value = null
  showModal.value = false
}

const submitForm = async () => {
  if (!student_id.value) return

  const payload: Partial<StudentAddress> = {
    student_id: student_id.value,
    type: type.value,
    province_id: province_id.value,
    district_id: district_id.value,
    commune_id: commune_id.value,
    village_id: village_id.value
  }

  isEdit.value && currentId.value
    ? await updateAddress(currentId.value, payload)
    : await createAddress(payload)

  await getAddresses()
  resetForm()
}

const editItem = (addr: StudentAddress) => {
  isEdit.value = true
  currentId.value = addr.id
  student_id.value = addr.student_id
  type.value = addr.type
  province_id.value = addr.province_id
  district_id.value = addr.district_id
  commune_id.value = addr.commune_id
  village_id.value = addr.village_id
  showModal.value = true
}

const columns: TableColumn<StudentAddress>[] = [
  {
    accessorKey: 'student_id',
    header: 'សិស្ស',
    cell: ({ row }) => {
      const student = students.value.find(
        s => String(s.id) === String(row.original.student_id)
      )
      return student?.name_kh || student?.name_en || `Student #${row.original.student_id}`
    }
  },
  { accessorKey: 'type', header: 'ប្រភេទ' },
  {
    header: 'Province', cell: ({ row }) =>
      provinces.value.find(p => String(p.id) === String(row.original.province_id))?.name_km || ''
  },
  {
    header: 'District', cell: ({ row }) =>
      districts.value.find(d => String(d.id) === String(row.original.district_id))?.name_km || ''
  },
  {
    header: 'Commune', cell: ({ row }) =>
      communes.value.find(c => String(c.id) === String(row.original.commune_id))?.name_km || ''
  },
  {
    header: 'Village', cell: ({ row }) =>
      villages.value.find(v => String(v.id) === String(row.original.village_id))?.name_km || ''
  },

]



const openModal = async () => {
  loading.value = true
  await loadDropdowns()
  await getStudents()
  showModal.value = true
  loading.value = false
}

onMounted(async () => {
  loading.value = true
  await loadDropdowns()
  await getStudents()
  await getAddresses()
  loading.value = false
})
</script>

<template>
  <div class="flex flex-col gap-4 font-battambang border dark:border-slate-700 p-3">

    <!-- Header -->
    <div class="flex items-center justify-between border-b dark:border-slate-700 p-2 gap-3">
      <div class="flex gap-3">
        <UButton v-if="canCreate" icon="i-lucide-plus" color="danger" @click="openModal" />

        <UButton v-if="canEdit" icon="i-lucide-edit" color="danger" :disabled="selectedItems.length !== 1"
          @click="editItem(addresses.find(a => a.id === selectedItems[0])!)" />
        <UButton v-if="canDelete" icon="i-lucide-trash" color="danger" :disabled="selectedItems.length === 0" />
      </div>

      <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="ស្វែងរកអាសយដ្ឋាន..."
        class="max-w-xs" />
    </div>
    <UTable sticky :data="paginatedData" :columns="columns"
      class="max-h-115 overflow-auto border dark:border-slate-700" :ui="{
        thead: 'sticky top-0 bg-gray-100 dark:bg-slate-800 z-10 text-center',
        th: 'px-4 py-3 text-sm font-semibold',
        td: 'px-4 py-3 text-sm border-b border-r dark:border-slate-700'
      }" />

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-2">
      <div class="flex items-center gap-2">
        <label>បង្ហាញ:</label>
        <select v-model.number="perPage" class="border rounded px-2 py-1">
          <option v-for="opt in perPageOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
        <UPagination v-model:page="currentPage" :total="totalItems" :page-size="perPage" />
      </div>
      <div class="flex items-center gap-2">សរុប: {{ totalItems }} អាសយដ្ឋាន</div>
    </div>

    <!-- Modal -->
    <UModal v-model:open="showModal">
      <template #header>
        <h3 class="text-lg font-semibold">
          {{ isEdit ? 'កែប្រែអាសយដ្ឋាន' : 'បន្ថែមអាសយដ្ឋាន' }}
        </h3>
      </template>

      <template #body class="font-battambang">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <USelect v-model="student_id" :items="students.map(s => ({
            label: s.name_kh || s.name_en || s.phone || `Student #${s.id}`,
            value: s.id
          }))" placeholder="ជ្រើសសិស្ស" />


          <select v-model="type" class="border rounded px-2 py-1">
            <option value="birth">ទីកន្លែងកំណើត</option>
            <option value="current">ទីលំនៅបច្ចុប្បន្ន</option>
          </select>

          <USelect v-model="province_id" :items="provinces.map(p => ({ label: p.name_km, value: p.id }))"
            placeholder="ជ្រើសខេត្ត" />

          <USelect v-model="district_id" :items="filteredDistricts.map(d => ({ label: d.name_km, value: d.id }))"
            placeholder="ជ្រើសស្រុក" />

          <USelect v-model="commune_id" :items="filteredCommunes.map(c => ({ label: c.name_km, value: c.id }))"
            placeholder="ជ្រើសឃុំ" />

          <USelect v-model="village_id" :items="filteredVillages.map(v => ({ label: v.name_km, value: v.id }))"
            placeholder="ជ្រើសភូមិ" />
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="gray" @click="resetForm">
            បោះបង់
          </UButton>
          <UButton color="success" @click="submitForm">
            {{ isEdit ? 'កែប្រែ' : 'រក្សាទុក' }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
