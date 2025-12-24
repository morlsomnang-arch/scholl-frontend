<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

// definePageMeta({ layout: 'auth', middleware: 'guest' })

const toast = useToast()
const { register } = useAuth()

const fields: AuthFormField[] = [
  { name: 'name', type: 'text', label: 'Name', required: true },
  { name: 'email', type: 'email', label: 'Email', required: true },
  { name: 'password', type: 'password', label: 'Password', required: true }
]
const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => {
    toast.add({ title: 'Google', description: 'Login with Google' })
  }
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: () => {
    toast.add({ title: 'GitHub', description: 'Login with GitHub' })
  }
}]

const schema = z.object({
  name: z.string().min(3, 'ឈ្មោះត្រូវមានយ៉ាងហោចណាស់ 3 អក្សរ'),
  email: z.string().email('Email មិនត្រឹមត្រូវ'),
  password: z.string().min(8, 'Password ត្រូវមានយ៉ាងហោចណាស់ 8 អក្សរ')
})

type Schema = z.output<typeof schema>

async function onSubmit(e: FormSubmitEvent<Schema>) {
  try {
    await register(e.data.name, e.data.email, e.data.password)

    toast.add({
      title: 'ជោគជ័យ',
      description: 'បានបង្កើតគណនីដោយជោគជ័យ 🎉',
      color: 'success'
    })

    navigateTo('/auth/login')
  } catch (err: any) {
    toast.add({
      title: 'បរាជ័យ',
      description: err.response?.data?.message || 'Register មិនជោគជ័យ',
      color: 'error'
    })
  }
}


</script>


<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4 pt-5 text-center">
    <UPageCard class="w-full max-w-md">
      <UAuthForm :schema="schema" title="Login" description="Enter your credentials to access your account."
        icon="i-lucide-user" :fields="fields" :providers="providers" @submit="onSubmit" />
    </UPageCard>
  </div>
</template>
