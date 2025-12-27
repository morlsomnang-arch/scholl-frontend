<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useUsers } from '~/composables/useUsers'

// Fetch users
const { users, fetchUsers, upgradeUser } = useUsers()

type UserRow = {
  id: number
  name: string
  email: string
  role: string
  selected: boolean
}

const tableData = ref<UserRow[]>([])

onMounted(async () => {
  await fetchUsers()
  tableData.value = users.value.map(u => ({
    ...u,
    selected: u.role === 'super'
  }))
})
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})
const toggleRole = async (user: UserRow, role: string) => {
  if (user.role === role) return

  const previousRole = user.role
  user.role = role
  user.selected = role === 'super'

  try {
    await upgradeUser(user.id) // call backend API
  } catch (err) {
    console.error('Update failed', err)
    user.role = previousRole // rollback if fail
    user.selected = previousRole === 'super'
  }
}

// Table columns
const columns: TableColumn<UserRow>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
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

const rowSelection = ref({})
</script>

<template>
  <div class=" flex-1 p-3  w-full">


    <UTable v-model:row-selection="rowSelection" :data="tableData" :columns="columns" class="flex-1  " :ui="{
      thead: ' text-center',
      th: 'px-4 py-3 text-sm   border-r  border-l',
      td: 'px-4 py-3 text-sm  border-r border-t border-l',
      tr: 'p-4'
    }" />
  </div>
</template>
