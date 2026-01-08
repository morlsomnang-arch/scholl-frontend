<script setup lang="ts">
import { h, resolveComponent, ref, computed, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useUsers } from '~/composables/useUsers'

/* ===== UI Components ===== */
const UButton = resolveComponent('UButton')
const UInput = resolveComponent('UInput')
const UTable = resolveComponent('UTable')
const UPagination = resolveComponent('UPagination')
const UModal = resolveComponent('UModal')

/* ===== Data ===== */
const { users, fetchUsers, createUser, updateUser, deleteUser, upgradeUser } = useUsers()
onMounted(fetchUsers)

/* ===== Computed Table Data ===== */
const tableData = computed(() =>
  users.value.map(u => ({ ...u, selected: selectedUsers.value.includes(u.id) }))
)

/* ===== Page Meta ===== */
definePageMeta({ layout: 'admin', middleware: 'auth' })

/* ===== Selection ===== */
const selectedUsers = ref<number[]>([])
const toggleSelection = (id: number) => {
  const index = selectedUsers.value.indexOf(id)
  if (index === -1) selectedUsers.value.push(id)
  else selectedUsers.value.splice(index, 1)
}
const toggleAll = (checked: boolean) => {
  selectedUsers.value = checked ? tableData.value.map(u => u.id) : []
}
const isSelected = (id: number) => selectedUsers.value.includes(id)

/* ===== CRUD Modal ===== */
const showModal = ref(false)
const isEdit = ref(false)
const currentUserId = ref<number | null>(null)
const currentName = ref('')
const currentEmail = ref('')
const currentRole = ref('super')

const resetForm = () => {
  currentName.value = ''
  currentEmail.value = ''
  currentRole.value = 'super'
  currentUserId.value = null
  isEdit.value = false
  showModal.value = false
}

const submitForm = async () => {
  const payload = { name: currentName.value, email: currentEmail.value, role: currentRole.value }
  if (isEdit.value && currentUserId.value) {
    await updateUser(currentUserId.value, payload)
  } else {
    await createUser(payload)
  }
  resetForm()
}

/* ===== Role Toggle ===== */
const toggleRole = async (user: any, role: string) => {
  if (user.role === role) return
  await upgradeUser(user.id)
}

/* ===== Header Buttons ===== */
const editSelected = () => {
  if (selectedUsers.value.length !== 1) {
    alert('សូមជ្រើសរើសតែ ១ អ្នកប្រើសម្រាប់កែប្រែ')
    return
  }
  const user = users.value.find(u => u.id === selectedUsers.value[0])
  if (!user) return
  currentUserId.value = user.id
  currentName.value = user.name
  currentEmail.value = user.email
  currentRole.value = user.role
  isEdit.value = true
  showModal.value = true
}

const deleteSelected = async () => {
  if (selectedUsers.value.length === 0) return alert('សូមជ្រើសរើសយ៉ាងតិច ១ អ្នកប្រើសម្រាប់លុប')
  if (!confirm(`តើអ្នកពិតជាចង់លុប ${selectedUsers.value.length} អ្នកប្រើមែនទេ?`)) return
  for (const id of selectedUsers.value) {
    await deleteUser(id)
  }
  selectedUsers.value = []
}

/* ===== Table Columns ===== */
const columns: TableColumn<any>[] = [
  {
    id: 'select',
    header: h('input', {
      type: 'checkbox',
      class: 'w-4 h-4',
      checked: computed(() => tableData.value.every(u => isSelected(u.id))).value,
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
  { accessorKey: 'id', header: 'ID', size: 50 },
  { accessorKey: 'name', header: 'Name', cell: ({ row }) => row.original.name },
  { accessorKey: 'email', header: 'Email', cell: ({ row }) => row.original.email },
  {
    id: 'super',
    header: 'Super',
    cell: ({ row }) =>
      h('input', {
        type: 'checkbox',
        checked: row.original.role === 'super',
        class: 'w-4 h-4 accent-green-500',
        onClick: () => toggleRole(row.original, 'super')
      })
  },
  {
    id: 'employee',
    header: 'Employee',
    cell: ({ row }) =>
      h('input', {
        type: 'checkbox',
        checked: row.original.role === 'employee',
        class: 'w-4 h-4 accent-blue-500',
        onClick: () => toggleRole(row.original, 'employee')
      })
  },
  {
    id: 'guest',
    header: 'Guest',
    cell: ({ row }) =>
      h('input', {
        type: 'checkbox',
        checked: row.original.role === 'guest',
        class: 'w-4 h-4 accent-gray-500',
        onClick: () => toggleRole(row.original, 'guest')
      })
  }
]
</script>

<template>
<div class="flex flex-col gap-4 font-battambang border dark:border-slate-700 p-3">

  <!-- Header Toolbar -->
  <div class="flex items-center justify-between border-b dark:border-slate-700 p-2 gap-3">
    <div class="flex gap-5">
      <UButton color="danger" icon="i-lucide-plus" @click="showModal = true" />
      <UButton color="danger" icon="i-lucide-edit" :disabled="selectedUsers.length !== 1" @click="editSelected" />
      <UButton color="danger" icon="i-lucide-trash-2" :disabled="selectedUsers.length === 0" @click="deleteSelected" />
    </div>

    <UInput v-model="currentName" icon="i-heroicons-magnifying-glass" placeholder="ស្វែងរកអ្នកប្រើ..." class="max-w-xs" />
  </div>

  <!-- Table -->
  <UTable
    sticky
    :data="tableData"
    :columns="columns"
    class="max-h-115 overflow-auto border dark:border-slate-700"
    :ui="{
      thead: 'sticky top-0 bg-gray-100 dark:bg-slate-800 z-10 text-center',
      th: 'px-4 py-3 text-sm font-semibold  dark:border-slate-700',
      td: 'px-4 py-3 text-sm border-b border-r border-l dark:border-slate-700'
    }"
  />

  <!-- Pagination -->
  <div class="flex items-center justify-between mt-2">
    <div>សរុប: {{ tableData.length }} អ្នកប្រើ</div>
    <div class="flex items-center gap-2">
      <label>បង្ហាញ:</label>
      <select class="border rounded py-1 px-2">
        <option>10</option>
        <option>25</option>
        <option>50</option>
      </select>
      <UPagination :total="tableData.length" :page-size="10" active-color="neutral" />
    </div>
  </div>

  <!-- CRUD Modal -->
  <UModal v-model:open="showModal">
    <template #header>
      <h3 class="text-lg font-semibold font-battambang">{{ isEdit ? 'កែប្រែអ្នកប្រើ' : 'បន្ថែមអ្នកប្រើ' }}</h3>
    </template>
    <template #body>
      <div class="flex flex-col gap-2">
        <UInput v-model="currentName" placeholder="ឈ្មោះអ្នកប្រើ" class="w-full" />
        <UInput v-model="currentEmail" placeholder="អ៊ីមែល" class="w-full" />
        <select v-model="currentRole" class="w-full border rounded py-1 px-2">
          <option value="super">Super</option>
          <option value="employee">Employee</option>
          <option value="guest">Guest</option>
        </select>
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
