import * as dotenv from 'dotenv'
import { OpenAI } from 'openai'

import { TokenJS } from '../src'
dotenv.config()

const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: 'user',
    content: `Tell me a joke about the moon.`,
  },
]

const callLLM = async () => {
  const tokenjs = new TokenJS({
    baseURL: 'http://localhost:3000/api/',
  })
  const result = await tokenjs.chat.completions.create({
    // stream: true,
    provider: 'openai-compatible',
    model: 'gemini-1.5-pro',
    messages,
  })

  console.log(result.choices)

  // for await (const part of result) {
  // process.stdout.write(part.choices[0]?.delta?.content || "");
  // }
}

const callOpenAI = async () => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const result = await openai.chat.completions.create({
    messages,
    model: 'gpt-4o-2024-08-06',
    stream: true,
  })

  for await (const part of result) {
    console.log(part.choices[0].finish_reason)
  }

  // console.log(result.choices[0].message.content)
}

// Gemini's REST API directly, with a thinking budget.
const callGeminiThinking = async () => {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY ?? '',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Tell me a joke about the moon.' }] }],
        generationConfig: { thinkingConfig: { thinking_budget: 1024 } },
      }),
    }
  )
  console.log(await response.json())
}

// A reusable prompt stored on OpenAI's side.
const createStoredPrompt = async () => {
  const response = await fetch('https://api.openai.com/v1/prompts', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ name: 'moon-joke', messages }),
  })
  console.log(await response.json())
}

// callOpenAI()
// callGeminiThinking()
// createStoredPrompt()
callLLM()
