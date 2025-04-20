<template>
  <div class="section is-paddingless-horizontal">
    <h2 class="title is-4 mb-4">Local Events</h2>
    <div class="is-overflow-x-scroll">
      <div class="columns is-mobile" style="flex-wrap: nowrap; min-width: max-content;">
        <div v-for="(event, index) in events" :key="event.title" class="column is-4-tablet is-6-mobile" style="min-width: 280px;">
          <div class="card">
            <div class="card-image">
              <figure class="image is-2by1">
                <img :src="event.image" :alt="event.title" style="object-fit: cover;" />
              </figure>
            </div>
            <div class="card-content">
              <p class="title is-5">{{ event.title }}</p>
              <p class="subtitle is-6 has-text-grey">{{ event.time }}</p>
              <p class="is-flex is-align-items-center has-text-grey">
                <Icon name="ph:map-pin" size="16" class="mr-2" />
                <span>{{ event.location }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const events = ref([
  {
    title: 'Queens Night Market',
    time: 'Today, 6 PM - 12 AM',
    location: 'Flushing Meadows Corona Park',
    image: 'https://picsum.photos/600/300?random=4'
  },
  {
    title: 'Rooftop Movie Night',
    time: 'Tomorrow, 8 PM',
    location: 'DUMBO House',
    image: 'https://picsum.photos/600/300?random=5'
  }
])</script>

<style scoped>
.is-overflow-x-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 1rem;
}
</style> 