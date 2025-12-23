<template>
  <div :class="`flex min-h-screen ${modeClasses}`">
    <aside :class="`w-25 border-r flex flex-col ${sidebarClasses}`">
      <div :class="`h-18 flex items-center px-8 font-bold text-lg border-b ${borderClass}`">
        <img src="/pks.png" class="w-12 bg-red" />
      </div>
      <nav class="flex-1 py-4">
        <div v-for="link in links" :key="link.label">
          <div
            class="px-4 py-3 border-b hover:bg-gray-200 dark:hover:bg-slate-800 flex flex-col items-center cursor-pointer"
            :class="linkClasses" @click="toggleSubSidebar(link.label)">
            <component :is="link.icon" class="w-4 h-5 mb-1" />
            <span class="text-sm text-center font-battambang">{{ link.label }}</span>
          </div>
        </div>
      </nav>
      <div :class="`px-4 py-2 text-sm border-t ${borderClass} text-gray-500`">
        <div class="p-3">Setting</div>
      </div>
    </aside>
    <div class="flex-1 flex flex-col">
      <header :class="`h-18 flex items-center justify-between px-6 border-b ${borderClass} ${headerClasses}`">
        <UInput icon="i-heroicons-magnifying-glass" placeholder="ស្វែងរក..." class="w-80 font-battambang" />

        <div class="flex items-center gap-3">
          <UColorModeSwitch   />

          <div class="relative">
            <button @click="showMenu = !showMenu" class="focus:outline-none">
              <UAvatar src="/nang.jpg" />
            </button>

            <div v-if="showMenu"
              class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-50">
              <button @click="goToAccount"
                class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                Account
              </button>
              <button @click="login" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                Login
              </button>
              <button @click="handleLogout"
                class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main class="flex-1 flex overflow-hidden">
        <aside v-if="showSubSidebar" :class="`w-64 border-r p-3 ${subSidebarClasses} ${subSidebarBorder}`">
          <div class="flex items-center justify-between mb-3">
            <span class="font-battambang font-semibold">{{ activeSidebar }}</span>
            <UButton size="xs" variant="ghost" @click="closeSubSidebar">
              <X class="w-4 h-4 text-gray-700 dark:text-gray-200" />
            </UButton>
          </div>
          <UTree :items="treeItems.filter(item => item.label === activeSidebar)" class="font-battambang">
            <template #item="{ item }">
              <div class="flex items-center gap-2 cursor-pointer hover:text-primary" @click="handleTreeClick(item)">
                <UKbd v-if="item.kbd" :value="item.kbd" size="sm" />
                <span>{{ item.label }}</span>
              </div>
            </template>
          </UTree>

        </aside>
        <div class="flex-1 p-4 overflow-auto">
          <UButton v-if="!showSubSidebar" size="sm" variant="ghost" class="mb-3" @click="showSubSidebar = true">
            <ChevronRight class="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </UButton>

          <div class="p-6">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Home, User, Users, Settings, X, ChevronRight } from 'lucide-vue-next'
import { useColorMode } from '#imports'
import { useAuth } from '~/composables/useAuth'
import { treeItems } from '~/components/sidebar/sidebaraTree'
const handleTreeClick = (item: any) => {
  if (item.to) {
    router.push(item.to)
  }
}

definePageMeta({ middleware: 'auth' })
const colorMode = useColorMode()
if (!colorMode.preference) colorMode.preference = 'dark'
const links = ref([
  { label: 'ទំព័រដើម', icon: Home, to: '/' },
  { label: 'សិស្ស', icon: User, to: '/students' },
  { label: 'ពិន្ទុសិស្ស', icon: User, to: '/students/scores' },
  { label: 'បុគ្គលិក', icon: Users, to: '/staff' },
  { label: 'CMS', icon: Settings, to: '/cms' },
])
const modeClasses = computed(() => (colorMode.value === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'))
const headerClasses = computed(() => (colorMode.value === 'dark' ? 'bg-slate-900' : 'bg-white'))
const sidebarClasses = computed(() => (colorMode.value === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-gray-100 border-gray-300'))
const borderClass = computed(() => (colorMode.value === 'dark' ? 'border-slate-800' : 'border-gray-300'))
const linkClasses = computed(() => (colorMode.value === 'dark' ? 'text-gray-200' : 'text-gray-700'))

const subSidebarClasses = computed(() => (colorMode.value === 'dark' ? 'bg-slate-950' : 'bg-gray-100'))
const subSidebarBorder = computed(() => (colorMode.value === 'dark' ? 'border-slate-800' : 'border-gray-300'))
const router = useRouter()
const route = useRoute()
const showMenu = ref(false)
const { logout } = useAuth()

const activeSidebar = ref<string | null>('ទំព័រដើម')
const showSubSidebar = ref(true)

const toggleSubSidebar = (label: string) => {
  if (activeSidebar.value === label) {
    activeSidebar.value = null
    showSubSidebar.value = false
  } else {
    activeSidebar.value = label
    showSubSidebar.value = true
  }
}

const closeSubSidebar = () => {
  activeSidebar.value = null
  showSubSidebar.value = false
}

const goToAccount = () => { router.push('/account'); showMenu.value = false }
const login = () => { router.push('/login'); showMenu.value = false }
const handleLogout = () => { logout(); showMenu.value = false }
watch(route, () => {
  const current = treeItems.find(item => item.children?.some(child => child.to === route.path))
  if (current) {
    activeSidebar.value = current.label
    showSubSidebar.value = true
  }
}, { immediate: true })
</script>

<style>
html {
  transition: background-color 0.3s, color 0.3s;
}

div[v-cloak] {
  display: none;
}
</style>
