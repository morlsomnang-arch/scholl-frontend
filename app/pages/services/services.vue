<script setup lang="ts">
import { h, resolveComponent, ref, computed, onMounted, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useServices, type Service } from '~/composables/useServices'
import { useAuth } from '~/composables/useAuth'

/* ===== UI Components ===== */
const UButton = resolveComponent('UButton')
const UInput = resolveComponent('UInput')
const UModal = resolveComponent('UModal')
const UTable = resolveComponent('UTable')
const UPagination = resolveComponent('UPagination')
const USelect = resolveComponent('USelect')

definePageMeta({ layout: 'admin', middleware: 'auth' })

/* ===== Permissions ===== */
const { hasPermission } = useAuth()
const canCreate = computed(() => hasPermission('create_service'))
const canEdit = computed(() => hasPermission('update_service'))
const canDelete = computed(() => hasPermission('delete_service'))

/* ===== API ===== */
const {
  services,
  students,
  classes,
  academyYears,
  fetchServices,
  fetchDropdowns,
  createService,
  updateService,
  deleteService
} = useServices()

/* ===== State ===== */
const mounted = ref(false)
const loading = ref(false)
const searchQuery = ref('')
const selectedItems = ref<number[]>([])

/* ===== Pagination ===== */
const currentPage = ref(1)
const perPage = ref(35)
const perPageOptions = [35, 100, 150, 200]
const changePerPage = (value: number) => {
  perPage.value = value
  currentPage.value = 1
}

/* ===== Modal / Form ===== */
const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)

const student_id = ref<number | null>(null)
const class_id = ref<number | null>(null)
const classType_id = ref<number | null>(null)
const academyYear_id = ref<number | null>(null)
const remark = ref('')

/* ===== Options for selects ===== */
const studentOptions = computed(() =>
  students.value.map(s => ({ label: s.name_kh, value: s.id }))
)
const classOptions = computed(() =>
  classes.value.map(c => ({ label: c.name, value: c.id }))
)
const academyYearOptions = computed(() =>
  academyYears.value.map(y => ({ label: y.name, value: y.id }))
)

/* ===== ClassType options depend on selected Class ===== */
watch(class_id, () => {
  classType_id.value = null // reset when class changes
})
const classTypeOptions = computed(() => {
  if (!class_id.value) return []
  const cls = classes.value.find(c => c.id === class_id.value)
  if (!cls) return []
  return cls.ClassClasstypes.map(cc => ({
    label: cc.ClassType?.name || '',
    value: cc.classtype_id
  }))
})

/* ===== Reset form ===== */
const resetForm = () => {
  student_id.value = null
  class_id.value = null
  classType_id.value = null
  academyYear_id.value = null
  remark.value = ''
  isEdit.value = false
  currentId.value = null
  showModal.value = false
}

/* ===== Submit form ===== */
const submitForm = async () => {
  if (!student_id.value || !class_id.value || !classType_id.value || !academyYear_id.value) {
    alert('សូមបំពេញទិន្នន័យទាំងអស់!')
    return
  }

  const payload = {
    student_id: student_id.value,
    class_id: class_id.value,
    classType_id: classType_id.value,
    academyYear_id: academyYear_id.value,
    remark: remark.value
  }

  if (isEdit.value && currentId.value) {
    await updateService(currentId.value, payload)
  } else {
    await createService(payload)
  }

  await fetchServices()
  resetForm()
}

/* ===== Edit / Remove ===== */
const editItem = (item: Service) => {
  if (!item) return
  isEdit.value = true
  currentId.value = item.id
  student_id.value = item.student_id
  class_id.value = item.ClassClasstype?.class_id || null
  classType_id.value = item.ClassClasstype?.classtype_id || null
  academyYear_id.value = item.academy_year_id
  remark.value = item.remark || ''
  showModal.value = true
}

const removeItem = async (id: number) => {
  if (!canDelete.value) return
  if (confirm('តើអ្នកពិតជាចង់លុប Service មែនទេ?')) {
    await deleteService(id)
    selectedItems.value = selectedItems.value.filter(i => i !== id)
  }
}

