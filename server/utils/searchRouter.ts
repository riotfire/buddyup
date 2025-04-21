import { OpenAI } from 'openai'
import { $fetch } from 'ofetch'
import { getWeatherForecast as getWeather, extractDatesFromQuery } from './weather'

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
  timeoutMs: 8000, // 8 seconds total maximum
  maxRetries: 2
}

const API_TIMEOUT_MS = 10000; // 10 seconds per API call

// Helper function to timeout a promise
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

export type SearchResultType = 'INFORMATION' | 'NEWS' | 'RECOMMENDATIONS' | 'REVIEWS' | 'DIRECTIONS' | 'ERROR'

interface SearchResult {
  type: SearchResultType;
  content: string;
  context: Record<string, any>;
}

interface ExternalSearchResponse {
  answer?: string;
  results?: Array<{
    title: string;
    url: string;
    content: string;
  }>;
  error?: boolean;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ClassificationResult {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface SearchError {
  message: string;
  code?: string;
  status?: number;
}

// Helper function to check environment
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Helper function to get weather forecast
async function getWeatherForecast(query: string): Promise<string | null> {
  const dateRange = extractDatesFromQuery(query)
  if (!dateRange || !dateRange.startDate || !dateRange.endDate) return null
  
  try {
    return await getWeather(dateRange.startDate, dateRange.endDate)
  } catch (error) {
    console.error('Error getting weather forecast:', error)
    return null
  }
}

async function performExternalSearch(query: string): Promise<ExternalSearchResponse | null> {
  try {
    const response = await $fetch('/api/external-search', {
      method: 'POST',
      body: { query }
    })
    return response as ExternalSearchResponse
  } catch (error) {
    console.error('Error performing external search:', error)
    return null
  }
}

export async function searchRouter(query: string): Promise<SearchResult> {
  const startTime = Date.now();
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    // Run classification and date extraction concurrently
    const [classificationResult, dateRange] = await Promise.all([
      withTimeout(
        openai.chat.completions.create({
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
}`
            },
            { role: 'user', content: query }
          ],
          temperature: 0.1,
          max_tokens: 50
        }),
        API_TIMEOUT_MS,
        'Classification timeout'
      ),
      extractDatesFromQuery(query)
    ]).catch(error => {
      console.error('Initial concurrent operations error:', error);
      return [{
        choices: [{ message: { content: JSON.stringify({ route: 'AI_ONLY', confidence: 0 }) } }]
      }, null] as [ClassificationResult, DateRange | null];
    });

    const classification: ClassificationResponse = JSON.parse(
      classificationResult.choices[0].message.content || '{"route":"AI_ONLY","confidence":0}'
    );

    const needsExternalSearch = classification.route === 'EXTERNAL_SEARCH';
    
    // Get weather info if dates are mentioned
    const weatherForecast = dateRange?.startDate && dateRange?.endDate 
      ? await getWeather(
          dateRange.startDate, 
          dateRange.endDate
        )
      : undefined
    if (weatherForecast) {
      console.log('Weather info:', weatherForecast)
    }

    // Run external search if needed
    let externalSearchResult: ExternalSearchResponse | null = null
    if (needsExternalSearch) {
      try {
        externalSearchResult = await withTimeout(
          fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': process.env.TAVILY_API_KEY || ''
            },
            body: JSON.stringify({
              query,
              search_depth: 'advanced',
              include_answer: true,
              include_raw_content: false,
              include_images: false
            })
          }).then(res => res.json()),
          API_TIMEOUT_MS,
          'External search timeout'
        )
      } catch (err) {
        console.error('External search error:', err)
        externalSearchResult = null
      }
    }

    let searchContext = '';
    let citations: Array<{ title: string; url: string; content: string }> = []
    if (needsExternalSearch && externalSearchResult) {
      if (externalSearchResult.answer) {
        searchContext = externalSearchResult.answer
      }
      if (externalSearchResult.results) {
        citations.push(...externalSearchResult.results)
      }
    }

    // Check remaining time for final response
    const remainingTime = config.timeoutMs - (Date.now() - startTime);
    if (remainingTime < 1000) {
      throw new Error('Insufficient time for final response');
    }

    // Final response generation
    let content = '';
    if (process.env.NODE_ENV === 'production') {
      const response = await withTimeout(
        openai.chat.completions.create({
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
    {"title": "Step 1", "content": "Step content"}
  ]
}

2. For time-sensitive updates or events, use the NEWS format:
{
  "type": "news",
  "title": "Headline",
  "summary": "Brief summary",
  "content": "Full content"
}

3. For suggestions or options, use the RECOMMENDATIONS format:
{
  "type": "recommendations",
  "items": [
    {
      "title": "Place name",
      "tags": ["tag1"],
      "distance": "0.5 miles",
      "price": "$$"
    }
  ]
}${weatherForecast ? '\n\nWeather information:\n' + weatherForecast : ''}${searchContext ? '\n\nContext:\n' + searchContext : ''}`
            },
            { role: 'user', content: query }
          ],
          temperature: 0.7,
          max_tokens: 500 // Reduced for production
        }),
        remainingTime,
        'Final response generation timeout'
      );
      content = response.choices[0].message.content || '';
    } else {
      const stream = await withTimeout(
        openai.chat.completions.create({
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
}${weatherForecast ? '\n\nWeather information:\n' + weatherForecast : ''}${searchContext ? '\n\nContext:\n' + searchContext : ''}`
            },
            { role: 'user', content: query }
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 1000
        }),
        remainingTime,
        'Final response generation timeout'
      );

      for await (const chunk of stream as any) {
        const chunkContent = chunk.choices[0]?.delta?.content || '';
        if (chunkContent) {
          content += chunkContent;
        }
      }
    }

    // Parse and validate response
    let response;
    try {
      response = JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse response:', error);
      response = {
        type: 'information',
        content: content
      };
    }

    // Ensure required fields
    if (!response.type) {
      response.type = 'information';
    }
    if (!response.content) {
      response.content = content;
    }

    if (!response || !response.content) {
      const errorResult: SearchResult = {
        type: 'ERROR',
        content: 'Failed to generate a valid response. Please try again or rephrase your question.',
        context: {
          errorMessage: 'Invalid response format',
          errorCode: 'INVALID_RESPONSE',
          errorStatus: 500
        }
      };
      return errorResult;
    }

    return {
      ...response,
      isExternalSearch: needsExternalSearch,
      citations,
      debug: !isProduction() ? {
        classificationModel: 'gpt-4',
        responseModel: 'gpt-4',
        route: classification.route,
        confidence: classification.confidence,
        searchProvider: needsExternalSearch ? 'Tavily' : undefined,
        steps: {
          classification: {
            model: 'gpt-4',
            response: classification,
            rawResponse: classificationResult
          },
          externalSearch: needsExternalSearch ? {
            provider: 'Tavily',
            query: query,
            response: externalSearchResult
          } : undefined,
          weather: dateRange ? {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            forecast: weatherForecast
          } : undefined,
          finalResponse: {
            model: 'gpt-4',
            context: searchContext,
            weatherContext: weatherForecast,
            temperature: 0.7,
            maxTokens: isProduction() ? 500 : 1000
          }
        }
      } : undefined
    };
  } catch (err) {
    console.error('Search router error:', err);
    const searchError: SearchError = {
      message: err instanceof Error ? err.message : 'An unknown error occurred',
      code: 'SEARCH_ERROR',
      status: 500
    };

    const errorResult: SearchResult = {
      type: 'ERROR',
      content: `I encountered an error while processing your request: ${searchError.message}. Please try again or rephrase your question.`,
      context: searchError
    };
    return errorResult;
  }
} 