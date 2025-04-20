// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // Enable SSR/SSG
  ssr: true,
  
  // CSS
  css: ['~/assets/css/main.css'],
  
  // Modules
  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/color-mode',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxt/test-utils'
  ],

  // Supabase configuration
  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: ['/'],
    },
  },

  // Color mode configuration
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },

  // Runtime config for environment variables
  runtimeConfig: {
    // Server-side only config
    openaiApiKey: process.env.OPENAI_API_KEY,
    // Public config exposed to the client
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      tavilyApiKey: process.env.TAVILY_API_KEY,
      visualCrossingApiKey: process.env.NUXT_VISUALCROSSING_API_KEY
    }
  },

  // Build configuration
  build: {
    transpile: ['@supabase/supabase-js'],
  },

  // Vite configuration
  vite: {
    optimizeDeps: {
      include: ['@supabase/supabase-js'],
    },
    server: {
      watch: {
        usePolling: true
      }
    }
  },

  // App configuration
  app: {
    head: {
      title: 'AnswersNYC',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Your NYC travel companion' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  // Nitro configuration
  nitro: {
    compressPublicAssets: true,
    minify: true
  }
})