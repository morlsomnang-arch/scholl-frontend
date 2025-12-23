import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [
      tailwindcss(),
    ]
  },
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3001/api' 
    }
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/ts.svg' },
        { rel: 'icon', type: 'image/png', href: '/ts.svg' },
        { rel: 'apple-touch-icon', href: '/ts.svg' }
      ]
    }
  }

})
