<template>
  <div class="section is-paddingless-horizontal">
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
      <h2 class="title is-4 mb-0">Today's Picks</h2>
      <NuxtLink to="/picks" class="has-text-primary">See All</NuxtLink>
    </div>
    <ExperienceCard
      v-for="(experience, index) in experiences"
      :key="experience.title"
      :experience="experience"
    />
  </div>
</template>

<script setup lang="ts">
const experiences = ref([
  {
    title: 'Hidden Coffee Gems',
    location: 'East Village',
    details: '4 stops',
    rating: 4.8,
    reviews: 234,
    image: 'https://picsum.photos/200/200?random=2'
  },
  {
    title: 'Jazz Night in Harlem',
    location: 'Harlem',
    details: 'Live Music',
    rating: 4.9,
    reviews: 156,
    image: 'https://picsum.photos/200/200?random=3'
  }
])</script> 