<template>
  <div class="section is-paddingless-horizontal">
    <h2 class="title is-4 mb-4">Featured Experience</h2>
    <div class="card">
      <div class="card-image">
        <figure class="image is-2by1">
          <img
            src="https://picsum.photos/800/400?random=1"
            alt="Williamsburg Street Art"
          />
        </figure>
      </div>
      <div class="card-content has-background-dark has-text-white" style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7) !important;">
        <p class="title is-5 has-text-white mb-2">Williamsburg Street Art Tour</p>
        <p class="subtitle is-6 has-text-white">2.5 hours • $30/person</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.card {
  position: relative;
  overflow: hidden;
  border-radius: 0.75rem;
}
</style> 