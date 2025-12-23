<script setup lang="ts">
import { h, resolveComponent, ref, computed } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { useClipboard } from '@vueuse/core'

// Resolve component
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UInput = resolveComponent('UInput')

// Toast និង Clipboard
const toast = useToast()
const { copy } = useClipboard()

// Page Meta
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// ប្រភេទទិន្នន័យ
type Payment = {
  id: string
  date: string
  status: 'បានបង់' | 'បង់មិនបាន' | 'បានត្រឡប់'
  email: string
  amount: number
}

// ទិន្នន័យ
const data = ref<Payment[]>([
  { id: '4600', date: '2024-03-11T15:30:00', status: 'បានបង់', email: 'james.anderson@example.com', amount: 594 },
  { id: '4599', date: '2024-03-11T10:10:00', status: 'បង់មិនបាន', email: 'mia.white@example.com', amount: 276 },
  { id: '4598', date: '2024-03-11T08:50:00', status: 'បានត្រឡប់', email: 'william.brown@example.com', amount: 315 },
  { id: '4597', date: '2024-03-10T19:45:00', status: 'បានបង់', email: 'emma.davis@example.com', amount: 529 },
  { id: '4596', date: '2024-03-10T15:55:00', status: 'បានបង់', email: 'ethan.harris@example.com', amount: 639 }
])

// ជ្រើសរើស rows
const selectedRows = ref<Set<string>>(new Set())

// ស្វែងរក
const searchQuery = ref('')
const filteredData = computed(() => {
  if (!searchQuery.value) return data.value
  return data.value.filter(d =>
    d.id.includes(searchQuery.value) ||
    d.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    d.status.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Columns
const columns: TableColumn<Payment>[] = [
  // Checkbox ជ្រើសរើស
  {
    id: 'select',
    header: () =>
      h('input', {
        type: 'checkbox',
        class: 'cursor-pointer w-4 h-4 text-blue-600 accent-green-500', // w-6 h-6 = 24px
        checked: selectedRows.value.size === data.value.length,
        onClick: (e: Event) => {
          e.stopPropagation()
          if (selectedRows.value.size === data.value.length) {
            selectedRows.value.clear()
          } else {
            data.value.forEach(d => selectedRows.value.add(d.id))
          }
        }
      }),
    cell: ({ row }) =>
      h('input', {
        type: 'checkbox',
        class: 'cursor-pointer w-4 h-4 text-blue-600 accent-green-500', // កំណត់ទំហំ
        checked: selectedRows.value.has(row.original.id),
        onClick: (e: Event) => {
          e.stopPropagation()
          if (selectedRows.value.has(row.original.id)) {
            selectedRows.value.delete(row.original.id)
          } else {
            selectedRows.value.add(row.original.id)
          }
        }
      })

  },
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'date',
    header: 'កាលបរិច្ឆេទ',
    cell: ({ row }) => new Date(row.getValue('date')).toLocaleString('km-KH', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    })
  },
  {
    accessorKey: 'status',
    header: 'ស្ថានភាព',
    cell: ({ row }) => {
      const color = { 'បានបង់': 'success', 'បង់មិនបាន': 'error', 'បានត្រឡប់': 'neutral' }[row.getValue('status') as string]
      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () => row.getValue('status'))
    }
  },
  {
    accessorKey: 'email',
    header: 'អ៊ីមែល'
  },
  {
    accessorKey: 'amount',
    header: () => h('div', { class: 'text-right' }, 'ចំនួនប្រាក់'),
    cell: ({ row }) => {
      const amount = Number(row.getValue('amount'))
      const formatted = new Intl.NumberFormat('km-KH', { style: 'currency', currency: 'USD' }).format(amount)
      return h('div', { class: 'text-right font-medium' }, formatted)
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => h('div', { class: 'text-right' }, h(UDropdownMenu, {
      content: { align: 'end' },
      items: getRowItems(row),
      'aria-label': 'ប៊ូតុងសកម្មភាព'
    }, () => h(UButton, {
      icon: 'i-lucide-ellipsis-vertical',
      color: 'neutral',
      variant: 'ghost',
      class: 'ml-auto'
    })))
  }
]

// សកម្មភាព Row
function getRowItems(row: Row<Payment>) {
  return [
    { type: 'label', label: 'សកម្មភាព' },
    {
      label: 'ចម្លង ID ការទូទាត់',
      onSelect() {
        copy(row.original.id)
        toast.add({ title: 'បានចម្លង ID ការទូទាត់!', color: 'success', icon: 'i-lucide-circle-check' })
      }
    },
    { type: 'separator' },
    { label: 'មើលអតិថិជន' },
    { label: 'មើលព័ត៌មានលម្អិតនៃការទូទាត់' }
  ]
}
</script>

<template>
  <div class="flex flex-col gap-3 font-battambang">
    <!-- ស្វែងរក -->
    <UInput v-model="searchQuery" placeholder="ស្វែងរកដោយ ID, អ៊ីមែល, ស្ថានភាព..." class="max-w-xs font-battambang"
      icon="i-heroicons-magnifying-glass" />

    <!-- តារាង -->
    <UTable sticky :data="filteredData" :columns="columns"
      class="flex-1 overflow-auto border border-gray-300 dark:border-slate-700 font-battambang" :ui="{
        thead: 'sticky top-0 bg-gray-100 dark:bg-slate-800 z-10 font-battambang',
        th: 'px-4 py-3  text-left text-sm font-semibold text-gray-700 dark:text-gray-200 dark:border-slate-700 font-battambang',
        td: 'px-4 py-3 text-sm border border-gray-200 dark:border-slate-700 font-battambang',
        tr: 'odd:bg-gray-50 even:bg-white dark:odd:bg-slate-900 dark:even:bg-slate-950 hover:bg-primary/5 font-battambang'
      }" />
  </div>
</template>
