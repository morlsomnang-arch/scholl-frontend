<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoles } from '~/composables/useRoles'

const route = useRoute()
const router = useRouter()
const roleId = Number(route.params.id)

const {
  permissions,
  fetchPermissions,
  fetchRolePermissions,
  updateRolePermissions
} = useRoles()
definePageMeta({ layout: 'admin', middleware: 'auth' })
const roleName = ref('')
const selectedPermissions = ref<number[]>([])
const loading = ref(false)

/* LOAD DATA */
onMounted(async () => {
  await fetchPermissions()

  const role = await fetchRolePermissions(roleId)
  roleName.value = role.name
  selectedPermissions.value =
    role.Permissions?.map(p => p.id) || []
})

/* SAVE */
const save = async () => {
  loading.value = true
  try {
    await updateRolePermissions(roleId, selectedPermissions.value)
    alert('✅ Permissions assigned')
    router.push('/roles')
  } catch (e) {
    alert('❌ Error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">
      Assign Permissions – {{ roleName }}
    </h1>

    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
      <label
        v-for="perm in permissions"
        :key="perm.id"
        class="flex items-center gap-2 border p-2 rounded cursor-pointer"
      >
        <input
          type="checkbox"
          :value="perm.id"
          v-model="selectedPermissions"
        />
        <span>{{ perm.name }}</span>
      </label>
    </div>

    <div class="flex gap-3">
      <button
        class="bg-blue-600 text-white px-4 py-2 rounded"
        :disabled="loading"
        @click="save"
      >
        Save
      </button>

      <button
        class="bg-gray-300 px-4 py-2 rounded"
        @click="router.back()"
      >
        Cancel
      </button>
    </div>
  </div>
</template>