/* ===== Row Selection ===== */
const toggleSelection = (id: number) => {
  const index = selectedItems.value.indexOf(id)
  if (index === -1) selectedItems.value.push(id)
  else selectedItems.value.splice(index, 1)
}
const toggleAll = (checked: boolean) => {
  selectedItems.value = checked ? paginatedData.value.map(i => i.id) : []
}
const isSelected = (id: number) => selectedItems.value.includes(id)

/* ===== Filter & Pagination ===== */
const filteredData = computed(() => {
  if (!searchQuery.value) return services.value
  return services.value.filter(i =>
    i.Student?.name_kh?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
const totalItems = computed(() => filteredData.value.length)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredData.value.slice(start, start + perPage.value)
})

/* ===== Table Columns with Checkbox ===== */
const columns: TableColumn<Service>[] = [
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
  {
    accessorKey: 'Student',
    header: 'សិស្ស',
    cell: ({ row }) => row.original.Student?.name_kh || ''
  },
  {
    accessorKey: 'ClassClasstype',
    header: 'ថ្នាក់',
    cell: ({ row }) => row.original.ClassClasstype?.Class?.name || ''
  },
  {
    accessorKey: 'ClassClasstype',
    header: 'ប្រភេទថ្នាក់',
    cell: ({ row }) => row.original.ClassClasstype?.ClassType?.name || ''
  },
  {
    accessorKey: 'AcademyYear',
    header: 'ឆ្នាំសិក្សា',
    cell: ({ row }) => row.original.AcademyYear?.name || ''
  },
  {
    accessorKey: 'remark',
    header: 'ចំណាំ',
    cell: ({ row }) => row.original.remark || ''
  }
]

/* ===== Fetch Data on Mounted ===== */
onMounted(async () => {
  await fetchDropdowns()
  await fetchServices()
  mounted.value = true
})
</script>

<template>
  <div class="flex flex-col gap-4 font-battambang border dark:border-slate-700 p-3">

    <!-- Header Toolbar -->
    <div class="flex items-center justify-between border-b dark:border-slate-700 p-2 gap-3">
      <div class="flex gap-5">
        <UButton
          v-if="canCreate"
          color="danger"
          icon="i-lucide-plus"
          @click="showModal = true"
        />
        <UButton
          v-if="canEdit"
          color="danger"
          icon="i-lucide-edit"
          :disabled="selectedItems.length !== 1"
          @click="editItem(paginatedData.find(i => i.id === selectedItems[0]))"
        />
        <UButton
          v-if="canDelete"
          color="danger"
          icon="i-lucide-trash-2"
          :disabled="selectedItems.length === 0"
          @click="selectedItems.forEach(id => removeItem(id))"
        />
      </div>
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="ស្វែងរកសិស្ស..."
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
        thead: 'sticky top-0 bg-gray-100 dark:bg-slate-800 z-10 text-center',
        th: 'px-4 py-3 text-sm font-semibold',
        td: 'px-4 py-3 text-sm border-b border-r dark:border-slate-700'
      }"
    />

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-2">
      <div>សរុប: {{ totalItems }} Services</div>
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
        <h3 class="text-lg font-semibold font-battambang">{{ isEdit ? 'កែប្រែ Service' : 'បន្ថែម Service' }}</h3>
      </template>
      <template #body>
        <div class="flex flex-col gap-3 font-battambang">
          <USelect v-model="student_id" :items="studentOptions" placeholder="ជ្រើសសិស្ស" />
          <USelect v-model="class_id" :items="classOptions" placeholder="ជ្រើសថ្នាក់" />
          <USelect
            v-model="classType_id"
            :items="classTypeOptions"
            placeholder="ជ្រើសប្រភេទថ្នាក់"
            :disabled="!class_id"
          />
          <USelect v-model="academyYear_id" :items="academyYearOptions" placeholder="ជ្រើសឆ្នាំសិក្សា" />
          <UInput v-model="remark" placeholder="ចំណាំ" />
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
