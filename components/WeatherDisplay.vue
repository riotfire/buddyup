<template>
  <div class="is-flex is-align-items-center">
    <template v-if="isLoading">
      <span class="icon">
        <Icon name="ph:circle-notch" class="is-spinning" />
      </span>
    </template>
    <template v-else-if="error">
      <span class="icon has-text-danger mr-2">
        <Icon name="ph:warning" />
      </span>
      <span class="is-size-7 has-text-danger">{{ error }}</span>
    </template>
    <template v-else-if="weather">
      <Icon 
        :name="getWeatherIcon(weather.icon)"
        class="mr-2 has-text-info"
        size="24"
      />
      <div class="is-flex is-flex-direction-column">
        <span class="has-text-weight-medium">{{ weather.temp }}°F</span>
        <span class="is-size-7 has-text-grey">Feels like {{ weather.feelslike }}°F</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { weather, isLoading, error } = useWeather()

// Map Visual Crossing icons to Phosphor icons
const getWeatherIcon = (icon: string) => {
  const iconMap: Record<string, string> = {
    'clear-day': 'ph:sun',
    'clear-night': 'ph:moon',
    'partly-cloudy-day': 'ph:cloud-sun',
    'partly-cloudy-night': 'ph:cloud-moon',
    'cloudy': 'ph:cloud',
    'rain': 'ph:cloud-rain',
    'snow': 'ph:snowflake',
    'wind': 'ph:wind',
    'fog': 'ph:cloud-fog'
  }
  return iconMap[icon] || 'ph:cloud'
}
</script>

<style scoped>
.is-spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 