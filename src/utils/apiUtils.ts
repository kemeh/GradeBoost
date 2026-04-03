import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from "@google/genai";

export async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: GenerateContentParameters,
  maxRetries: number = 3,
  backoffMs: number = 1000
): Promise<GenerateContentResponse> {
  try {
    return await ai.models.generateContent(params);
  } catch (error: any) {
    // Check if the error is a 503 Service Unavailable
    if (maxRetries > 0 && (error.status === 503 || error.message?.includes('503'))) {
      console.warn(`Gemini API 503 error, retrying in ${backoffMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      return generateContentWithRetry(ai, params, maxRetries - 1, backoffMs * 2);
    }
    throw error;
  }
}
