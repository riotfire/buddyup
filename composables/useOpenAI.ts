import OpenAI from 'openai'
import { useRuntimeConfig } from '#app'

type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export const useOpenAI = () => {
  const config = useRuntimeConfig()
  
  const openai = new OpenAI({
    apiKey: config.openaiApiKey as string,
  })

  const chat = async (messages: Message[]) => {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
      })
      return response.choices[0].message?.content
    } catch (error) {
      console.error('Error calling OpenAI API:', error)
      throw error
    }
  }

  return {
    chat,
  }
} 