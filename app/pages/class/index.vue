<script setup lang="ts">
import { h, resolveComponent, ref, computed, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useClasses, type ClassItem } from '~/composables/useClasses'
import { useClassTypes, type ClassType } from '~/composables/useClasstypes'
import { useClassClasstype } from '~/composables/useClassClasstype'
import { useAuth } from '~/composables/useAuth'
const UButton = resolveComponent('UButton')
const UInput = resolveComponent('UInput')
const UModal = resolveComponent('UModal')
const UTable = resolveComponent('UTable')
const UPagination = resolveComponent('UPagination')

definePageMeta({ layout: 'admin', middleware: 'auth' })
const { hasPermission } = useAuth()
const canCreate = computed(() => hasPermission('create_classes'))
const canEdit = computed(() => hasPermission('update_classes'))
const canDelete = computed(() => hasPermission('delete_classes'))

const { getClasses, createClass, updateClass, deleteClass } = useClasses()
const { getClassTypes } = useClassTypes()
const { assignOrUpdate } = useClassClasstype()
const classes = ref<ClassItem[]>([])
const classTypes = ref<ClassType[]>([])
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const perPage = ref(35)
const perPageOptions = [35, 100, 150, 200]
const changePerPage = (value: number) => {
  perPage.value = value
  currentPage.value = 1
}
const fetchData = async () => {
  loading.value = true
  classes.value = await getClasses()
  classTypes.value = await getClassTypes()
  loading.value = false
}
onMounted(fetchData)
const filteredData = computed(() => {
  if (!searchQuery.value) return classes.value
  return classes.value.filter(c =>
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
const totalItems = computed(() => filteredData.value.length)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredData.value.slice(start, start + perPage.value)
})
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
    await updateClass(currentId.value, { name: name.value })
  } else {
    await createClass({ name: name.value })
  }

  await fetchData()
  resetForm()
}

const editItem = (c: ClassItem) => {
  isEdit.value = true
  currentId.value = c.id
  name.value = c.name
  showModal.value = true
}

const removeItem = async (id: number) => {
  if (!canDelete.value) return
  if (confirm('តើអ្នកពិតជាចង់លុបថ្នាក់នេះមែនទេ?')) {
    await deleteClass(id)
    await fetchData()
  }
}

/* ===== Row Selection ===== */
const selectedClasses = ref<number[]>([])
const toggleSelection = (id: number) => {
  const index = selectedClasses.value.indexOf(id)
  if (index === -1) selectedClasses.value.push(id)
  else selectedClasses.value.splice(index, 1)
}
const isSelected = (id: number) => selectedClasses.value.includes(id)


const showAssign = ref(false)
const selectedClassId = ref<number | null>(null)
const selectedTypes = ref<number[]>([])
const groupNo = ref(1)

const openAssign = (c: ClassItem) => {
  selectedClassId.value = c.id    
  selectedTypes.value = c.ClassClasstypes?.map(ct => ct.ClassType.id) || []
  showAssign.value = true
}

const toggleAllTypes = (checked: boolean) => {
  selectedTypes.value = checked ? classTypes.value.map(t => t.id) : []
}

const saveAssign = async () => {
  if (!selectedClassId.value) return
  await assignOrUpdate({
    class_id: selectedClassId.value,
    classtype_ids: selectedTypes.value,
    group_no: groupNo.value
  })
  showAssign.value = false
  await fetchData()
}

