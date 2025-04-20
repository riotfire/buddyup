<template>
  <div class="search-results">
    <!-- Information Results -->
    <div v-if="resultType === 'information'" class="information-result">
      <div class="answer-card">
        <div class="answer-header">
          <h3 class="title is-5">{{ result.content }}</h3>
          <button v-if="result.citations?.length" class="button is-small is-text" @click="showSource">
            <span class="icon">
              <Icon name="ph:link" />
            </span>
          </button>
        </div>
        <div v-if="result.steps" class="steps-accordion">
          <div v-for="(step, index) in result.steps" :key="index" class="step-item">
            <div class="step-header" @click="toggleStep(index)">
              <span class="step-number">{{ index + 1 }}</span>
              <span class="step-title">{{ step.title }}</span>
              <span class="icon">
                <Icon :name="expandedSteps[index] ? 'ph:caret-up' : 'ph:caret-down'" />
              </span>
            </div>
            <div v-if="expandedSteps[index]" class="step-content">
              <p>{{ step.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- News Results -->
    <div v-if="resultType === 'news'" class="news-result">
      <div class="news-header">
        <div class="news-meta">
          <span class="tag is-danger" v-if="result.isLive">Live</span>
          <span class="timestamp">{{ result.timestamp }}</span>
        </div>
        <h3 class="title is-5">{{ result.title }}</h3>
        <p class="subtitle is-6">{{ result.summary }}</p>
      </div>
      <div class="news-content">
        <p>{{ result.content }}</p>
      </div>
      <div class="news-actions">
        <button class="button is-small" @click="saveToItinerary">
          <span class="icon">
            <Icon name="ph:heart" />
          </span>
        </button>
      </div>
    </div>

    <!-- Recommendations Results -->
    <div v-if="resultType === 'recommendations'" class="recommendations-result">
      <div class="recommendations-grid">
        <div v-for="(item, index) in result.items" :key="index" class="recommendation-card">
          <div class="card-image">
            <img :src="item.image" :alt="item.title">
          </div>
          <div class="card-content">
            <h4 class="title is-6">{{ item.title }}</h4>
            <div class="tags">
              <span v-for="(tag, tagIndex) in item.tags" :key="tagIndex" class="tag is-light">
                {{ tag }}
              </span>
            </div>
            <div class="meta">
              <span class="distance">{{ item.distance }}</span>
              <span class="price">{{ item.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reviews Results -->
    <div v-if="resultType === 'reviews'" class="reviews-result">
      <div class="rating-summary">
        <div class="rating-score">
          <span class="score">{{ result.rating }}</span>
          <div class="stars">
            <Icon v-for="n in 5" :key="n" 
              :name="n <= result.rating ? 'ph:star-fill' : 'ph:star'" 
              :class="{ 'has-text-warning': n <= result.rating }" />
          </div>
        </div>
        <div class="rating-count">{{ result.reviewCount }} reviews</div>
      </div>
      <div class="pros-cons">
        <div class="pros">
          <h5>Pros</h5>
          <div class="tags">
            <span v-for="(pro, index) in result.pros" :key="index" class="tag is-success">
              {{ pro }}
            </span>
          </div>
        </div>
        <div class="cons">
          <h5>Cons</h5>
          <div class="tags">
            <span v-for="(con, index) in result.cons" :key="index" class="tag is-danger">
              {{ con }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Directions Results -->
    <div v-if="resultType === 'directions'" class="directions-result">
      <div class="route-options">
        <div v-for="(option, index) in result.options" :key="index" 
          class="route-option"
          :class="{ 'is-active': selectedRoute === index }"
          @click="selectRoute(index)">
          {{ option.type }}
        </div>
      </div>
      <div class="steps-list">
        <div v-for="(step, index) in result.steps" :key="index" class="step-item">
          <div class="step-header">
            <span class="step-number">{{ index + 1 }}</span>
            <span class="step-icon">
              <Icon :name="getTransportIcon(step.transport)" />
            </span>
            <span class="step-description">{{ step.description }}</span>
          </div>
          <div class="step-details">
            <span class="duration">{{ step.duration }}</span>
            <span class="distance">{{ step.distance }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Debug Information -->
    <div v-if="result.debug" class="debug-info mt-6">
      <details>
        <summary class="title is-6">Debug Information</summary>
        <div class="content mt-4">
          <div class="debug-section">
            <h6 class="title is-6">Models Used</h6>
            <p>Classification: {{ result.debug.classificationModel }}</p>
            <p>Response: {{ result.debug.responseModel }}</p>
          </div>

          <div class="debug-section">
            <h6 class="title is-6">Classification</h6>
            <p>Route: {{ result.debug.route }}</p>
            <p>Confidence: {{ result.debug.confidence }}</p>
            <pre>{{ JSON.stringify(result.debug.steps.classification, null, 2) }}</pre>
          </div>

          <div v-if="result.debug.steps.externalSearch" class="debug-section">
            <h6 class="title is-6">External Search</h6>
            <p>Provider: {{ result.debug.steps.externalSearch.provider }}</p>
            <p>Query: {{ result.debug.steps.externalSearch.query }}</p>
            <pre>{{ JSON.stringify(result.debug.steps.externalSearch.response, null, 2) }}</pre>
          </div>

          <div v-if="result.debug.steps.weather" class="debug-section">
            <h6 class="title is-6">Weather</h6>
            <p>Date Range: {{ result.debug.steps.weather.startDate }} to {{ result.debug.steps.weather.endDate }}</p>
            <pre>{{ result.debug.steps.weather.forecast }}</pre>
          </div>

          <div class="debug-section">
            <h6 class="title is-6">Final Response</h6>
            <p>Model: {{ result.debug.steps.finalResponse.model }}</p>
            <p>Temperature: {{ result.debug.steps.finalResponse.temperature }}</p>
            <p>Max Tokens: {{ result.debug.steps.finalResponse.maxTokens }}</p>
            <div v-if="result.debug.steps.finalResponse.context">
              <h6 class="title is-6">Context</h6>
              <pre>{{ result.debug.steps.finalResponse.context }}</pre>
            </div>
            <div v-if="result.debug.steps.finalResponse.weatherContext">
              <h6 class="title is-6">Weather Context</h6>
              <pre>{{ result.debug.steps.finalResponse.weatherContext }}</pre>
            </div>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  result: any
}>()

const expandedSteps = ref<boolean[]>([])
const selectedRoute = ref(0)

const resultType = computed(() => {
  // This should be determined by the search router
  return props.result.type || 'information'
})

const toggleStep = (index: number) => {
  expandedSteps.value[index] = !expandedSteps.value[index]
}

const showSource = () => {
  if (props.result.citations?.[0]) {
    window.open(props.result.citations[0].url, '_blank')
  }
}

const saveToItinerary = () => {
  // Implement save to itinerary functionality
}

const selectRoute = (index: number) => {
  selectedRoute.value = index
}

const getTransportIcon = (transport: string) => {
  const icons: Record<string, string> = {
    walk: 'ph:person-simple-walk',
    subway: 'ph:train',
    bus: 'ph:bus',
    ferry: 'ph:boat'
  }
  return icons[transport] || 'ph:map-pin'
}
</script>

<style scoped>
.search-results {
  max-width: 800px;
  margin: 0 auto;
}

/* Information Results */
.information-result {
  .answer-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .answer-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .steps-accordion {
    margin-top: 1rem;
  }

  .step-item {
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }

  .step-header {
    padding: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .step-content {
    padding: 0.75rem;
    border-top: 1px solid #eee;
  }
}

/* News Results */
.news-result {
  .news-header {
    margin-bottom: 1rem;
  }

  .news-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .timestamp {
    color: #666;
    font-size: 0.875rem;
  }
}

/* Recommendations Results */
.recommendations-result {
  .recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .recommendation-card {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .card-image {
    aspect-ratio: 16/9;
    overflow: hidden;
  }

  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .card-content {
    padding: 1rem;
  }

  .meta {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #666;
  }
}

/* Reviews Results */
.reviews-result {
  .rating-summary {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .rating-score {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .score {
    font-size: 2rem;
    font-weight: bold;
  }

  .stars {
    display: flex;
    gap: 0.25rem;
  }

  .pros-cons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}

/* Directions Results */
.directions-result {
  .route-options {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .route-option {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    background: #f5f5f5;
    cursor: pointer;
  }

  .route-option.is-active {
    background: var(--primary-color);
    color: white;
  }

  .steps-list {
    .step-item {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }

    .step-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .step-details {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #666;
    }
  }
}

.debug-info {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
}

.debug-info summary {
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  background: #e0e0e0;
}

.debug-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.debug-section pre {
  background: #f8f8f8;
  padding: 0.75rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.debug-section h6 {
  margin-bottom: 0.5rem;
  color: #666;
}
</style> 