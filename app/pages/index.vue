<script setup>
const { token } = useAuth()
navigateTo(token.value ? '/dashboard' : '/auth/login')
</script>

<template>
  <div class="h-screen flex items-center justify-center">
    Redirecting...
  </div>
</template>
