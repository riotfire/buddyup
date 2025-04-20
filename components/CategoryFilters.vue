<template>
  <div class="category-filters">
    <button 
      v-for="category in categories" 
      :key="category"
      class="button is-rounded category-button"
      :class="{ 'is-primary': selectedCategory === category, 'is-light': selectedCategory !== category }"
      @click="selectedCategory = category"
    >
      {{ category }}
    </button>
  </div>
</template>

<script setup lang="ts">
const categories = ref(['All', 'Food & Drinks', 'Arts & Culture', 'Nightlife'])
const selectedCategory = ref('All')
</script> 