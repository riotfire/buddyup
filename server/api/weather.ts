import { defineEventHandler } from 'h3'
import { createClient } from '@supabase/supabase-js'

interface WeatherResponse {
  currentConditions: {
    temp: number
    conditions: string
  }
  days: Array<{
    datetime: string
    tempmax: number
    tempmin: number
    conditions: string
  }>
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )

  try {
    // Check if we have recent weather data
    const { data: existingData } = await supabase
      .from('weather_data')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    const now = new Date()
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)

    if (
      existingData &&
      new Date(existingData.updated_at) > tenMinutesAgo
    ) {
      return existingData
    }

    // Fetch new weather data from Visual Crossing
    const response = await $fetch<WeatherResponse>(
      'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/40.7128,-74.0060',
      {
        params: {
          key: config.public.weatherApiKey,
          unitGroup: 'us',
          include: 'current,days',
          contentType: 'json',
        },
      }
    ) as WeatherResponse

    // Format the data
    const weatherData = {
      date: new Date().toISOString().split('T')[0],
      temperature: Math.round(response.currentConditions.temp),
      conditions: response.currentConditions.conditions,
      forecast: response.days.slice(0, 14).map((day) => ({
        date: day.datetime,
        temperature: Math.round((day.tempmax + day.tempmin) / 2),
        conditions: day.conditions,
      })),
      updated_at: new Date().toISOString(),
    }

    // Store in Supabase
    const { error } = await supabase
      .from('weather_data')
      .upsert(weatherData)

    if (error) throw error

    return weatherData
  } catch (error) {
    console.error('Weather API error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch weather data',
    })
  }
}) 