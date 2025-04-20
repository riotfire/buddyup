import { OpenAI } from 'openai'
import { $fetch } from 'ofetch'
import { getWeatherForecast, extractDatesFromQuery } from './weather'

interface ClassificationResponse {
  route: 'EXTERNAL_SEARCH' | 'AI_ONLY'
  confidence: number
}

interface SearchConfig {
  confidenceThreshold: number
  timeoutMs: number
  maxRetries: number
}

const config: SearchConfig = {
  confidenceThreshold: 0.85,
  timeoutMs: 10000,
  maxRetries: 2
}

interface SearchResult {
  content: string
  type: 'information' | 'news' | 'recommendations' | 'reviews' | 'directions' | 'error'
  citations?: Array<{
    title: string
    url: string
  }>
  isExternalSearch: boolean
  steps?: Array<{
    title: string
    content: string
  }>
  timestamp?: string
  isLive?: boolean
  title?: string
  summary?: string
  items?: Array<{
    title: string
    image: string
    tags: string[]
    distance: string
    price: string
  }>
  rating?: number
  reviewCount?: number
  pros?: string[]
  cons?: string[]
  options?: Array<{
    type: string
    steps: Array<{
      transport: string
      description: string
      duration: string
      distance: string
    }>
  }>
  debug?: {
    classificationModel: string
    responseModel: string
    route: 'EXTERNAL_SEARCH' | 'AI_ONLY'
    confidence: number
    searchProvider?: string
    steps: {
      classification: {
        model: string
        response: ClassificationResponse
        rawResponse: any
      }
      externalSearch?: {
        provider: string
        query: string
        response: any
      }
      weather?: {
        startDate: string
        endDate: string
        forecast: string
      }
      finalResponse: {
        model: string
        context: string
        weatherContext: string
        temperature: number
        maxTokens: number
      }
    }
  }
}

export async function searchRouter(query: string): Promise<SearchResult> {
  try {
    // Check for dates in the query and get weather if found
    const dates = extractDatesFromQuery(query)
    let weatherContext = ''
    if (dates) {
      weatherContext = await getWeatherForecast(dates.startDate, dates.endDate)
    }

    // Classification step
    const classificationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Classify whether this query needs external, real-time search data or can be answered using contextual AI alone.

Consider a query as requiring external search if it involves ANY of these aspects:
1. Time-sensitive information (events, schedules, "this weekend", "today", etc.)
2. Current status or conditions (wait times, operating hours, "right now", etc.)
3. Recent changes or updates (new openings, closures, etc.)
4. Specific dates or time periods in the near future
5. Real-time availability or capacity

Respond in JSON format with:
{
  "route": "EXTERNAL_SEARCH" or "AI_ONLY",
  "confidence": 0.0-1.0
}

For time-sensitive queries, especially those about events or current activities, always route to EXTERNAL_SEARCH with high confidence.`
          },
          { role: 'user', content: query }
        ],
        temperature: 0.1,
        max_tokens: 50
      })
    })

    const classificationData = await classificationResponse.json()
    const classification: ClassificationResponse = JSON.parse(
      classificationData.choices[0].message.content
    )

    const needsExternalSearch = classification.route === 'EXTERNAL_SEARCH'

    let searchContext = ''
    let citations = []
    let externalSearchResponse = null

    if (needsExternalSearch) {
      try {
        const tavilyResponse = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`,
          },
          body: JSON.stringify({
            query: `${query} NYC`,
            search_depth: 'advanced',
            include_answer: true,
            include_raw_content: false,
            max_results: 5,
          })
        })

        const tavilyData = await tavilyResponse.json()
        searchContext = tavilyData.answer
        citations = tavilyData.results.map((result: any) => ({
          title: result.title,
          url: result.url
        }))
        externalSearchResponse = {
          answer: tavilyData.answer,
          results: tavilyData.results.map((result: any) => ({
            title: result.title,
            url: result.url,
            content: result.content
          }))
        }
      } catch (error) {
        console.error('External search error:', error)
        searchContext = '[Note: External search data unavailable. Response may be incomplete.]'
        externalSearchResponse = {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Generate response with GPT-4
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a knowledgeable NYC guide. Analyze the query and respond in the most appropriate format:

1. For factual information or how-to questions, use the INFORMATION format:
{
  "type": "information",
  "content": "Clear, concise answer",
  "steps": [
    {"title": "Step 1", "content": "Step content"},
    {"title": "Step 2", "content": "Step content"}
  ]
}

2. For time-sensitive updates or events, use the NEWS format:
{
  "type": "news",
  "title": "Headline",
  "summary": "Brief summary",
  "content": "Full content",
  "timestamp": "2024-03-20T12:00:00Z",
  "isLive": true/false
}

3. For suggestions or options, use the RECOMMENDATIONS format:
{
  "type": "recommendations",
  "items": [
    {
      "title": "Place name",
      "image": "image_url",
      "tags": ["tag1", "tag2"],
      "distance": "0.5 miles",
      "price": "$$"
    }
  ]
}

4. For quality assessments, use the REVIEWS format:
{
  "type": "reviews",
  "rating": 4.5,
  "reviewCount": 100,
  "pros": ["pro1", "pro2"],
  "cons": ["con1", "con2"]
}

5. For navigation or routes, use the DIRECTIONS format:
{
  "type": "directions",
  "options": [
    {
      "type": "Fastest",
      "steps": [
        {
          "transport": "walk/subway/bus/ferry",
          "description": "Step description",
          "duration": "10 min",
          "distance": "0.5 miles"
        }
      ]
    }
  ]
}${weatherContext ? '\n\nWeather information:\n' + weatherContext : ''}${searchContext ? '\n\nUse this context to inform your response:' + searchContext : ''}`
        },
        { role: 'user', content: query }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1000
    })

    let content = ''
    for await (const chunk of stream) {
      const chunkContent = chunk.choices[0]?.delta?.content || ''
      if (chunkContent) {
        content += chunkContent
      }
    }

    // Parse the JSON response and ensure it has the required fields
    const response = JSON.parse(content)
    
    // Ensure the response has the required type field
    if (!response.type) {
      response.type = 'information'
    }

    // Ensure the response has the required content field
    if (!response.content) {
      response.content = content
    }

    return {
      ...response,
      isExternalSearch: needsExternalSearch,
      citations,
      debug: process.env.NODE_ENV === 'development' ? {
        classificationModel: 'gpt-4',
        responseModel: 'gpt-4',
        route: classification.route,
        confidence: classification.confidence,
        searchProvider: needsExternalSearch ? 'Tavily' : undefined,
        steps: {
          classification: {
            model: 'gpt-4',
            response: classification,
            rawResponse: classificationData
          },
          externalSearch: needsExternalSearch ? {
            provider: 'Tavily',
            query: `${query} NYC`,
            response: externalSearchResponse
          } : undefined,
          weather: dates ? {
            startDate: dates.startDate,
            endDate: dates.endDate,
            forecast: weatherContext
          } : undefined,
          finalResponse: {
            model: 'gpt-4',
            context: searchContext,
            weatherContext,
            temperature: 0.7,
            maxTokens: 1000
          }
        }
      } : undefined
    }
  } catch (error: unknown) {
    console.error('Search router error:', error)
    throw new Error(`Search router error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
} 