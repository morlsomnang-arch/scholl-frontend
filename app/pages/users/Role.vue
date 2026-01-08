<script setup lang="ts">
import { h, resolveComponent, ref, computed, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useRoles, type Permission, type RoleWithPermissions } from '~/composables/useRoles'
import { useAuth } from '~/composables/useAuth'
import { useToast, toasts } from '~/composables/useToast'

/* ===== UI Components ===== */
const UButton = resolveComponent('UButton')
const UInput = resolveComponent('UInput')
const UTable = resolveComponent('UTable')
const UPagination = resolveComponent('UPagination')

definePageMeta({ layout: 'admin', middleware: 'auth' })

/* ===== Permissions ===== */
const { hasPermission } = useAuth()
const canAssign = computed(() => hasPermission('assign_permission'))

/* ===== API ===== */
const { roles, permissions, fetchRoles, fetchPermissions, fetchRolePermissions, updateRolePermissions } = useRoles()

/* ===== State ===== */
const selectedRoleId = ref<number | null>(null)
const selectedRole = computed(() => roles.value.find(r => r.id === selectedRoleId.value) || null)
const selectedPermissionIds = ref<number[]>([])
const loading = ref(false)
const searchQuery = ref('')

/* ===== Pagination ===== */
const currentPage = ref(1)
const perPage = ref(20)
const perPageOptions = [10, 20, 50, 100]
const changePerPage = (value: number) => {
  perPage.value = value
  currentPage.value = 1
}

/* ===== Fetch Roles & Permissions ===== */
const fetchData = async () => {
  loading.value = true
  await fetchRoles()
  await fetchPermissions()
  if (roles.value.length > 0) {
    selectedRoleId.value = roles.value[0].id
    await onRoleChange()
  }
  loading.value = false
}
onMounted(fetchData)

/* ===== Role Change ===== */
const onRoleChange = async () => {
  if (!selectedRoleId.value) return
  const roleWithPerms: RoleWithPermissions = await fetchRolePermissions(selectedRoleId.value)
  selectedPermissionIds.value = roleWithPerms.Permissions.map(p => p.id)
}

/* ===== Toast ===== */
const { show } = useToast()

/* ===== Save Permissions ===== */
const savePermissions = async () => {
  if (!selectedRoleId.value) return
  try {
    await updateRolePermissions(selectedRoleId.value, selectedPermissionIds.value)
    show('អនុញ្ញាតបានអាប់ដេតជោគជ័យ ✅', 'success')
  } catch (err: any) {
    show('បរាជ័យក្នុងការអាប់ដេត: ' + err.message, 'error')
  }
}

/* ===== Filter & Pagination ===== */
const filteredPermissions = computed(() => {
  if (!searchQuery.value) return permissions.value
  return permissions.value.filter(p =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
const totalItems = computed(() => filteredPermissions.value.length)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredPermissions.value.slice(start, start + perPage.value)
})

/* ===== Table Columns ===== */
const columns: TableColumn<Permission>[] = [
  {
    id: 'select',
    header: () => h('input', {
      type: 'checkbox',
      class: 'w-4 h-4',
      checked: computed(() => paginatedData.value.every(p => selectedPermissionIds.value.includes(p.id))).value,
      onChange: (e: Event) => {
        const checked = (e.target as HTMLInputElement).checked
        selectedPermissionIds.value = checked ? paginatedData.value.map(p => p.id) : []
      }
    }),
    cell: ({ row }) => h('input', {
      type: 'checkbox',
      class: 'w-4 h-4',
      checked: selectedPermissionIds.value.includes(row.original.id),
      onChange: () => {
        const id = row.original.id
        const idx = selectedPermissionIds.value.indexOf(id)
        if (idx === -1) selectedPermissionIds.value.push(id)
        else selectedPermissionIds.value.splice(idx, 1)
      }
    }),
    size: 40
  },
  {
    accessorKey: 'name',
    header: 'ឈ្មោះអនុញ្ញាត',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-2' }, [
      h('i', { class: 'i-heroicons-shield-check text-blue-500 w-4 h-4' }),
      row.original.name
    ])
  },
  {
    accessorKey: 'createdAt',
    header: 'បង្កើតនៅថ្ងៃ',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return isNaN(date.getTime()) ? '' : date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    }
  }
]
</script>

<template>
  <div class="flex flex-col gap-4 font-battambang border dark:border-slate-700 p-3">
    <!-- Toolbar -->
    <div class="flex items-center justify-between border-b dark:border-slate-700 p-2 gap-3">
      <div class="gap-4 flex items-center">
        <label class="font-semibold mb-1 block">ជ្រើសរើសតួនាទី:</label>
        <select v-model="selectedRoleId" @change="onRoleChange" class="border p-1 rounded">
          <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
        </select>
        <UButton color="danger" icon="i-lucide-edit" @click="savePermissions" :disabled="!canAssign || !selectedRole">
          រក្សាទុក
        </UButton>
      </div>
      <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="ស្វែងរកអនុញ្ញាត..." class="max-w-xs" />
    </div>

    <!-- Toasts -->
    <div class="fixed top-5 right-5 flex flex-col gap-2 z-50">
      <div v-for="t in toasts" :key="t.id" :class="['px-4 py-2 rounded shadow-lg text-white', t.type === 'success' ? 'bg-green-500' : 'bg-red-500']">
        {{ t.title }}
      </div>
    </div>

    <!-- Permissions Table -->
    <UTable sticky :data="paginatedData" :columns="columns" class="max-h-115 overflow-auto border dark:border-slate-700"
      :ui="{
        thead: 'sticky top-0 bg-gray-100 dark:bg-slate-800 z-10 text-center',
        th: 'px-4 py-2 text-sm font-semibold',
        td: 'px-4 py-2 text-sm border-b border-r dark:border-slate-700'
      }" />

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-2">
      <div>សរុប: {{ totalItems }} អនុញ្ញាត</div>
      <div class="flex items-center gap-2">
        <label>បង្ហាញ:</label>
        <select v-model.number="perPage" @change="changePerPage(perPage)" class="border rounded py-1 px-2">
          <option v-for="opt in perPageOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <UPagination v-model:page="currentPage" :total="totalItems" :page-size="perPage" active-color="neutral" />
      </div>
    </div>
  </div>
</template>
