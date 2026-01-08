<script setup lang="ts">
import { ref, computed, onMounted, h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useAcademyYears } from '~/composables/useAcademyYears'

/* UI */
const UButton = resolveComponent('UButton')
const UInput = resolveComponent('UInput')
const UModal = resolveComponent('UModal')
const UTable = resolveComponent('UTable')
const UPagination = resolveComponent('UPagination')

definePageMeta({ layout: 'admin', middleware: 'auth' })

/* Data */
const {
  academyYears,
  fetchAcademyYears,
  createAcademyYear,
  updateAcademyYear,
  deleteAcademyYear
} = useAcademyYears()

onMounted(fetchAcademyYears)

/* Search + Pagination */
const searchQuery = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const filteredData = computed(() => {
  if (!searchQuery.value) return academyYears.value
  return academyYears.value.filter(i =>
    i.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredData.value.slice(start, start + perPage.value)
})

/* Selection */
const selectedIds = ref<number[]>([])
const toggleSelect = (id: number) => {
  const i = selectedIds.value.indexOf(id)
  i === -1 ? selectedIds.value.push(id) : selectedIds.value.splice(i, 1)
}
const toggleAll = (checked: boolean) => {
  selectedIds.value = checked ? paginatedData.value.map(i => i.id) : []
}

/* Modal */
const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)
const name = ref('')

const resetForm = () => {
  name.value = ''
  currentId.value = null
  isEdit.value = false
  showModal.value = false
}

const submitForm = async () => {
  if (!name.value) return
  if (isEdit.value && currentId.value) {
    await updateAcademyYear(currentId.value, { name: name.value })
  } else {
    await createAcademyYear({ name: name.value })
  }
  resetForm()
}

/* Header actions */
const editSelected = () => {
  if (selectedIds.value.length !== 1) return alert('ជ្រើស ១ ប៉ុណ្ណោះ')
  const item = academyYears.value.find(i => i.id === selectedIds.value[0])
  if (!item) return
  currentId.value = item.id
  name.value = item.name
  isEdit.value = true
  showModal.value = true
}

const deleteSelected = async () => {
  if (!selectedIds.value.length) return
  if (!confirm(`លុប ${selectedIds.value.length} ឆ្នាំសិក្សា?`)) return
  for (const id of selectedIds.value) await deleteAcademyYear(id)
  selectedIds.value = []
}

/* Columns */
const columns: TableColumn<any>[] = [
  {
    id: 'select',
    header: h('input', {
      type: 'checkbox',
      class: 'w-4 h-4',
      onChange: (e: Event) =>
        toggleAll((e.target as HTMLInputElement).checked)
    }),
    cell: ({ row }) =>
      h('input', {
        type: 'checkbox',
        class: 'w-4 h-4',
        checked: selectedIds.value.includes(row.original.id),
        onChange: () => toggleSelect(row.original.id)
      }),
   
  },
  
  { accessorKey: 'name', header: 'ឆ្នាំសិក្សា' ,size: 50 }
]
</script>

<template>
<div class="flex flex-col gap-4 font-battambang border p-3 dark:border-slate-700">

  <!-- Header -->
  <div class="flex justify-between items-center border-b  dark:border-slate-700 p-2">
    <div class="flex gap-3">
      <UButton icon="i-lucide-plus" color="danger" @click="showModal = true" />
      <UButton icon="i-lucide-edit" color="danger"
        :disabled="selectedIds.length !== 1"
        @click="editSelected" />
      <UButton icon="i-lucide-trash-2" color="danger"
        :disabled="!selectedIds.length"
        @click="deleteSelected" />
    </div>

    <UInput
      v-model="searchQuery"
      icon="i-heroicons-magnifying-glass"
      placeholder="ស្វែងរកឆ្នាំសិក្សា..."
      class="max-w-xs"
    />
  </div>

  <!-- Table -->
  <UTable
    sticky
    :data="paginatedData"
    :columns="columns"
    class="max-h-115 overflow-auto border dark:border-slate-700"
    :ui="{
      thead: 'sticky top-0 bg-gray-100 dark:bg-slate-800 text-center',
      th: 'px-4 py-3 font-semibold',
      td: 'px-4 py-3 border-b border-r dark:border-slate-700'
    }"
  />

  <!-- Pagination -->
  <div class="flex justify-between items-center">
    <div>សរុប: {{ filteredData.length }} ឆ្នាំសិក្សា</div>
    <UPagination
      v-model:page="currentPage"
      :total="filteredData.length"
      :page-size="perPage"
    />
  </div>

  <!-- Modal -->
  <UModal v-model:open="showModal">
    <template #header>
      <h3 class="text-lg font-semibold">
        {{ isEdit ? 'កែប្រែឆ្នាំសិក្សា' : 'បន្ថែមឆ្នាំសិក្សា' }}
      </h3>
    </template>

    <template #body>
      <UInput v-model="name" placeholder="2024-2025" class="w-full" />
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="gray" variant="soft" @click="resetForm">បោះបង់</UButton>
        <UButton color="success" @click="submitForm">រក្សាទុក</UButton>
      </div>
    </template>
  </UModal>

</div>
</template>
