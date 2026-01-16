<script setup lang="ts">
import { h, resolveComponent, ref, computed, onMounted, watch } from 'vue'
import { useServices, type Service } from '~/composables/useServices'
import { useAuth } from '~/composables/useAuth'

/* ===== UI Components ===== */
const UButton = resolveComponent('UButton')
const UInput = resolveComponent('UInput')
const UModal = resolveComponent('UModal')
const USelect = resolveComponent('USelect')
const UPagination = resolveComponent('UPagination')

definePageMeta({ layout: 'admin', middleware: 'auth' })

/* ===== Permissions ===== */
const { hasPermission } = useAuth()
const canCreate = computed(() => hasPermission('create_service'))
const canEdit = computed(() => hasPermission('update_service'))
const canDelete = computed(() => hasPermission('delete_service'))

const { services, students, classes, academyYears, fetchServices, fetchDropdowns, createService, updateService, deleteService } = useServices()

const mounted = ref(false)
const searchQuery = ref('')
const selectedItems = ref<number[]>([])
const currentPage = ref(1)
const perPage = ref(35)
const perPageOptions = [100, 120, 150, 200]
const changePerPage = (value: number) => {
  perPage.value = value
  currentPage.value = 1
}
const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)
const student_id = ref<number | null>(null)
const class_id = ref<number | null>(null)
const classType_id = ref<number | null>(null)
const academyYear_id = ref<number | null>(null)
const remark = ref('')

const studentOptions = computed(() =>
  students.value.map(s => ({ label: s.name_kh, value: s.id }))
)
const classOptions = computed(() =>
  classes.value.map(c => ({ label: c.name, value: c.id }))
)
const academyYearOptions = computed(() =>
  academyYears.value.map(y => ({ label: y.name, value: y.id }))
)

/* ===== Reset Form ===== */
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

