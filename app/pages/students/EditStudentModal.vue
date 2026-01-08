<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStudent } from '~/composables/useStudent'

const props = defineProps<{
  modelValue: boolean
  studentId: number | null
}>()

const emit = defineEmits(['update:modelValue', 'saved'])

const { getStudent, updateStudent } = useStudent()

const activeTab = ref<'student' | 'services' | 'parents' | 'addresses'>('student')

/* =====================
   State
===================== */
const student = ref<any>({
  name_kh: '',
  name_en: '',
  dob: '',
  phone: '',
  gender: 'M'
})

const services = ref<any[]>([])
const parents = ref<any[]>([])
const addresses = ref<any[]>([])

/* =====================
   Load data for edit
===================== */
watch(
  () => props.studentId,
  async (id) => {
    if (!id) return

    const res = await getStudent(id)

    student.value = {
      name_kh: res.name_kh,
      name_en: res.name_en,
      dob: res.dob,
      phone: res.phone,
      gender: res.gender
    }

    services.value = res.services || []
    parents.value = res.parents || []
    addresses.value = res.addresses || []
  },
  { immediate: true }
)

/* =====================
   Submit
===================== */
const submit = async () => {
  if (!props.studentId) return

  const fd = new FormData()

  /* student */
  fd.append('name_kh', student.value.name_kh)
  fd.append('name_en', student.value.name_en)
  fd.append('dob', student.value.dob)
  fd.append('phone', student.value.phone)
  fd.append('gender', student.value.gender)

  /* relations */
  fd.append('services', JSON.stringify(services.value))
  fd.append('parents', JSON.stringify(parents.value))
  fd.append('addresses', JSON.stringify(addresses.value))

  await updateStudent(props.studentId, fd)

  emit('saved')
  emit('update:modelValue', false)
}
</script>

<template>
  <UModal
    :open="modelValue"
    size="xl"
    @close="emit('update:modelValue', false)"
  >
    <template #header>
      <h3 class="font-bold">កែប្រែសិស្ស</h3>
    </template>

    <template #body>
      <UTabs v-model="activeTab">

        <!-- STUDENT -->
        <UTab name="student" label="សិស្ស">
          <div class="grid grid-cols-2 gap-2">
            <UInput v-model="student.name_kh" placeholder="ឈ្មោះខ្មែរ" />
            <UInput v-model="student.name_en" placeholder="ឈ្មោះអង់គ្លេស" />
            <UInput type="date" v-model="student.dob" />
            <UInput v-model="student.phone" placeholder="ទូរស័ព្ទ" />
          </div>
        </UTab>

        <!-- SERVICES -->
        <UTab name="services" label="សេវាកម្ម">
          <div
            v-for="(s, i) in services"
            :key="i"
            class="grid grid-cols-3 gap-2 mb-2"
          >
            <UInput v-model="s.class_classtype_id" placeholder="ClassType ID" />
            <UInput v-model="s.academy_year_id" placeholder="Year ID" />
            <UInput v-model="s.remark" placeholder="Remark" />
          </div>

          <UButton size="xs" @click="services.push({})">➕ បន្ថែម</UButton>
        </UTab>

        <!-- PARENTS -->
        <UTab name="parents" label="ឪពុកម្តាយ">
          <div
            v-for="(p, i) in parents"
            :key="i"
            class="grid grid-cols-3 gap-2 mb-2"
          >
            <UInput v-model="p.name_kh" placeholder="ឈ្មោះ" />
            <UInput v-model="p.phone" placeholder="ទូរស័ព្ទ" />
            <UInput v-model="p.type_parent_id" placeholder="Type ID" />
          </div>

          <UButton size="xs" @click="parents.push({})">➕ បន្ថែម</UButton>
        </UTab>

        <!-- ADDRESSES -->
        <UTab name="addresses" label="អាសយដ្ឋាន">
          <div
            v-for="(a, i) in addresses"
            :key="i"
            class="grid grid-cols-4 gap-2 mb-2"
          >
            <UInput v-model="a.address_type" placeholder="birth/current" />
            <UInput v-model="a.province_id" placeholder="Province ID" />
            <UInput v-model="a.district_id" placeholder="District ID" />
            <UInput v-model="a.commune_id" placeholder="Commune ID" />
          </div>

          <UButton size="xs" @click="addresses.push({})">➕ បន្ថែម</UButton>
        </UTab>

      </UTabs>
    </template>

    <template #footer>
      <UButton color="primary" @click="submit">
        រក្សាទុក
      </UButton>
    </template>
  </UModal>
</template>
