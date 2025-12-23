<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
import { useAuth } from '~/composables/useAuth'
import { navigateTo } from '#imports'



const toast = useToast()
onMounted(() => {
  toast.add({
    title: 'DEBUG',
    description: 'Toast is working!',
    color: 'success'
  })
})


const { login } = useAuth()

const fields: AuthFormField[] = [
  { name: 'email', type: 'email', label: 'Email', required: true },
  { name: 'password', type: 'password', label: 'Password', required: true }
]

const schema = z.object({
  email: z.string().email('Email មិនត្រឹមត្រូវ'),
  password: z.string().min(8, 'Password ត្រូវមានយ៉ាងហោចណាស់ 8 អក្សរ')
})

type Schema = z.output<typeof schema>

async function onSubmit(e: FormSubmitEvent<Schema>) {
  try {
    await login(e.data.email, e.data.password)

    toast.add({
      title: 'Login Success',
      description: 'Welcome 🎉',
      color: 'success'
    })

    navigateTo('/dashboard')
  } catch (err: any) {
    console.error('Login failed:', err)

    toast.add({
      title: 'Login Failed',
      description: err.response?.data?.message || 'Email ឬ Password មិនត្រឹមត្រូវ',
      color: 'error'
    })
  }
}

</script>

<template>
  <UPageCard class="w-full max-w-md">
    <UAuthForm
      title="Login"
      submit-label="Login"
      :schema="schema"
      :fields="fields"
      @submit="onSubmit"
    />
  </UPageCard>
</template>
