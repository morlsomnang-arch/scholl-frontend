<template>
     <div :class="`flex min-h-screen ${modeClasses}`">
          <!-- Main Sidebar -->
          <aside :class="`w-25 border-r flex flex-col ${sidebarClasses}`">
               <!-- Logo -->
               <div :class="`h-18 flex items-center px-8 font-bold text-lg border-b ${borderClass}`">
                    <img src="/pks.png" class="w-12 bg-red" />
               </div>

               <!-- Navigation Links -->
               <nav class="flex-1 py-4">
                    <div v-for="link in links" :key="link.label">
                         <div class="px-4 py-3 border-b hover:bg-gray-200 dark:hover:bg-slate-800 flex flex-col items-center cursor-pointer"
                              :class="linkClasses" @click="toggleSubSidebar(link.label)">
                              <component :is="link.icon" class="w-4 h-5 mb-1" />
                              <span class="text-sm text-center font-battambang">{{ link.label }}</span>
                         </div>
                    </div>
               </nav>

               <!-- Footer -->
               <div :class="`px-4 py-2 text-sm border-t ${borderClass} text-gray-500`">
                    <div class="p-3">Setting</div>
               </div>
          </aside>

          <!-- Main Content -->
          <div class="flex-1 flex flex-col">
               <!-- Header -->
               <header :class="`h-18 flex items-center justify-between px-6 border-b ${borderClass} ${headerClasses}`">
                    <UInput icon="i-heroicons-magnifying-glass" placeholder="ស្វែងរក..." class="w-80 font-battambang" />
                    <div class="flex items-center gap-3">
                         <UColorModeSwitch />

                         <div class="relative">
                              <!-- Avatar button -->
                              <button @click="showMenu = !showMenu" class="focus:outline-none ">
                                   <UAvatar src="/nang.jpg" />
                              </button>

                              <!-- Dropdown menu -->
                              <div v-if="showMenu"
                                   class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-50">
                                   <button @click="goToAccount"
                                        class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Account</button>
                                   <button @click="login"
                                        class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Login</button>
                                   <button @click="logout"
                                        class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Logout</button>
                              </div>
                         </div>
                    </div>
               </header>

               <!-- Main Area -->
               <main class="flex-1 flex overflow-hidden">
                    <!-- Sub Sidebar -->
                    <aside v-if="showSubSidebar" :class="`w-64 border-r p-3 ${subSidebarClasses} ${subSidebarBorder}`">
                         <div class="flex items-center justify-between mb-3">
                              <span class="font-battambang font-semibold">{{ activeSidebar }}</span>
                              <UButton size="xs" variant="ghost" @click="closeSubSidebar">
                                   <X class="w-4 h-4 text-gray-700 dark:text-gray-200" />
                              </UButton>
                         </div>

                         <!-- UTree filtered by active section -->
                         <UTree :items="treeItems.filter(item => item.label === activeSidebar)"
                              :default-expanded-keys="['students']" class="font-battambang">
                              <!-- Parent / Node -->
                              <template #label="{ node }">
                                   <div class="flex items-center gap-2">
                                        <UKbd v-if="node.kbd" :value="node.kbd" size="sm" />
                                        <span>{{ node.label }}</span>
                                   </div>
                              </template>

                              <!-- Children -->
                              <template #children="{ node }">
                                   <div class="flex items-center gap-2 pl-4">
                                        <UKbd v-if="node.kbd" :value="node.kbd" size="sm" />
                                        <span>{{ node.label }}</span>
                                   </div>
                              </template>
                         </UTree>

                    </aside>

                    <!-- Page Content -->
                    <div class="flex-1 p-4 overflow-auto">
                         <UButton v-if="!showSubSidebar" size="sm" variant="ghost" class="mb-3"
                              @click="showSubSidebar = true">
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

// Dark mode by default
const colorMode = useColorMode()
if (!colorMode.preference) colorMode.preference = 'dark'

const links = ref([
     { label: 'ទំព័រដើម', icon: Home, to: '/' },
     { label: 'សិស្ស', icon: User, to: '/students' },
     { label: 'ពិន្ទុសិស្ស', icon: User, to: '/students/scores' },
     { label: 'បុគ្គលិក', icon: Users, to: '/staff' },
     { label: 'CMS', icon: Settings, to: '/cms' },
])


