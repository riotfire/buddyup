<template>
  <div class="search-page">
    <Header />
    <div class="container is-fluid">
      <div class="search-header">
        <div class="field has-addons">
          <p class="control has-icons-left is-expanded">
            <input
              v-model="searchQuery"
              class="input is-medium"
              type="search"
              placeholder="Ask anything about NYC..."
              @keyup.enter="handleSearch"
              :class="{ 'is-loading': isLoading }"
              :disabled="isLoading"
            />
            <span class="icon is-left">
              <Icon name="ph:magnifying-glass" />
            </span>
          </p>
          <p class="control">
            <button 
              class="button is-primary is-medium"
              @click="handleSearch"
              :class="{ 'is-loading': isLoading }"
              :disabled="isLoading || !searchQuery.trim()"
            >
              <span class="icon">
                <Icon name="ph:arrow-right" />
              </span>
            </button>
          </p>
        </div>
      </div>

      <div v-if="error" class="notification is-danger is-light mt-4">
        <button class="delete" @click="error = null"></button>
        {{ error }}
      </div>

      <div v-if="result" class="search-results-container">
        <SearchResults :result="result" />
      </div>
    </div>
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSearch } from '~/composables/useSearch'

const route = useRoute()
const router = useRouter()
const searchQuery = ref('')
const { search, isLoading, error, result } = useSearch()

const handleSearch = async () => {
  if (!searchQuery.value.trim() || isLoading.value) return
  
  // Update URL with search query
  router.push({
    path: '/search',
    query: { q: searchQuery.value }
  })
  
  await search(searchQuery.value)
}

// Handle initial search from URL
onMounted(async () => {
  const query = route.query.q as string
  if (query) {
    searchQuery.value = query
    await search(query)
  }
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.search-header {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.search-results-container {
  margin-top: 2rem;
  padding: 0 1rem;
}
</style> 