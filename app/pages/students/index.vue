<script setup lang="ts">
import { ref, computed, onMounted, resolveComponent, watch } from 'vue'
import { useStudent, type Student } from '~/composables/useStudent'
import { useAuth } from '~/composables/useAuth'

/* UI */
const UButton = resolveComponent('UButton')
const UInput = resolveComponent('UInput')
const UModal = resolveComponent('UModal')
const UPagination = resolveComponent('UPagination')
const UFileUpload = resolveComponent('UFileUpload')
const USkeleton = resolveComponent('USkeleton')
const UProgress = resolveComponent('UProgress')

definePageMeta({ layout: 'admin', middleware: 'auth' })

/* Auth */
const { hasPermission } = useAuth()
const canCreate = computed(() => hasPermission('create_students'))
const canEdit = computed(() => hasPermission('update_students'))
const canDelete = computed(() => hasPermission('delete_students'))

/* Student */
const { getStudents, createStudent, updateStudent, deleteStudent } = useStudent()
const students = ref<Student[]>([])
const loading = ref(false)

/* Progress bar */
const progress = ref(0)

/* Search */
const searchQuery = ref('')

/* Selection */
const selectedStudents = ref<number[]>([])
const isSelected = (id: number) => selectedStudents.value.includes(id)
const toggleSelection = (id: number) => {
  const i = selectedStudents.value.indexOf(id)
  i === -1 ? selectedStudents.value.push(id) : selectedStudents.value.splice(i, 1)
}
const toggleAll = (checked: boolean) => {
  selectedStudents.value = checked ? paginatedData.value.map(s => s.id) : []
}
const currentPage = ref(1)
const perPage = ref(35)
const perPageOptions = [35, 100, 150, 200]
const totalItems = computed(() => filteredData.value.length)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredData.value.slice(start, start + perPage.value)
})
const filteredData = computed(() => {
  if (!searchQuery.value) return students.value
  return students.value.filter(s =>
    s.name_kh.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    s.name_en.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    s.phone.includes(searchQuery.value)
  )
})

const fetchStudents = async () => {
  loading.value = true
  progress.value = 10
  const timer = setInterval(() => {
    if (progress.value < 90) progress.value += 10
  }, 200)

  students.value = await getStudents()
  loading.value = false
  progress.value = 100
  clearInterval(timer)
}

/* Form */
const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)
const nameKh = ref('')
const nameEn = ref('')
const dob = ref('')
const phone = ref('')
const gender = ref<'M' | 'F' | 'O'>('M')
const image = ref<File | null>(null)

const resetForm = () => {
  nameKh.value = ''
  nameEn.value = ''
  dob.value = ''
  phone.value = ''
  gender.value = 'M'
  image.value = null
  isEdit.value = false
  currentId.value = null
  showModal.value = false
}

const submitForm = async () => {
  const form = new FormData()
  form.append('name_kh', nameKh.value)
  form.append('name_en', nameEn.value)
  form.append('dob', dob.value)
  form.append('phone', phone.value)
  form.append('gender', gender.value)
  if (image.value) form.append('image', image.value)

  if (isEdit.value && currentId.value)
    await updateStudent(currentId.value, form)
  else
    await createStudent(form)

  await fetchStudents()
  resetForm()
}

const editStudent = (s: Student) => {
  isEdit.value = true
  currentId.value = s.id
  nameKh.value = s.name_kh
  nameEn.value = s.name_en
  dob.value = s.dob
  phone.value = s.phone
  gender.value = s.gender
  showModal.value = true
}

const bulkEdit = () => {
  if (selectedStudents.value.length === 1) {
    const s = students.value.find(i => i.id === selectedStudents.value[0])
    if (s) editStudent(s)
  } else alert('សូមជ្រើសសិស្សតែមួយ')
}

const bulkDelete = async () => {
  if (!selectedStudents.value.length) return
  if (!confirm(`លុប ${selectedStudents.value.length} សិស្ស?`)) return
  for (const id of selectedStudents.value) await deleteStudent(id)
  selectedStudents.value = []
  await fetchStudents()
}

onMounted(fetchStudents)
</script>