const modeClasses = computed(() => colorMode.value === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900')
const headerClasses = computed(() => colorMode.value === 'dark' ? 'bg-slate-900' : 'bg-white')
const sidebarClasses = computed(() => colorMode.value === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-gray-100 border-gray-300')
const borderClass = computed(() => colorMode.value === 'dark' ? 'border-slate-800' : 'border-gray-300')
const linkClasses = computed(() => colorMode.value === 'dark' ? 'text-gray-200' : 'text-gray-700')

const showSubSidebar = ref(false)
const activeSidebar = ref<string | null>(null)
const subSidebarClasses = computed(() => colorMode.value === 'dark' ? 'bg-slate-950' : 'bg-gray-100')
const subSidebarBorder = computed(() => colorMode.value === 'dark' ? 'border-slate-800' : 'border-gray-300')
const treeItems = [
     {
          key: 'student',              // ✅ key តែមួយ
          label: 'សិស្ស',
          kbd: 'S',
          icon: 'i-heroicons-academic-cap',
          children: [
               {
                    key: 'student-basic',    // label ទី 1
                    label: 'ព័ត៌មានសិស្ស',
                    kbd: '1',
                    children: [
                         { key: 'student-list', label: 'បញ្ជីសិស្ស', kbd: 'L', to: '/students' },
                         { key: 'student-add', label: 'បន្ថែមសិស្ស', kbd: 'A', to: '/students/create' }
                    ]
               },
               {
                    key: 'student-score',    // label ទី 2
                    label: 'ពិន្ទុសិស្ស',
                    kbd: '2',
                    children: [
                         { key: 'score-list', label: 'បញ្ជីពិន្ទុ', kbd: 'P', to: '/students/scores' },
                         { key: 'score-report', label: 'របាយការណ៍ពិន្ទុ', kbd: 'R', to: '/students/scores/report' }
                    ]
               },
               {
                    key: 'student-manage',   // label ទី 3
                    label: 'គ្រប់គ្រងសិស្ស',
                    kbd: '3',
                    children: [
                         { key: 'student-log', label: 'កំណត់ហេតុ', kbd: 'L', to: '/students/log' },
                         { key: 'student-reason', label: 'ហេតុផល', kbd: 'H', to: '/students/log/reason' }
                    ]
               }
          ]
     },
     {
          key: 'student-management',   
          label: 'គ្រប់គ្រងសិស្ស',
          kbd: 'M',
          icon: 'i-heroicons-academic-cap',
          children: [
               { key: 'student-log', label: 'កំណត់ហេតុសិស្ស', kbd: 'L', to: '/students/log' },
               { key: 'student-reason', label: 'ហេតុផល', kbd: 'P', to: '/students/log/reason' },
          ]
     },

     {
          key: 'sstaff',   
          label: 'បុគ្គលិក',
          kbd: '3',
          children: [
               { key: 'student-log', label: 'កំណត់ហេតុ', kbd: 'L', to: '/students/log' },
               { key: 'student-reason', label: 'ហេតុផល', kbd: 'H', to: '/students/log/reason' }
          ]
     },
     {
          key: 'cms',   
          label: 'CMS',
          kbd: '3',
          children: [
               { key: 'student-log', label: 'ទិន្នន័យ', kbd: 'L', to: '/students/log' },
               { key: 'student-reason', label: 'ការបូកសរុប', kbd: 'H', to: '/students/log/reason' }
          ]
     },
     {
          key: '/',  
          label: 'ទំព័រដើម',
          kbd: '3',
          children: [
               { key: 'student-log', label: 'ទិន្នន័យ', kbd: 'L', to: '/students/log' },
               { key: 'student-reason', label: 'ការបូកសរុប', kbd: 'H', to: '/students/log/reason' }
          ]
     }
]
const router = useRouter()
const route = useRoute()
const showMenu = ref(false)
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
const logout = () => { console.log('User logged out'); showMenu.value = false }

watch(route, () => {
     const current = treeItems.find(item => item.children.some(child => child.to === route.path))
     if (current) {
          activeSidebar.value = current.label
          showSubSidebar.value = true
     } else {
          activeSidebar.value = null
          showSubSidebar.value = false
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
