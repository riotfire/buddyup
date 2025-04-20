import { ref, onMounted, onUnmounted } from 'vue'
import { useRuntimeConfig } from '#app'

interface WeatherData {
  temp: number
  icon: string
  description: string
  feelslike: number
}

export const useWeather = () => {
  const config = useRuntimeConfig()
  const weather = ref<WeatherData | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  let abortController: AbortController | null = null

  const fetchWeather = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Cancel any ongoing request
      if (abortController) {
        abortController.abort()
      }
      abortController = new AbortController()

      // NYC coordinates
      const location = 'New York City,NY'
      const apiKey = config.public.visualCrossingApiKey
      
      if (!apiKey) {
        throw new Error('API key not configured')
      }

      const url = new URL('https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/')
      url.pathname += `${encodeURIComponent(location)}/today`
      url.searchParams.append('unitGroup', 'us')
      url.searchParams.append('include', 'current')
      url.searchParams.append('key', apiKey)
      url.searchParams.append('contentType', 'json')
      
      const response = await fetch(url.toString(), {
        signal: abortController.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      
      if (!data.currentConditions) {
        throw new Error('No current conditions data available')
      }

      const current = data.currentConditions
      
      weather.value = {
        temp: Math.round(current.temp),
        icon: current.icon,
        description: current.conditions,
        feelslike: Math.round(current.feelslike)
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        // Request was cancelled, ignore
        return
      }
      console.error('Weather fetch error:', e)
      error.value = e instanceof Error ? e.message : 'Failed to load weather data'
    } finally {
      isLoading.value = false
    }
  }

  // Fetch on mount
  onMounted(() => {
    fetchWeather()
    // Update every 5 minutes
    const interval = setInterval(fetchWeather, 5 * 60 * 1000)
    onUnmounted(() => {
      clearInterval(interval)
      if (abortController) {
        abortController.abort()
      }
    })
  })

  return {
    weather,
    isLoading,
    error,
    fetchWeather
  }
} 