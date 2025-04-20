import { $fetch } from 'ofetch'

interface WeatherResponse {
  days: Array<{
    datetime: string
    tempmax: number
    tempmin: number
    temp: number
    feelslike: number
    humidity: number
    precip: number
    precipprob: number
    precipcover: number
    preciptype: string[]
    snow: number
    snowdepth: number
    windgust: number
    windspeed: number
    winddir: number
    pressure: number
    cloudcover: number
    visibility: number
    solarradiation: number
    solarenergy: number
    uvindex: number
    severerisk: number
    sunrise: string
    sunset: string
    moonphase: number
    conditions: string
    description: string
    icon: string
    stations: string[]
    source: string
  }>
}

export async function getWeatherForecast(startDate: string, endDate: string): Promise<string> {
  try {
    const response = await $fetch<WeatherResponse>(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/New%20York%20City/${startDate}/${endDate}`,
      {
        params: {
          key: process.env.NUXT_VISUALCROSSING_API_KEY,
          unitGroup: 'us',
          include: 'days',
          contentType: 'json'
        }
      }
    )

    if (!response.days || response.days.length === 0) {
      return 'Weather data unavailable for the specified dates.'
    }

    // Format the weather data into a readable string
    const weatherSummary = response.days.map(day => {
      return `${day.datetime}: ${day.conditions} (${day.tempmin}°F - ${day.tempmax}°F), ${day.description}`
    }).join('\n')

    return `Weather forecast for NYC:\n${weatherSummary}`
  } catch (error) {
    console.error('Weather API error:', error)
    return 'Unable to fetch weather data.'
  }
}

export function extractDatesFromQuery(query: string): { startDate: string; endDate: string } | null {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Check for specific date patterns
  const datePatterns = [
    { pattern: /(\d{1,2})\/(\d{1,2})/, handler: (match: RegExpMatchArray) => {
      const month = parseInt(match[1])
      const day = parseInt(match[2])
      const date = new Date(today.getFullYear(), month - 1, day)
      return { startDate: date, endDate: date }
    }},
    { pattern: /this weekend/, handler: () => {
      const saturday = new Date(today)
      saturday.setDate(saturday.getDate() + (6 - today.getDay()))
      const sunday = new Date(saturday)
      sunday.setDate(sunday.getDate() + 1)
      return { startDate: saturday, endDate: sunday }
    }},
    { pattern: /next weekend/, handler: () => {
      const saturday = new Date(today)
      saturday.setDate(saturday.getDate() + (6 - today.getDay()) + 7)
      const sunday = new Date(saturday)
      sunday.setDate(sunday.getDate() + 1)
      return { startDate: saturday, endDate: sunday }
    }},
    { pattern: /today/, handler: () => ({ startDate: today, endDate: today }) },
    { pattern: /tomorrow/, handler: () => ({ startDate: tomorrow, endDate: tomorrow }) }
  ]

  for (const { pattern, handler } of datePatterns) {
    const match = query.match(pattern)
    if (match) {
      const dates = handler(match)
      return {
        startDate: dates.startDate.toISOString().split('T')[0],
        endDate: dates.endDate.toISOString().split('T')[0]
      }
    }
  }

  return null
} 