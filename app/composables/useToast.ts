import { ref } from 'vue'

export const toasts = ref<{ id: number, title: string, type: 'success' | 'error' }[]>([])
let nextId = 1

export function useToast() {
  const show = (title: string, type: 'success' | 'error' = 'success') => {
    const id = nextId++
    toasts.value.push({ id, title, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 3000)
  }

  return { show, toasts }
}
