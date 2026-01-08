<script setup lang="ts">
import { h, resolveComponent, ref, computed, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useStudent, type Student } from '~/composables/useStudent'
import { useAuth } from '~/composables/useAuth'

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UInput = resolveComponent('UInput')
const UModal = resolveComponent('UModal')
const UTable = resolveComponent('UTable')
const UPagination = resolveComponent('UPagination')

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { user, hasPermission } = useAuth()
const canCreate = computed(() => hasPermission('create_students'))
const canEdit = computed(() => hasPermission('update_students'))
const canDelete = computed(() => hasPermission('delete_students'))

const { getStudents, createStudent, updateStudent, deleteStudent } = useStudent()
const students = ref<Student[]>([])
const loading = ref(false)
const searchQuery = ref('')

/* ===== CRUD Modal ===== */
const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)

const nameKh = ref('')
const nameEn = ref('')
const dob = ref('')
const phone = ref('')
const gender = ref<'M' | 'F' | 'O'>('M')
const image = ref<File | null>(null)

/* ===== Checkbox Multi-Select ===== */
const selectedStudents = ref<number[]>([])
const toggleSelection = (id: number) => {
  const index = selectedStudents.value.indexOf(id)
  if (index === -1) selectedStudents.value.push(id)
  else selectedStudents.value.splice(index, 1)
}
const isSelected = (id: number) => selectedStudents.value.includes(id)
const toggleAllSelection = (checked: boolean) => {
  selectedStudents.value = checked ? paginatedData.value.map(s => s.id) : []
}

/* ===== Fetch Students ===== */
const fetchStudents = async () => {
  loading.value = true
  students.value = await getStudents()
  loading.value = false
}
onMounted(fetchStudents)
const filteredData = computed(() => {
  if (!searchQuery.value) return students.value
  return students.value.filter(s =>
    s.name_kh.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    s.name_en.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    s.phone.includes(searchQuery.value)
  )
})

/* ===== Pagination ===== */
const currentPage = ref(1)
const perPage = ref(35)
const perPageOptions = [35, 100, 150, 200, 250, 300]
const changePerPage = (value: number) => {
  perPage.value = value
  currentPage.value = 1
}
const totalItems = computed(() => filteredData.value.length)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredData.value.slice(start, start + perPage.value)
})

/* ===== File Change ===== */
const onFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  image.value = files && files.length ? files[0] : null
}

/* ===== Reset Form ===== */
const resetForm = () => {
  nameKh.value = ''
  nameEn.value = ''
  dob.value = ''
  phone.value = ''
  gender.value = 'M'
  image.value = null
  isEdit.value = false
  currentId.value = null
  showModal.value = false
}

/* ===== Submit Form ===== */
const submitForm = async () => {
  const form = new FormData()
  form.append('name_kh', nameKh.value)
  form.append('name_en', nameEn.value)
  form.append('dob', dob.value)
  form.append('phone', phone.value)
  form.append('gender', gender.value)
  if (image.value) form.append('image', image.value)

  if (isEdit.value && currentId.value) {
    await updateStudent(currentId.value, form)
  } else {
    await createStudent(form)
  }

  await fetchStudents()
  resetForm()
}

/* ===== Edit & Delete ===== */
const editStudent = (s: Student) => {
  isEdit.value = true
  currentId.value = s.id
  nameKh.value = s.name_kh
  nameEn.value = s.name_en
  dob.value = s.dob
  phone.value = s.phone
  gender.value = s.gender
  showModal.value = true
}

const removeStudent = async (id: number) => {
  if (confirm('តើអ្នកពិតជាចង់លុបសិស្សនេះមែនទេ?')) {
    await deleteStudent(id)
    await fetchStudents()
  }
}

/* ===== Bulk Actions ===== */
const bulkEdit = () => {
  if (selectedStudents.value.length === 1) {
    const s = students.value.find(st => st.id === selectedStudents.value[0])
    if (s) editStudent(s)
  } else {
    alert('សូមជ្រើសរើសសិស្សតែមួយសម្រាប់កែប្រែ')
  }
}

const bulkDelete = async () => {
  if (selectedStudents.value.length === 0) return
  if (confirm(`តើអ្នកពិតជាចង់លុប ${selectedStudents.value.length} សិស្សមែនទេ?`)) {
    for (const id of selectedStudents.value) {
      await deleteStudent(id)
    }
    selectedStudents.value = []
    await fetchStudents()
  }
}

