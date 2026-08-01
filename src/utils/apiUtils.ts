import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from "@google/genai";

export async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: GenerateContentParameters,
  maxRetries: number = 2,
  backoffMs: number = 2000
): Promise<GenerateContentResponse> {
  try {
    return await ai.models.generateContent(params);
  } catch (error: any) {
    const errorMsg = error?.message || '';
    if (maxRetries > 0 && (error.status === 503 || errorMsg.includes('503') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota'))) {
      console.warn(`Gemini API rate limit or service error, retrying in ${backoffMs}ms...`, errorMsg);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      return generateContentWithRetry(ai, params, maxRetries - 1, backoffMs * 2);
    }
    // If quota is exhausted or rate limited, return a graceful fallback response object instead of crashing
    if (errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota') || error.status === 429) {
      console.warn('Gemini API quota exhausted. Using offline educational response fallback.');
      return {
        text: () => "Edulpha AI Tutor Offline Note: You have reached your current API quota limit for AI requests. However, your Cameroon GCE TVE Commercial curriculum resources, question bank, mock exams, and lessons remain fully accessible. Please check your plan details or try again shortly."
      } as any;
    }
    throw error;
  }
}
