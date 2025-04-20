<template>
  <AppLayout>
    <section class="section">
      <div class="container">
        <h1 class="title">My Dashboard</h1>

        <div class="columns">
          <div class="column is-3">
            <div class="menu">
              <p class="menu-label">Navigation</p>
              <ul class="menu-list">
                <li>
                  <a
                    :class="{ 'is-active': activeTab === 'bookmarks' }"
                    @click="activeTab = 'bookmarks'"
                  >
                    My Bookmarks
                  </a>
                </li>
                <li>
                  <a
                    :class="{ 'is-active': activeTab === 'settings' }"
                    @click="activeTab = 'settings'"
                  >
                    Settings
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div class="column is-9">
            <!-- Bookmarks Tab -->
            <div v-if="activeTab === 'bookmarks'" class="bookmarks-section">
              <div class="level">
                <div class="level-left">
                  <div class="level-item">
                    <h2 class="title is-4">My Bookmarks</h2>
                  </div>
                </div>
                <div class="level-right">
                  <div class="level-item">
                    <div class="field">
                      <div class="control">
                        <div class="select">
                          <select v-model="selectedCategory">
                            <option value="">All Categories</option>
                            <option
                              v-for="category in categories"
                              :key="category"
                              :value="category"
                            >
                              {{ category }}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bookmarks-grid">
                <div
                  v-for="bookmark in filteredBookmarks"
                  :key="bookmark.id"
                  class="bookmark-card"
                >
                  <div class="card">
                    <div class="card-content">
                      <div class="media">
                        <div class="media-content">
                          <p class="title is-5">{{ bookmark.title }}</p>
                          <p class="subtitle is-6">{{ bookmark.category }}</p>
                        </div>
                        <div class="media-right">
                          <button
                            class="delete"
                            @click="deleteBookmark(bookmark.id)"
                          ></button>
                        </div>
                      </div>
                      <div class="content">
                        {{ bookmark.description }}
                        <br />
                        <a
                          v-if="bookmark.url"
                          :href="bookmark.url"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visit Link
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="filteredBookmarks.length === 0" class="notification">
                No bookmarks found. Start saving your favorite places!
              </div>
            </div>

            <!-- Settings Tab -->
            <div v-if="activeTab === 'settings'" class="settings-section">
              <h2 class="title is-4">Account Settings</h2>
              <div class="box">
                <form @submit.prevent="updateSettings">
                  <div class="field">
                    <label class="label">Phone Number</label>
                    <div class="control">
                      <input
                        v-model="settings.phone_number"
                        class="input"
                        type="tel"
                        disabled
                      />
                    </div>
                  </div>

                  <div class="field">
                    <label class="label">Full Name</label>
                    <div class="control">
                      <input
                        v-model="settings.full_name"
                        class="input"
                        type="text"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div class="field">
                    <div class="control">
                      <label class="checkbox">
                        <input
                          v-model="settings.newsletter_subscribed"
                          type="checkbox"
                        />
                        Subscribe to newsletter
                      </label>
                    </div>
                  </div>

                  <div class="field">
                    <div class="control">
                      <button
                        class="button is-primary"
                        :class="{ 'is-loading': isUpdating }"
                        type="submit"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </AppLayout>
</template>

<script setup lang="ts">
interface Bookmark {
  id: string
  title: string
  description: string
  url?: string
  category: string
}

interface Settings {
  phone_number: string
  full_name: string
  newsletter_subscribed: boolean
}

const activeTab = ref('bookmarks')
const selectedCategory = ref('')
const isUpdating = ref(false)

const bookmarks = ref<Bookmark[]>([])
const settings = ref<Settings>({
  phone_number: '',
  full_name: '',
  newsletter_subscribed: false,
})

const categories = computed(() => {
  const uniqueCategories = new Set(bookmarks.value.map((b) => b.category))
  return Array.from(uniqueCategories)
})

const filteredBookmarks = computed(() => {
  if (!selectedCategory.value) return bookmarks.value
  return bookmarks.value.filter((b) => b.category === selectedCategory.value)
})

const fetchBookmarks = async () => {
  try {
    const { data, error } = await useSupabaseClient()
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    bookmarks.value = data || []
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
  }
}

const fetchSettings = async () => {
  try {
    const { data, error } = await useSupabaseClient()
      .from('settings')
      .select('*')
      .single()

    if (error) throw error
    if (data) {
      settings.value = {
        phone_number: data.phone_number || '',
        full_name: data.full_name || '',
        newsletter_subscribed: data.newsletter_subscribed || false,
      }
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
  }
}

const updateSettings = async () => {
  if (isUpdating.value) return

  isUpdating.value = true

  try {
    const { error } = await useSupabaseClient()
      .from('settings')
      .upsert({
        user_id: useSupabaseUser().value?.id,
        full_name: settings.value.full_name,
        newsletter_subscribed: settings.value.newsletter_subscribed,
      })

    if (error) throw error
    alert('Settings updated successfully!')
  } catch (error) {
    console.error('Error updating settings:', error)
    alert('Failed to update settings. Please try again.')
  } finally {
    isUpdating.value = false
  }
}

const deleteBookmark = async (id: string) => {
  if (!confirm('Are you sure you want to delete this bookmark?')) return

  try {
    const { error } = await useSupabaseClient()
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) throw error
    await fetchBookmarks()
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    alert('Failed to delete bookmark. Please try again.')
  }
}

// Fetch data on component mount
onMounted(async () => {
  await Promise.all([fetchBookmarks(), fetchSettings()])
})
</script>

<style scoped>
.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.bookmark-card {
  transition: transform 0.2s ease-in-out;
}

.bookmark-card:hover {
  transform: translateY(-5px);
}

.settings-section {
  max-width: 600px;
}
</style> 