const columns: TableColumn<ClassItem>[] = [
  {
    id: 'select',
    header: h('input', {
      type: 'checkbox',
      class: 'w-4 h-4',
      checked: computed(() =>
        paginatedData.value.every(c => isSelected(c.id))
      ).value,
      onChange: (e: Event) => {
        const checked = (e.target as HTMLInputElement).checked
        selectedClasses.value = checked
          ? paginatedData.value.map(c => c.id)
          : []
      }
    }),
    cell: ({ row }) =>
      h('input', {
        type: 'checkbox',
        class: 'w-4 h-4',
        checked: isSelected(row.original.id),
        onChange: () => toggleSelection(row.original.id)
      })
  },

  { accessorKey: 'name', header: 'ថ្នាក់' },

  {
    id: 'types',
    header: 'ប្រភេទថ្នាក់',
    cell: ({ row }) => {
      const types = row.original.ClassClasstypes
        ?.map(ct => ct.ClassType?.name)
        .filter(Boolean)
      return types && types.length ? types.join(', ') : '-'
    }
  },

  /* ===== ACTION COLUMN WITH ICONS ===== */
  {
    id: 'action',
    header: 'សកម្មភាព',
    cell: ({ row }) =>
      h('div', { class: 'flex justify-center gap-3 items-center' }, [
        canEdit.value &&
        h(UButton, {
      
          color: 'danger',
     
          icon: 'i-lucide-edit',
          title: 'កែប្រែ',
          onClick: () => editItem(row.original)
        }),
        canDelete.value &&
        h(UButton, {
          // size: 'xs',
          color: 'danger',
          // variant: 'soft',
          icon: 'i-lucide-trash-2',
          title: 'លុប',
          onClick: () => removeItem(row.original.id)
        }),
        h(UButton, {
          // size: 'xs',
          color: 'danger',
          // variant: 'soft',
          icon: 'i-lucide-link',
          title: 'ភ្ជាប់ប្រភេទថ្នាក់ (Assign)',
          onClick: () => openAssign(row.original)
        })
      ])
  }
]

</script>

<template>
  <div class="flex flex-col gap-4 font-battambang border dark:border-slate-700 p-3">
    <!-- Header -->
    <div class="flex items-center justify-between border-b dark:border-slate-700 p-2 gap-3">
      <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="ស្វែងរកថ្នាក់..."
        class="max-w-xs" />
      <UButton v-if="canCreate" color="danger" icon="i-lucide-plus" @click="showModal = true" />
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
      <div>សរុប: {{ totalItems }} ថ្នាក់</div>
      <div class="flex items-center gap-2">
        <label>បង្ហាញ:</label>
        <select v-model.number="perPage" @change="changePerPage(perPage)" class="border rounded py-1 px-2">
          <option v-for="opt in perPageOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <UPagination v-model:page="currentPage" :total="totalItems" :page-size="perPage" active-color="neutral" />
      </div>
    </div>

    <!-- CRUD Modal -->
    <UModal v-model:open="showModal">
      <template #header>
        <h3 class="text-lg font-semibold font-battambang">{{ isEdit ? 'កែប្រែថ្នាក់' : 'បន្ថែមថ្នាក់' }}</h3>
      </template>
      <template #body>
        <UInput v-model="name" class="w-full" placeholder="ឈ្មោះថ្នាក់ (10, 11, 12...)" />
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 font-battambang">
          <UButton color="gray" variant="soft" @click="resetForm">បោះបង់</UButton>
          <UButton color="success" @click="submitForm">{{ isEdit ? 'កែប្រែ' : 'រក្សាទុក' }}</UButton>
        </div>
      </template>
    </UModal>

    <!-- Assign Modal -->
    <UModal v-model:open="showAssign">
      <template #header>
        <h3 class="text-lg font-semibold font-battambang">Assign ប្រភេទថ្នាក់</h3>
      </template>
      <template #body>
        <div class="flex flex-col gap-2 font-battambang">
          <label class="flex gap-2 items-center">
            <input type="checkbox" class="w-4 h-4" :checked="selectedTypes.length === classTypes.length"
              @change="toggleAllTypes($event.target.checked)" />
            Select All
          </label>
          <label v-for="t in classTypes" :key="t.id" class="flex gap-2 items-center">
            <input type="checkbox" class="w-4 h-4" :value="t.id" v-model="selectedTypes" />
            {{ t.name }}
          </label>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 font-battambang">
          <UButton color="gray" variant="soft" @click="showAssign = false">បោះបង់</UButton>
          <UButton color="success" @click="saveAssign">រក្សាទុក</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
