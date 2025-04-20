<template>
  <div class="weather-widget">
    <div class="current-weather box">
      <div class="columns is-vcentered">
        <div class="column is-narrow">
          <div class="weather-icon">
            <img :src="weatherIcon" :alt="currentWeather.conditions" />
          </div>
        </div>
        <div class="column">
          <h3 class="title is-4">Current Weather</h3>
          <p class="temperature">{{ currentWeather.temperature }}°F</p>
          <p class="conditions">{{ currentWeather.conditions }}</p>
          <p class="last-updated">
            Last updated: {{ formatTime(currentWeather.updated_at) }}
          </p>
        </div>
      </div>
    </div>

    <div class="forecast box">
      <h3 class="title is-4">14-Day Forecast</h3>
      <div class="forecast-grid">
        <div
          v-for="(day, index) in forecast"
          :key="index"
          class="forecast-day"
        >
          <div class="day-name">{{ formatDay(day.date) }}</div>
          <div class="day-icon">
            <img :src="getWeatherIcon(day.conditions)" :alt="day.conditions" />
          </div>
          <div class="day-temp">{{ day.temperature }}°F</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface WeatherData {
  date: string
  temperature: number
  conditions: string
  updated_at: string
}

const currentWeather = ref<WeatherData>({
  temperature: 0,
  conditions: '',
  updated_at: '',
  date: '',
})

const forecast = ref<WeatherData[]>([])

const weatherIcon = computed(() => {
  return getWeatherIcon(currentWeather.value.conditions)
})

const fetchWeather = async () => {
  try {
    // Fetch current weather
    const { data: currentData } = await useSupabaseClient()
      .from('weather_data')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (currentData) {
      currentWeather.value = currentData
    }

    // Fetch forecast
    const { data: forecastData } = await useSupabaseClient()
      .from('weather_data')
      .select('*')
      .order('date', { ascending: true })
      .limit(14)

    if (forecastData) {
      forecast.value = forecastData
    }
  } catch (error) {
    console.error('Error fetching weather:', error)
  }
}

// Fetch weather on component mount
onMounted(fetchWeather)

// Refresh weather every 10 minutes
const refreshInterval = setInterval(fetchWeather, 10 * 60 * 1000)
onUnmounted(() => clearInterval(refreshInterval))

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString()
}

const formatDay = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
}

const getWeatherIcon = (conditions: string) => {
  // Map weather conditions to icon paths
  const iconMap: Record<string, string> = {
    'clear': '/weather-icons/sunny.svg',
    'cloudy': '/weather-icons/cloudy.svg',
    'rain': '/weather-icons/rain.svg',
    'snow': '/weather-icons/snow.svg',
    'thunderstorm': '/weather-icons/thunderstorm.svg',
  }

  return iconMap[conditions.toLowerCase()] || '/weather-icons/unknown.svg'
}
</script>

<style scoped>
.weather-widget {
  max-width: 800px;
  margin: 0 auto;
}

.current-weather {
  margin-bottom: 1rem;
}

.weather-icon img {
  width: 64px;
  height: 64px;
}

.temperature {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.conditions {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.last-updated {
  font-size: 0.875rem;
  color: #666;
}

.forecast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.forecast-day {
  text-align: center;
  padding: 0.5rem;
  border-radius: 4px;
  background: #f5f5f5;
}

.day-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.day-icon img {
  width: 32px;
  height: 32px;
  margin: 0.5rem 0;
}

.day-temp {
  font-weight: bold;
}
</style> 