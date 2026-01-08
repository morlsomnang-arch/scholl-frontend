<script setup lang="ts">
import { h, resolveComponent, ref, computed, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useParents } from '~/composables/useParents'
import { useTypeParents } from '~/composables/useTypeParents'
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
const canCreate = computed(() => hasPermission('create_parents'))
const canEdit = computed(() => hasPermission('update_parents'))
const canDelete = computed(() => hasPermission('delete_parents'))

/* ===== API ===== */
const { parents, fetchParents, createParent, updateParent, deleteParent } = useParents()
const { typeParents, fetchTypeParents } = useTypeParents()

/* ===== State ===== */
const items = ref<any[]>([])
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
    await fetchParents()
    await fetchTypeParents()
    items.value = parents.value
    loading.value = false
}
onMounted(fetchData)

/* ===== Filter & Pagination ===== */
const filteredData = computed(() => {
    if (!searchQuery.value) return items.value
    return items.value.filter(i =>
        i.name_kh.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        i.name_en.toLowerCase().includes(searchQuery.value.toLowerCase())
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

const form = ref({
    name_kh: '',
    name_en: '',
    gender: 'male',
    occupation: '',
    phone: '',
    type_parent_id: ''
})

const resetForm = () => {
    form.value = {
        name_kh: '',
        name_en: '',
        gender: 'male',
        occupation: '',
        phone: '',
        type_parent_id: ''
    }
    isEdit.value = false
    currentId.value = null
    showModal.value = false
}

const submitForm = async () => {
    if (isEdit.value && currentId.value) {
        await updateParent(currentId.value, form.value)
    } else {
        await createParent(form.value)
    }
    await fetchData()
    resetForm()
}

const editItem = (item: any) => {
    isEdit.value = true
    currentId.value = item.id
    form.value = { ...item }
    showModal.value = true
}

const removeItem = async (id: number) => {
    if (!canDelete.value) return
    if (confirm('តើអ្នកពិតជាចង់លុប Parent នេះមែនទេ?')) {
        await deleteParent(id)
        await fetchData()
        selectedItems.value = selectedItems.value.filter(i => i !== id)
    }
}

/* ===== Header Buttons ===== */
const editSelected = () => {
    if (selectedItems.value.length !== 1) {
        alert('សូមជ្រើសរើសតែ ១ Parent សម្រាប់កែប្រែ')
        return
    }
    const item = items.value.find(i => i.id === selectedItems.value[0])
    if (item) editItem(item)
}

const deleteSelected = async () => {
    if (selectedItems.value.length === 0) {
        alert('សូមជ្រើសរើសយ៉ាងតិច ១ Parent សម្រាប់លុប')
        return
    }
    if (confirm(`តើអ្នកពិតជាចង់លុប ${selectedItems.value.length} Parent មែនទេ?`)) {
        for (const id of selectedItems.value) {
            await deleteParent(id)
        }
        selectedItems.value = []
        await fetchData()
    }
}

const columns: TableColumn<any>[] = [
  {
    id: 'select',
    header: h('input', {
      type: 'checkbox',
      class: 'w-4 h-4',
      checked: computed(() => paginatedData.value.every(i => isSelected(i.id))).value,
      onChange: (e: Event) => toggleAll((e.target as HTMLInputElement).checked)
    }),
    cell: ({ row }) =>
      h('input', {
        type: 'checkbox',
        class: 'w-4 h-4',
        checked: isSelected(row.original.id),
        onChange: () => toggleSelection(row.original.id)
      }),
    size: 40
  },
  { accessorKey: 'name_kh', header: 'ឈ្មោះខ្មែរ' },
  { accessorKey: 'name_en', header: 'ឈ្មោះអង់គ្លេស' },
  { accessorKey: 'gender', header: 'ភេទ' },
  { accessorKey: 'occupation', header: 'មុខរបរ' },
  { accessorKey: 'type_parent', header: 'ប្រភេទមាតាបិតា' }, // <-- use type_parent from query
  { accessorKey: 'phone', header: 'ទូរស័ព្ទ' }
]

</script>

<template>
    <div class="flex flex-col gap-4 font-battambang border dark:border-slate-700 p-3">

        <!-- Header Toolbar -->
        <div class="flex items-center justify-between border-b dark:border-slate-700 p-2 gap-3">
            <div class="flex gap-5">
                <UButton v-if="canCreate" color="danger" icon="i-lucide-plus" @click="showModal = true" />
                <UButton v-if="canEdit" color="danger" icon="i-lucide-edit" :disabled="selectedItems.length !== 1"
                    @click="editSelected" />
                <UButton v-if="canDelete" color="danger" icon="i-lucide-trash-2" :disabled="selectedItems.length === 0"
                    @click="deleteSelected" />
            </div>

            <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="ស្វែងរក Parent..."
                class="max-w-xs" />
        </div>

        <!-- Table -->
        <UTable sticky :data="paginatedData" :columns="columns"
            class="max-h-115 overflow-auto border dark:border-slate-700" :ui="{
                thead: 'sticky top-0 bg-gray-100 dark:bg-slate-800 z-10 text-center',
                th: 'px-4 py-3 text-sm font-semibold',
                td: 'px-4 py-3 text-sm border-b border-r dark:border-slate-700'
            }" />

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-2">
            <div>សរុប: {{ totalItems }} Parent</div>
            <div class="flex items-center gap-2">
                <label>បង្ហាញ:</label>
                <select v-model.number="perPage" @change="changePerPage(perPage)" class="border rounded py-1 px-2">
                    <option v-for="opt in perPageOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <UPagination v-model:page="currentPage" :total="totalItems" :page-size="perPage"
                    active-color="neutral" />
            </div>
        </div>

        <!-- Modal -->
        <UModal v-model:open="showModal">
            <template #header>
                <h3 class="text-lg font-semibold">
                    {{ isEdit ? 'កែប្រែ Parent' : 'បន្ថែម Parent' }}
                </h3>
            </template>

            <template #body>
                <div class="grid grid-cols-2 gap-2 font-battambang">
                    <UInput v-model="form.name_kh" placeholder="ឈ្មោះខ្មែរ" class="w-full" />
                    <UInput v-model="form.name_en" placeholder="ឈ្មោះអង់គ្លេស" class="w-full" />
                    <select v-model="form.gender" class="border rounded p-1">
                        <option value="male">ប្រុស</option>
                        <option value="female">ស្រី</option>
                    </select>
                    <UInput v-model="form.phone" placeholder="ទូរស័ព្ទ" />
                    <UInput v-model="form.occupation" placeholder="មុខរបរ" />
                    <select v-model="form.type_parent_id" class="border rounded p-1 col-span-2">
                        <option disabled value="">ជ្រើសរើសប្រភេទ </option>
                        <option v-for="t in typeParents" :key="t.id" :value="t.id">
                            {{ t.name }}
                        </option>
                    </select>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton color="gray" variant="soft" @click="resetForm">បោះបង់</UButton>
                    <UButton color="success" @click="submitForm">
                        {{ isEdit ? 'កែប្រែ' : 'រក្សាទុក' }}
                    </UButton>
                </div>
            </template>
        </UModal>

    </div>
</template>
