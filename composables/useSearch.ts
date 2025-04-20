import { ref } from 'vue'

interface SearchResult {
  content: string
  citations?: Array<{
    title: string
    url: string
  }>
  isExternalSearch: boolean
  debug?: {
    classificationModel: string
    responseModel: string
    route: 'EXTERNAL_SEARCH' | 'AI_ONLY'
    confidence: number
    searchProvider?: string
  }
}

export function useSearch() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<SearchResult | null>(null)
  const streamingContent = ref('')

  const search = async (query: string) => {
    isLoading.value = true
    error.value = null
    result.value = null
    streamingContent.value = ''

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      result.value = data
      streamingContent.value = data.content
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred during search'
    } finally {
      isLoading.value = false
    }
  }

  return {
    search,
    isLoading,
    error,
    result,
    streamingContent
  }
} 