/* ===== Submit Form ===== */
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


  if (isEdit.value && currentId.value) await updateService(currentId.value, payload)
  else await createService(payload)

  await fetchServices()
  resetForm()
}
const editItem = (item?: Service) => {
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
const toggleSelection = (id: number) => {
  const index = selectedItems.value.indexOf(id)
  if (index === -1) selectedItems.value.push(id)
  else selectedItems.value.splice(index, 1)
}
const toggleAll = (checked: boolean) => {
  selectedItems.value = checked ? paginatedServices.value.map(i => i.id) : []
}
const isSelected = (id: number) => selectedItems.value.includes(id)
const filteredServices = computed(() => {
  if (!searchQuery.value) return services.value
  return services.value.filter(s => s.Student?.name_kh?.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const totalItems = computed(() => filteredServices.value.length)
const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredServices.value.slice(start, start + perPage.value)
})


const groupedByAcademy = computed(() => {
  const groups: Record<string, Service[]> = {}
  paginatedServices.value.forEach(s => {
    const key = s.AcademyYear?.name || 'Unknown'
    if (!groups[key]) groups[key] = []
    groups[key].push(s)
  })
  return groups
})


const expandedGroups = ref<Record<string, boolean>>({})
watch(groupedByAcademy, (newGroups) => {
  Object.keys(newGroups).forEach(key => {
    if (!(key in expandedGroups.value)) expandedGroups.value[key] = true
  })
}, { immediate: true })

const toggleGroup = (year: string) => {
  expandedGroups.value[year] = !expandedGroups.value[year]
}
const config = useRuntimeConfig()
const getStudentImage = (image?: string | null) => {

  if (!image) return '/avatar.png'
  if (image.startsWith('http')) return image
  return `${config.public.apiBase}/uploads/students/${image}`
}
onMounted(async () => {
  await fetchDropdowns()
  await fetchServices()
  mounted.value = true
})
import dayjs from 'dayjs'
import 'dayjs/locale/km'

dayjs.locale('km')
const formatDob = (dob?: string) => {
  if (!dob) return '-'
  return dayjs(dob).locale('km').format('D MMMM YYYY')
}

</script>

<template>
  <div class="flex flex-col gap-4  dark:border-slate-700 p-3">
    <!-- Toolbar -->
    <div class="flex items-center justify-between border-b  dark:border-slate-700 p-2 gap-3">
      <div class="flex gap-5">
        <UButton v-if="canCreate" color="danger" icon="i-lucide-plus" @click="showModal = true" />
        <UButton v-if="canEdit" color="danger" icon="i-lucide-edit" :disabled="selectedItems.length !== 1"
          @click="editItem(filteredServices.find(i => i.id === selectedItems[0]))" />
        <UButton v-if="canDelete" color="danger" icon="i-lucide-trash-2" :disabled="selectedItems.length === 0"
          @click="selectedItems.forEach(id => removeItem(id))" />
      </div>
      <UInput v-model="searchQuery" loading loading-icon="i-lucide-loader" color="neutral" placeholder="ស្វែងរកសិស្ស..." class="max-w-xs custom-uinput" />

    </div>

    <!-- Table -->
    <div class="main-data">
      <table>
        <thead>
          <tr>
            <th class="border  dark:border-slate-700 px-2 py-1 w-10">
              <input type="checkbox" class="w-4 h-4" :checked="paginatedServices.every(s => isSelected(s.id))"
                @change="e => toggleAll((e.target as HTMLInputElement).checked)" />
            </th>
            <th class="w-20">រូប</th>
            <th class="w-40">ឈ្មោះសិស្ស</th>
            <th class="w-30">ថ្ងៃកំណើត</th>
            <th class="w-30">ថ្នាក់</th>
            <th class=" ">ប្រភេទថ្នាក់</th>
            <th class=" ">ចំណាំ</th>

          </tr>
        </thead>

        <tbody>
          <template v-for="(services, year) in groupedByAcademy" :key="year">

            <!-- GROUP ROW -->
            <tr class="group-row cursor-pointer" @click="toggleGroup(year)">
              <td colspan="7" class="p-2 border-b text-sm dark:border-slate-700">
                {{ year }} ({{ services.length }} item)
                <span class="float-left">
                  <UIcon :name="expandedGroups[year]
                    ? 'i-lucide-chevron-down'
                    : 'i-lucide-chevron-right'" class="w-4 h-4" />
                </span>
              </td>
            </tr>

            <!-- DATA ROWS -->
            <tr v-for="s in services" v-show="expandedGroups[year]" :key="s.id" class="data-row">
              <td class="border text-sm dark:border-slate-700 px-2 py-1 text-center">
                <input type="checkbox" class="w-4 h-4" :checked="isSelected(s.id)"
                  @change="() => toggleSelection(s.id)" />
              </td>

              <td>
                <img :src="s.Student?.image_thumb
                  ? s.Student.image_thumb + '?v=' + s.id
                  : '/avatar.png'" class="w-16 h-16 object-cover " loading="lazy" decoding="async" />
              </td>

              <td>
                {{ s.Student?.name_kh }}
              </td>
              <td>
                {{ formatDob(s.Student?.dob) }}
              </td>
              <td>
                {{ s.ClassClasstype?.Class?.name }}
              </td>
              <td>
                {{ s.ClassClasstype?.ClassType?.name }}
              </td>
              <td>
                {{ s.remark }}
              </td>
            </tr>

          </template>

        </tbody>
      </table>
    </div>
    <div class="flex items-center gap-2 justify-between  mt-2">
      <div class="items-center flex gap-2">
        <label>បង្ហាញ:</label>
        <select v-model.number="perPage" @change="changePerPage(perPage)" class="border rounded py-1 px-2">
          <option v-for="opt in perPageOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <UPagination v-model:page="currentPage" :total="totalItems" :page-size="perPage" active-color="neutral" />
      </div>

      <div class="flex items-center gap-2">
        <div>សរុប: {{ totalItems }} សេវា</div>
      </div>
    </div>

    <!-- Modal (unchanged) -->
    <UModal v-model:open="showModal">
      <template #header>
        <h3>{{ isEdit ? 'កែប្រែ Service' : 'បន្ថែម Service' }}</h3>
      </template>
      <template #body>
        <div class="flex flex-col gap-3">
          <USelect v-model="student_id" :items="studentOptions" placeholder="ជ្រើសសិស្ស" />
          <USelect v-model="class_id" :items="classOptions" placeholder="ជ្រើសថ្នាក់" />
          <USelect v-model="classType_id" placeholder="ជ្រើសប្រភេទថ្នាក់" :items="class_id
            ? classes.find(c => c.id === class_id)?.ClassClasstypes.map(cc => ({
              label: cc.ClassType?.name,
              value: cc.classtype_id
            }))
            : []" />
          <USelect v-model="academyYear_id" :items="academyYearOptions" placeholder="ជ្រើសឆ្នាំសិក្សា" />
          <UInput v-model="remark" placeholder="ចំណាំ" />
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
