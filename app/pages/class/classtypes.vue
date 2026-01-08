<script setup lang="ts">
import { h, resolveComponent, ref, computed, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useClassTypes, type ClassType } from '~/composables/useClasstypes'
import { useAuth } from '~/composables/useAuth'

/* ===== UI Components ===== */
const UButton = resolveComponent('UButton')
const UInput = resolveComponent('UInput')
const UModal = resolveComponent('UModal')
const UTable = resolveComponent('UTable')
const UPagination = resolveComponent('UPagination')

definePageMeta({ layout: 'admin', middleware: 'auth' })

/* ===== Permissions ===== */
const { hasPermission } = useAuth()
const canCreate = computed(() => hasPermission('create_classtypes'))
const canEdit = computed(() => hasPermission('update_classtypes'))
const canDelete = computed(() => hasPermission('delete_classtypes'))

/* ===== API ===== */
const { getClassTypes, createClassType, updateClassType, deleteClassType } = useClassTypes()

/* ===== State ===== */
const items = ref<ClassType[]>([])
const loading = ref(false)
const searchQuery = ref('')

/* ===== Pagination ===== */
const currentPage = ref(1)
const perPage = ref(35)
const perPageOptions = [35, 100, 150, 200]
const changePerPage = (value: number) => {
  perPage.value = value
  currentPage.value = 1
}

/* ===== Fetch Data ===== */
const fetchData = async () => {
  loading.value = true
  items.value = await getClassTypes()
  loading.value = false
}
onMounted(fetchData)

/* ===== Filter & Pagination ===== */
const filteredData = computed(() => {
  if (!searchQuery.value) return items.value
  return items.value.filter(i =>
    i.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
const totalItems = computed(() => filteredData.value.length)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredData.value.slice(start, start + perPage.value)
})

/* ===== Row Selection ===== */
const selectedItems = ref<number[]>([])
const toggleSelection = (id: number) => {
  const index = selectedItems.value.indexOf(id)
  if (index === -1) selectedItems.value.push(id)
  else selectedItems.value.splice(index, 1)
}
const toggleAll = (checked: boolean) => {
  selectedItems.value = checked ? paginatedData.value.map(i => i.id) : []
}
const isSelected = (id: number) => selectedItems.value.includes(id)

/* ===== CRUD Modal ===== */
const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)
const name = ref('')

const resetForm = () => {
  name.value = ''
  isEdit.value = false
  currentId.value = null
  showModal.value = false
}

const submitForm = async () => {
  if (!name.value) return

  if (isEdit.value && currentId.value) {
    await updateClassType(currentId.value, { name: name.value })
  } else {
    await createClassType({ name: name.value })
  }

  await fetchData()
  resetForm()
}

const editItem = (item: ClassType) => {
  isEdit.value = true
  currentId.value = item.id
  name.value = item.name
  showModal.value = true
}

const removeItem = async (id: number) => {
  if (!canDelete.value) return
  if (confirm('តើអ្នកពិតជាចង់លុបប្រភេទថ្នាក់នេះមែនទេ?')) {
    await deleteClassType(id)
    await fetchData()
    selectedItems.value = selectedItems.value.filter(i => i !== id)
  }
}

/* ===== Header Buttons ===== */
const editSelected = async () => {
  if (selectedItems.value.length !== 1) {
    alert('សូមជ្រើសរើសតែ ១ ប្រភេទសម្រាប់កែប្រែ')
    return
  }
  const item = items.value.find(i => i.id === selectedItems.value[0])
  if (item) editItem(item)
}

const deleteSelected = async () => {
  if (selectedItems.value.length === 0) {
    alert('សូមជ្រើសរើសយ៉ាងតិច ១ ប្រភេទសម្រាប់លុប')
    return
  }
  if (confirm(`តើអ្នកពិតជាចង់លុប ${selectedItems.value.length} ប្រភេទថ្នាក់មែនទេ?`)) {
    for (const id of selectedItems.value) {
      await deleteClassType(id)
    }
    selectedItems.value = []
    await fetchData()
  }
}

/* ===== Table Columns ===== */
const columns: TableColumn<ClassType>[] = [
  {
    id: 'select',
    header: h('input', {
      type: 'checkbox',
      class: 'w-4 h-4', // checkbox size
      checked: computed(() => paginatedData.value.every(i => isSelected(i.id))).value,
      onChange: (e: Event) => toggleAll((e.target as HTMLInputElement).checked)
    }),
    cell: ({ row }) =>
      h('input', {
        type: 'checkbox',
        class: 'w-4 h-4', // checkbox size
        checked: isSelected(row.original.id),
        onChange: () => toggleSelection(row.original.id)
      }),
    size: 40 // width column in px
  },
  {
    accessorKey: 'name',
    header: 'ប្រភេទថ្នាក់',
    cell: ({ row }) =>
      h('div', { class: 'w-40 overflow-hidden' }, row.original.name), // Tailwind w-40 ~ 10rem
  },
]

</script>

<template>
  <div class="flex flex-col gap-4 font-battambang border dark:border-slate-700 p-3">

    <!-- Header Toolbar -->
    <div class="flex items-center justify-between border-b dark:border-slate-700 p-2 gap-3">
      <div class="flex gap-5">
        <UButton v-if="canCreate" color="danger" icon="i-lucide-plus" @click="showModal = true">

        </UButton>

        <UButton v-if="canEdit" color="danger" icon="i-lucide-edit" :disabled="selectedItems.length !== 1"
          @click="editSelected">

        </UButton>

        <UButton v-if="canDelete" color="danger" icon="i-lucide-trash-2" :disabled="selectedItems.length === 0"
          @click="deleteSelected">

        </UButton>
      </div>

      <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="ស្វែងរកប្រភេទថ្នាក់..."
        class="max-w-xs" />
    </div>

    <!-- Table -->
    <UTable sticky :data="paginatedData" :columns="columns" class="max-h-115 overflow-auto border dark:border-slate-700"
      :ui="{
        thead: 'sticky top-0 bg-gray-100 dark:bg-slate-800 z-10 text-center',
        th: 'px-4 py-3 text-sm font-semibold',
        td: 'px-4 py-3 text-sm border-b border-r dark:border-slate-700'
      }" />

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-2">
      <div>សរុប: {{ totalItems }} ប្រភេទថ្នាក់</div>
      <div class="flex items-center gap-2">
        <label>បង្ហាញ:</label>
        <select v-model.number="perPage" @change="changePerPage(perPage)" class="border rounded py-1 px-2">
          <option v-for="opt in perPageOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <UPagination v-model:page="currentPage" :total="totalItems" :page-size="perPage" active-color="neutral" />
      </div>
    </div>

    <!-- Modal -->
    <UModal v-model:open="showModal">
      <template #header>
        <h3 class="text-lg font-semibold font-battambang">{{ isEdit ? 'កែប្រែប្រភេទថ្នាក់' : 'បន្ថែមប្រភេទថ្នាក់' }}
        </h3>
      </template>
      <template #body>
        <UInput v-model="name" placeholder="ឈ្មោះប្រភេទថ្នាក់ (12A, 12B...)" class="w-full" />
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
