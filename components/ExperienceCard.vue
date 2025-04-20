<template>
  <div class="box p-4 mb-4">
    <article class="media">
      <div class="media-left">
        <figure class="image is-96x96">
          <img
            :src="experience.image"
            :alt="experience.title"
            class="is-rounded"
            style="object-fit: cover; height: 100%;"
          />
        </figure>
      </div>
      <div class="media-content">
        <div class="content">
          <p class="title is-5 mb-2">{{ experience.title }}</p>
          <p class="subtitle is-6 has-text-grey mb-2">{{ experience.location }} • {{ experience.details }}</p>
          <p class="is-flex is-align-items-center">
            <Icon name="ph:star-fill" class="has-text-warning" size="16" />
            <span class="ml-2">{{ experience.rating }} ({{ experience.reviews }} reviews)</span>
          </p>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
interface Experience {
  title: string
  location: string
  details: string
  rating: number
  reviews: number
  image: string
}

defineProps<{
  experience: Experience
}>()</script> 