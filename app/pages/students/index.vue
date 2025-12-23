<script setup lang="ts">
import { h, resolveComponent, ref, computed, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useStudent, type Student } from '~/composables/useStudent'

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UInput = resolveComponent('UInput')
const UModal = resolveComponent('UModal')

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const { getStudents, createStudent, updateStudent, deleteStudent } = useStudent()

const students = ref<Student[]>([])
const loading = ref(false)
const searchQuery = ref('')

/* ===== Modal ===== */
const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)

/* ===== Form ===== */
const name = ref('')
const age = ref<number | null>(null)
const phone = ref('')
const image = ref<File | null>(null)

/* ===== Fetch ===== */
const fetchStudents = async () => {
  loading.value = true
  students.value = await getStudents()
  loading.value = false
}
onMounted(fetchStudents)

/* ===== Filter ===== */
const filteredData = computed(() => {
  if (!searchQuery.value) return students.value
  return students.value.filter(s =>
    s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    s.phone.includes(searchQuery.value)
  )
})

/* ===== File ===== */
const onFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  image.value = files && files.length ? files[0] : null
}

/* ===== Reset ===== */
const resetForm = () => {
  name.value = ''
  age.value = null
  phone.value = ''
  image.value = null
  isEdit.value = false
  currentId.value = null
  showModal.value = false
}

/* ===== Submit ===== */
const submitForm = async () => {
  const form = new FormData()
  form.append('name', name.value)
  form.append('age', String(age.value))
  form.append('phone', phone.value)
  if (image.value) form.append('image', image.value)

  if (isEdit.value && currentId.value) {
    await updateStudent(currentId.value, form)
  } else {
    await createStudent(form)
  }

  await fetchStudents()
  resetForm()
}

/* ===== Edit ===== */
const editStudent = (s: Student) => {
  isEdit.value = true
  currentId.value = s.id
  name.value = s.name
  age.value = s.age
  phone.value = s.phone
  showModal.value = true
}

/* ===== Delete ===== */
const removeStudent = async (id: number) => {
  if (confirm('តើអ្នកពិតជាចង់លុបសិស្សនេះមែនទេ?')) {
    await deleteStudent(id)
    await fetchStudents()
  }
}

/* ===== Columns ===== */
const columns: TableColumn<Student>[] = [
  { accessorKey: 'id', header: '#', cell: ({ row }) => row.index + 1 },
  {
    id: 'image',
    header: 'រូបភាព',
    cell: ({ row }) =>
      row.original.image
        ? h('img', {
          src: `${apiBase}/uploads/${row.original.image}`,
          class: 'w-10 h-10 rounded object-cover mx-auto'
        })
        : '-'
  },
  { accessorKey: 'name', header: 'ឈ្មោះ' },
  { accessorKey: 'age', header: 'អាយុ' },
  { accessorKey: 'phone', header: 'ទូរស័ព្ទ' },
  {
    id: 'actions',
    header: 'សកម្មភាព',
    cell: ({ row }) =>
      h(
        UDropdownMenu,
        {
          content: { align: 'end' },
          items: [
            { label: 'កែប្រែ', onSelect: () => editStudent(row.original) },
            { label: 'លុប', onSelect: () => removeStudent(row.original.id) }
          ]
        },
        () =>
          h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            variant: 'ghost',
            color: 'neutral'
          })
      )
  }
]
</script>
<template>
  <div class="flex flex-col gap-4 font-battambang">

    <!-- ===== Search + Action ===== -->
    <div class="flex items-center justify-between gap-3">
      <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="ស្វែងរកឈ្មោះ ឬ ទូរស័ព្ទ..."
        class="max-w-xs" />

      <UButton color="primary" @click="showModal = true">
        ➕ បង្កើតសិស្សថ្មី
      </UButton>

    </div>

    <!-- ===== Table ===== -->
    <UTable sticky :data="filteredData" :columns="columns"
      class="max-h-140 overflow-auto border border-gray-300 dark:border-slate-700" :ui="{
        thead: 'sticky top-0 bg-gray-100 dark:bg-slate-800 z-10 text-center',
        th: 'px-4 py-3 text-sm border-r font-semibold',
        td: 'px-4 py-3 text-sm border-b border-r',
        tr: 'odd:bg-gray-50 even:bg-white dark:odd:bg-slate-900 dark:even:bg-slate-950 hover:bg-primary/5'
      }" />

    <UModal v-model:open="showModal">
      <template #header>
        <h3 class="text-lg font-semibold font-battambang">
          {{ isEdit ? 'កែប្រែសិស្ស' : 'បង្កើតសិស្សថ្មី' }}
        </h3>
      </template>

      <template #body>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 font-battambang">
          <UInput v-model="name" placeholder="ឈ្មោះ" />
          <UInput v-model="age" type="number" placeholder="អាយុ" />
          <UInput v-model="phone" placeholder="លេខទូរស័ព្ទ" />
          <input type="file" @change="onFileChange" />
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="gray" variant="soft" @click="resetForm">
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
