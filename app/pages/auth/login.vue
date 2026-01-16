<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
import { useAuth } from '~/composables/useAuth'
import { navigateTo } from '#imports'
import { ref, onMounted } from 'vue'

const toast = useToast()
onMounted(() => {
  toast.add({
    title: 'DEBUG',
    description: 'Toast is working!',
    color: 'success'
  })
})

const { login } = useAuth()

const loading = ref(false)        // 🔹 progress control
const progress = ref(0)           // 🔹 UProgress value

// 👇 Field labels in Khmer
const fields: AuthFormField[] = [
  { name: 'email', type: 'email', label: 'អ៊ីម៉ែល', required: true },
  { name: 'password', type: 'password', label: 'ពាក្យសម្ងាត់', required: true }
]

const providers = [
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: () => toast.add({ title: 'Google', description: 'ចូលជាមួយ Google' })
  },
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    onClick: () => toast.add({ title: 'GitHub', description: 'ចូលជាមួយ GitHub' })
  }
]

// 👇 Validation schema in Khmer
const schema = z.object({
  email: z.string().email('អ៊ីម៉ែល មិនត្រឹមត្រូវ'),
  password: z.string().min(8, 'ពាក្យសម្ងាត់ ត្រូវមានយ៉ាងហោចណាស់ 8 អក្សរ')
})

type Schema = z.output<typeof schema>

async function onSubmit(e: FormSubmitEvent<Schema>) {
  try {
    loading.value = true
    progress.value = 10

    // simulate progress
    const timer = setInterval(() => {
      if (progress.value < 90) progress.value += 10
    }, 200)

    await login(e.data.email, e.data.password)

    progress.value = 100
    clearInterval(timer)

    toast.add({
      title: 'ចូលបានជោគជ័យ',
      description: 'សូមស្វាគមន៍ 🎉',
      color: 'success'
    })

    navigateTo('/dashboard')
  } catch (err: any) {
    console.error('Login failed:', err)
    loading.value = false
    progress.value = 0

    toast.add({
      title: 'បរាជ័យក្នុងការចូល',
      description: err.response?.data?.message || 'អ៊ីម៉ែល ឬ ពាក្យសម្ងាត់ មិនត្រឹមត្រូវ',
      color: 'error'
    })
  }
}
</script>

<template>
    <div v-if="loading" class="w-full">
      <UProgress v-model="progress" status striped rounded />
    </div>
  <div class="flex flex-col items-center justify-center gap-4 p-4 pt-5 text-center font-battambang min-h-screen bg-gray-50 dark:bg-slate-900">

    <!-- 👆 Logo -->
    <div class="mb-2">
      <img src="/pks.png" alt="Logo" class="w-20 mx-auto" />
    </div>

    <!-- 🔹 Progress Bar -->
  

    <!-- Login Form -->
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="ចូលប្រព័ន្ធ"
        description="សូមបញ្ចូលអ៊ីម៉ែល និងពាក្យសម្ងាត់"
        icon="i-lucide-user"
        :fields="fields"
        :providers="providers"
        @submit="onSubmit"
        :submit-button-class="'bg-white text-black hover:bg-gray-200 w-full'"
      />
    </UPageCard>

  </div>
</template>
