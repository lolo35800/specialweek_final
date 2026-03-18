import { api } from './api'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  reply: string
  model: string
}

export async function sendMessage(
  message: string,
  history: ChatMessage[],
): Promise<ChatResponse> {
  return api.post<ChatResponse>('/ai/chat', { message, history })
}
