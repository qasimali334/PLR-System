import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Models
const proModel   = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const flashModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Generate content with Gemini 2.5 Pro (complex tasks)
 */
export const generateWithPro = async (prompt) => {
  const result = await proModel.generateContent(prompt);
  return result.response.text();
};

/**
 * Generate content with Gemini 2.5 Flash (fast tasks)
 */
export const generateWithFlash = async (prompt) => {
  const result = await flashModel.generateContent(prompt);
  return result.response.text();
};

/**
 * Generate structured JSON output with model selection
 */
export const generateJSON = async (prompt, model = 'flash') => {
  const targetModel = model === 'pro' ? proModel : flashModel;
  const result = await targetModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
    }
  });
  
  const raw = result.response.text();
  // Extract JSON from markdown code blocks if present (just in case)
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : raw;
  return JSON.parse(jsonStr.trim());
};

/**
 * Stream content with Gemini 2.5 Flash (for chat SSE)
 */
export const streamWithFlash = async (prompt, onChunk) => {
  const result = await flashModel.generateContentStream(prompt);
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) onChunk(text);
  }
};

/**
 * Multi-turn chat with Flash model
 */
export const startChat = (history = []) => {
  return flashModel.startChat({
    history: history.map(m => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
  });
};

export default { generateWithPro, generateWithFlash, generateJSON, streamWithFlash, startChat };
