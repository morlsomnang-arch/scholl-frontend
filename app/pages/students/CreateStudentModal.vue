<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStudent } from '~/composables/useStudent'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'saved'])

const { createStudent } = useStudent()

const form = ref({
  name_kh: '',
  name_en: '',
  dob: '',
  phone: '',
  gender: 'M'
})

const submit = async () => {
  const fd = new FormData()
  Object.entries(form.value).forEach(([k, v]) => fd.append(k, v as string))

  await createStudent(fd)
  emit('saved')
  emit('update:modelValue', false)
}
</script>

<template>
  <UModal :open="modelValue" @close="emit('update:modelValue', false)">
    <template #header>
      <h3 class="font-bold">បង្កើតសិស្ស</h3>
    </template>

    <template #body>
      <div class="grid grid-cols-2 gap-3">
        <UInput v-model="form.name_kh" placeholder="ឈ្មោះខ្មែរ" />
        <UInput v-model="form.name_en" placeholder="ឈ្មោះអង់គ្លេស" />
        <UInput v-model="form.dob" type="date" />
        <UInput v-model="form.phone" placeholder="ទូរស័ព្ទ" />
        <select v-model="form.gender" class="border p-2 rounded">
          <option value="M">ប្រុស</option>
          <option value="F">ស្រី</option>
          <option value="O">ផ្សេងៗ</option>
        </select>
      </div>
    </template>

    <template #footer>
      <UButton color="primary" @click="submit">រក្សាទុក</UButton>
    </template>
  </UModal>
</template>