/* ===== Table Columns ===== */
const columns: TableColumn<Student>[] = [
  {
    id: 'select',
    header: h('input', {
      type: 'checkbox',
      class: 'w-4 h-4',
      onChange: (e: Event) => toggleAllSelection((e.target as HTMLInputElement).checked),
      checked: computed(() => paginatedData.value.every(s => selectedStudents.value.includes(s.id))).value
    }),
    cell: ({ row }) =>
      h('input', {
        type: 'checkbox',
        class: 'w-4 h-4',
        checked: isSelected(row.original.id),
        onChange: () => toggleSelection(row.original.id)
      })
  },

  {
    id: 'image',
    header: 'រូបភាព',
    cell: ({ row }) =>
      row.original.image
        ? h('img', {
          src: row.original.image, 
          class: 'w-10 h-10 rounded object-cover mx-auto'
        })
        : '-'
  }
  ,

  { accessorKey: 'name_kh', header: 'ឈ្មោះខ្មែរ' },
  { accessorKey: 'name_en', header: 'ឈ្មោះអង់គ្លេស' },
  { accessorKey: 'dob', header: 'ថ្ងៃកំណើត' },
  { accessorKey: 'phone', header: 'ទូរស័ព្ទ' },
  { accessorKey: 'gender', header: 'ភេទ' }
]
</script>

<template>
  <div class="flex flex-col gap-4 font-battambang border dark:border-slate-700 p-3">
    <div class="flex items-center justify-between border-b dark:border-slate-700 p-2 gap-3">
      <div class="flex items-center gap-5 ">
        <UButton v-if="canEdit" color="danger" @click="bulkEdit" icon="i-lucide-edit-2"
          :disabled="selectedStudents.length === 0">

        </UButton>

        <!-- Bulk Delete -->
        <UButton v-if="canDelete" color="danger" @click="bulkDelete" icon="i-lucide-trash-2"
          :disabled="selectedStudents.length === 0">

        </UButton>

        <!-- Create Student -->
        <UButton v-if="canCreate" color="danger" @click="showModal = true" icon="i-lucide-plus">

        </UButton>
      </div>


      <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="ស្វែងរកឈ្មោះ ឬ ទូរស័ព្ទ..."
        class="max-w-xs" />
    </div>

    <!-- Students Table -->
    <UTable sticky :data="paginatedData" :columns="columns" class="max-h-115 overflow-auto border dark:border-slate-700"
      :ui="{
        thead: 'sticky top-0 bg-gray-100 dark:bg-slate-800 z-10 text-center',
        th: 'px-4 py-3 text-sm  font-semibold',
        td: 'px-4 py-3 text-sm border-b border-r  dark:border-slate-700',
      }" />

    <!-- Pagination Controls + Total + Per Page -->
    <div class="flex items-center justify-between mt-2">
      <div class="font-battambang">សរុប: {{ totalItems }} សិស្ស</div>

      <div class="flex items-center gap-2">
        <label class="font-battambang">បង្ហាញ:</label>
        <select v-model.number="perPage" @change="changePerPage(perPage)" class="border rounded py-1 px-2">
          <option v-for="opt in perPageOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>

        <UPagination v-model:page="currentPage" :total="totalItems" :page-size="perPage" active-color="neutral" />
      </div>
    </div>

    <!-- Student Modal -->
    <UModal v-model:open="showModal">
      <template #header>
        <h3 class="text-lg font-semibold font-battambang">{{ isEdit ? 'កែប្រែសិស្ស' : 'បង្កើតសិស្សថ្មី' }}</h3>
      </template>

      <template #body>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 font-battambang">
          <UInput v-model="nameKh" placeholder="ឈ្មោះខ្មែរ" />
          <UInput v-model="nameEn" placeholder="ឈ្មោះអង់គ្លេស" />
          <UInput v-model="dob" type="date" placeholder="ថ្ងៃកំណើត" />
          <UInput v-model="phone" placeholder="លេខទូរស័ព្ទ" />
          <select v-model="gender" class="border rounded px-2 py-1">
            <option value="M">ប្រុស</option>
            <option value="F">ស្រី</option>
            <option value="O">ផ្សេងៗ</option>
          </select>
          <input type="file" @change="onFileChange" />
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2 font-battambang">
          <UButton color="gray" variant="soft" @click="resetForm">បោះបង់</UButton>
          <UButton color="success" @click="submitForm">{{ isEdit ? 'កែប្រែ' : 'រក្សាទុក' }}</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
