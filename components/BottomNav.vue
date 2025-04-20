<template>
  <nav class="bottom-nav">
    <div class="is-flex is-justify-content-space-around">
      <NuxtLink to="/" class="bottom-nav-item is-active">
        <Icon name="ph:compass" size="24" />
        <span>Explore</span>
      </NuxtLink>
      <NuxtLink to="/itinerary" class="bottom-nav-item">
        <Icon name="ph:map-trifold" size="24" />
        <span>Itinerary</span>
      </NuxtLink>
      <NuxtLink to="/events" class="bottom-nav-item">
        <Icon name="ph:calendar" size="24" />
        <span>Events</span>
      </NuxtLink>
      <NuxtLink to="/settings" class="bottom-nav-item">
        <Icon name="ph:gear" size="24" />
        <span>Settings</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
</script> 