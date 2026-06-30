import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

try {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent("Hello, respond with 1 word: YES");
  console.log(`Success! Response for gemini-2.5-flash: "${result.response.text().trim()}"`);
} catch (error) {
  console.warn("Failed for gemini-2.5-flash:", error.message);
}
