<template>
  <div class="search-container">
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const isLoading = ref(false)

const handleSearch = () => {
  if (!searchQuery.value.trim() || isLoading.value) return
  
  isLoading.value = true
  
  // Navigate to search page with query
  router.push({
    path: '/search',
    query: { q: searchQuery.value }
  })
}
</script>

<style scoped>
.search-container {
  max-width: 800px;
  margin: 0 auto;
}

/* Accessibility improvements */
.input:focus {
  box-shadow: 0 0 0 2px var(--primary-color);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
</style> 