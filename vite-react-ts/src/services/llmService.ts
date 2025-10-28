export interface SentenceData {
  Sentence: string;
  icon: string;
  Label: string;
}

export interface StructuredLLMResponse {
  [key: string]: SentenceData;
}

export interface LLMServiceConfig {
  apiKey: string;
  baseUrl?: string;
}

const DEFAULT_BASE_URL = 'https://ai.reluv.xyz/v1';

export async function callLLMAPI(
  messages: Array<{ role: string; content: string }>,
  config: LLMServiceConfig
): Promise<string> {
  const url = `${config.baseUrl || DEFAULT_BASE_URL}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-oss-120b',
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export function parseStructuredResponse(responseText: string): StructuredLLMResponse {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as StructuredLLMResponse;
    return parsed;
  } catch (error) {
    console.error('Failed to parse LLM response:', error);
    // Return empty structure if parsing fails
    return {};
  }
}

export async function getLLMContent(
  prompt: string,
  config: LLMServiceConfig
): Promise<StructuredLLMResponse> {
  const messages = [
    {
      role: 'developer',
      content: `You are a helpful assistant. Your response MUST be a valid JSON object with the structure: {
  "1": {
    "Sentence": "...",
    "icon": "emoji",
    "Label": "label text"
  },
  "2": {
    ...
  }
}
Icon names should be Lucide React icon names (e.g., ArrowLeft, Zap, Code, Palette, Sparkles, Smartphone, Heart, etc.).
Return ONLY the JSON, no additional text.`,
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  const response = await callLLMAPI(messages, config);
  return parseStructuredResponse(response);
}
