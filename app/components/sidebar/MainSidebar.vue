<template>
  <div :class="`flex min-h-screen ${modeClasses}`">
    <!-- Main Sidebar -->
    <aside :class="`w-22 border-r  flex flex-col ${sidebarClasses}`">
      <div :class="`h-18 flex items-center px-5 font-bold text-lg border-b ${borderClass}`">
        <img src="/pks.png" class="w-18 bg-red" />
      </div>

      <nav class="flex-1 py-4 ">
        <div v-for="link in filteredLinks" :key="link.label">
          <div
            class="px-4 py-3 border-b  dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-800 flex flex-col items-center cursor-pointer"
            :class="linkClasses" @click="toggleSubSidebar(link.label)">
            <component :is="link.icon" class="w-4 h-5 mb-1" />
            <span class="text-sm text-center font-battambang">{{ link.label }}</span>
          </div>
        </div>
      </nav>

      <div :class="`px-4 py-2 border-t font-battambang ${borderClass} text-gray-500`">
        <div class="p-3">កំណត់</div>
      </div>
    </aside>

    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <header :class="`h-18 flex items-center justify-between px-6 border-b ${borderClass} ${headerClasses}`">
        <UInput icon="i-heroicons-magnifying-glass" placeholder="ស្វែងរក..." class="w-80 font-battambang" />
        <div class="flex items-center gap-3">
          <UColorModeSwitch />

          <div class="relative">
            <button @click="showMenu = !showMenu">
              <UAvatar src="/nang.jpg" />
            </button>

            <div v-if="showMenu"
              class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-50">
              <button @click="goToAccount"
                class="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700">
                Account
              </button>
              <button @click="handleLogout"
                class="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main -->
      <main class="flex-1 flex overflow-hidden">
        <!-- Sub Sidebar -->
        <aside v-if="showSubSidebar" :class="`w-64 border-r p-3 ${subSidebarClasses} ${subSidebarBorder}`">
          <div class="flex items-center justify-between mb-3">
            <span class="font-battambang font-semibold">{{ activeSidebar }}</span>
            <UButton size="xs" variant="ghost" @click="closeSubSidebar">
              <X class="w-4 h-4" />
            </UButton>
          </div>

          <!-- ⭐ UTree -->
          <UTree :items="filteredTreeItems
            .filter(i => i.label === activeSidebar)
            .map(i => ({
              ...i,
              children: i.children?.map(c => ({
                ...c
              }))
            }))" class="font-battambang ">
            <template #item="{ item }">
              <div class="flex items-center gap-2 cursor-pointer hover:text-primary " @click="handleTreeClick(item)">
                <UKbd v-if="item.kbd" :value="item.kbd" size="sm" />
                <span>{{ item.label }}</span>
              </div>
            </template>
          </UTree>
        </aside>

        <!-- Content -->
        <div class="flex-1  overflow-auto">
          <UButton v-if="!showSubSidebar" size="sm" variant="ghost" class="mb-3" @click="showSubSidebar = true">
            <ChevronRight class="w-5 h-5" />
          </UButton>

          <div class="">
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
import { treeItems as allTreeItems } from '~/components/sidebar/sidebaraTree'

definePageMeta({ middleware: 'auth' })

const { user, logout } = useAuth()
const router = useRouter()
const route = useRoute()

const activeSidebar = ref<string | null>('ទំព័រដើម')
const showSubSidebar = ref(true)
const showMenu = ref(false)

const colorMode = useColorMode()
if (!colorMode.preference) colorMode.preference = 'dark'

const modeClasses = computed(() => colorMode.value === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900')
const headerClasses = computed(() => colorMode.value === 'dark' ? 'bg-slate-900' : 'bg-white')
const sidebarClasses = computed(() => colorMode.value === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-gray-100 border-gray-300')
const borderClass = computed(() => colorMode.value === 'dark' ? 'border-slate-800' : 'border-gray-300')
const linkClasses = computed(() => colorMode.value === 'dark' ? 'text-gray-200' : 'text-gray-700')
const subSidebarClasses = computed(() => colorMode.value === 'dark' ? 'bg-slate-950' : 'bg-gray-100')
const subSidebarBorder = computed(() => colorMode.value === 'dark' ? 'border-slate-800' : 'border-gray-300')

const links = ref([
  { label: 'ទំព័រដើម', icon: Home, roles: ['super', 'employee', 'guest'] },
  { label: 'សិស្ស', icon: User, roles: ['super', 'employee'] },
  { label: 'ពិន្ទុសិស្ស', icon: User, roles: ['super', 'employee'] },
  { label: 'ឪពុកម្ដាយ', icon: User, roles: ['super', 'employee'] },
  { label: 'បុគ្គលិក', icon: Users, roles: ['super', 'employee'] },
  { label: 'មុខងារ', icon: Settings, roles: ['super'] },
])

const filteredLinks = computed(() =>
  links.value.filter(l => !l.roles || l.roles.includes(user.value?.role))
)

const filteredTreeItems = computed(() =>
  allTreeItems.filter(i => !i.roles || i.roles.includes(user.value?.role))
)

/* ⭐ MAIN LOGIC */
const toggleSubSidebar = (label: string) => {
  if (activeSidebar.value === label) {
    activeSidebar.value = null
    showSubSidebar.value = false
    return
  }

  activeSidebar.value = label
  showSubSidebar.value = true

  const parent = allTreeItems.find(i => i.label === label)
  const firstChild = parent?.children?.[0]

  if (firstChild?.to) {
    router.push(firstChild.to)
  }
}

const closeSubSidebar = () => {
  activeSidebar.value = null
  showSubSidebar.value = false
}

const handleTreeClick = (item: any) => {
  if (item.to) router.push(item.to)
}

const goToAccount = () => router.push('/account')
const handleLogout = () => logout()

watch(route, () => {
  const current = allTreeItems.find(i =>
    i.children?.some(c => c.to === route.path)
  )
  if (current) {
    activeSidebar.value = current.label
    showSubSidebar.value = true
  }
}, { immediate: true })
</script>
