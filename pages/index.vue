<template>
  <div class="has-navbar-fixed-bottom">
    <Header />
    <div class="container is-fluid">
      <div class="hero is-medium">
        <div class="hero-body">
          <h1 class="title is-1 has-text-centered mb-6">Welcome to AnswersNYC</h1>
          <p class="subtitle is-4 has-text-centered mb-6">Your AI-powered NYC travel companion</p>
          <SearchInput />
        </div>
      </div>
      <CategoryFilters />
      <FeaturedExperience />
      <TodaysPicks />
      <LocalEvents />
    </div>
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  margin-bottom: 2rem;
}

.hero .title,
.hero .subtitle {
  color: white;
}
</style> 