<template>
  <div class="flex flex-col gap-4 font-battambang border dark:border-slate-700 p-3">

    <!-- Toolbar -->
    <div class="flex justify-between border-b dark:border-slate-700 p-2">
      <div class="flex gap-3">
        <UButton v-if="canEdit" color="danger" icon="i-lucide-edit" @click="bulkEdit"
          :disabled="selectedStudents.length !== 1" />
        <UButton v-if="canDelete" color="danger" icon="i-lucide-trash-2" @click="bulkDelete"
          :disabled="selectedStudents.length === 0" />
        <UButton v-if="canCreate" color="danger" icon="i-lucide-plus" @click="showModal = true" />
      </div>
      <UInput v-model="searchQuery" loading loading-icon="i-lucide-loader" color="neutral" placeholder="ស្វែងរកសិស្ស..."
        class="max-w-xs custom-uinput" />
    </div>

    <!-- 🔹 Progress Bar -->
    <div v-if="loading" class="w-full mb-2 " size="xs" >
      <UProgress color="error" v-model="progress" status striped rounded />
    </div>

    <!-- TABLE -->
    <div class="main-data">
      <table>
        <thead>
          <tr>
            <th class="border dark:border-slate-700 px-2 py-1 w-10">
              <input type="checkbox" class="w-4 h-4" :checked="paginatedData.every(s => isSelected(s.id))"
                @change="e => toggleAll((e.target as HTMLInputElement).checked)" />
            </th>
            <th>រូប</th>
            <th>ឈ្មោះខ្មែរ</th>
            <th>ឈ្មោះអង់គ្លេស</th>
            <th>ថ្ងៃកំណើត</th>
            <th class="w-20">ភេទ</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading" v-for="i in 5" :key="'skeleton-'+i">
            <td><USkeleton class="h-4 w-4 mx-auto rounded-full" /></td>
            <td><USkeleton class="h-16 w-16 rounded" /></td>
            <td colspan="4"><USkeleton class="h-4 w-full" /></td>
          </tr>

          <tr v-for="s in paginatedData" :key="s.id" class="data-row" :class="{ selected: isSelected(s.id) }" v-else>
            <td class="px-2 py-1 text-center">
              <input type="checkbox" class="w-4 h-4" :checked="isSelected(s.id)" @change="toggleSelection(s.id)" />
            </td>
            <td>
              <img :src="s.image_thumb || '/image.png'" class="w-16 h-16 object-cover mx-auto" />
            </td>
            <td>{{ s.name_kh }}</td>
            <td>{{ s.name_en }}</td>
            <td>{{ s.dob }}</td>
            <td>{{ s.gender }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between mt-2">
      <div class="flex gap-2">
        <select v-model.number="perPage" class="border px-2 py-1 rounded">
          <option v-for="p in perPageOptions" :key="p" :value="p">{{ p }}</option>
        </select>
        <UPagination v-model:page="currentPage" :total="totalItems" :page-size="perPage" active-color="neutral" />
      </div>
      <div>សរុប: {{ totalItems }} សិស្ស</div>
    </div>

    <!-- MODAL -->
    <UModal v-model:open="showModal">
      <template #header>
        <h3>{{ isEdit ? 'កែប្រែសិស្ស' : 'បង្កើតសិស្សថ្មី' }}</h3>
      </template>

      <template #body>
        <div class="flex flex-col gap-3">
          <UInput v-model="nameKh" placeholder="ឈ្មោះខ្មែរ" />
          <UInput v-model="nameEn" placeholder="ឈ្មោះអង់គ្លេស" />
          <UInput v-model="dob" type="date" />
          <UInput v-model="phone" placeholder="លេខទូរស័ព្ទ" />
          <select v-model="gender" class="border px-2 py-1 rounded">
            <option value="M">ប្រុស</option>
            <option value="F">ស្រី</option>
            <option value="O">ផ្សេងៗ</option>
          </select>
          <UFileUpload accept="image/*" @update:model-value="f => image = f ?? null" />
        </div>
      </template>

      <template #footer>
        <UButton variant="soft" @click="resetForm">បោះបង់</UButton>
        <UButton color="success" @click="submitForm">
          {{ isEdit ? 'កែប្រែ' : 'រក្សាទុក' }}
        </UButton>
      </template>
    </UModal>

  </div>
</template>
