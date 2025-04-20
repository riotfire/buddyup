<template>
  <div class="app-layout">
    <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <NuxtLink to="/" class="navbar-item">
          <span class="has-text-weight-bold">Answers NYC</span>
        </NuxtLink>

        <a
          role="button"
          class="navbar-burger"
          :class="{ 'is-active': isMenuOpen }"
          aria-label="menu"
          aria-expanded="false"
          @click="isMenuOpen = !isMenuOpen"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div class="navbar-menu" :class="{ 'is-active': isMenuOpen }">
        <div class="navbar-start">
          <NuxtLink to="/" class="navbar-item">Home</NuxtLink>
          <NuxtLink to="/dashboard" class="navbar-item">My Dashboard</NuxtLink>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="buttons">
              <template v-if="user">
                <button class="button is-light" @click="handleSignOut">
                  Sign Out
                </button>
              </template>
              <template v-else>
                <NuxtLink to="/auth/login" class="button is-light">
                  Sign In
                </NuxtLink>
              </template>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="container">
      <NuxtPage />
    </main>

    <footer class="footer">
      <div class="content has-text-centered">
        <p>
          <strong>Answers NYC</strong> by <a href="#">Your Team</a>. The source code is licensed
          <a href="http://opensource.org/licenses/mit-license.php">MIT</a>.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const isMenuOpen = ref(false)
const user = useSupabaseUser()

const handleSignOut = async () => {
  const { error } = await useSupabaseClient().auth.signOut()
  if (error) {
    console.error('Error signing out:', error.message)
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container {
  flex: 1;
  padding: 2rem 1rem;
}

.footer {
  margin-top: auto;
  padding: 2rem 1.5rem;
}
</style> 