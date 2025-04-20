import { defineEventHandler, readBody } from 'h3'
import { searchRouter } from '~/server/utils/searchRouter'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { query } = body

    if (!query) {
      throw createError({
        statusCode: 400,
        message: 'Query is required'
      })
    }

    const result = await searchRouter(query)
    return result
  } catch (error) {
    console.error('Search API error:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'An error occurred during search'
    })
  }
}) 