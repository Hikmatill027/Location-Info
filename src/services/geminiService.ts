import { GoogleGenAI } from "@google/genai";
import { Message, GroundingChunk, Language } from "../types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function getChatResponse(
  message: string,
  language: Language = 'en',
  location?: { latitude: number; longitude: number }
): Promise<{ text: string; groundingChunks: GroundingChunk[] }> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const languageNames = {
    en: 'English',
    uz: 'Uzbek',
    ru: 'Russian'
  };

  // Use gemini-2.5-flash for Google Maps grounding
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: message,
    config: {
      systemInstruction: `You are a helpful location assistant. Please provide your response in ${languageNames[language]} language.`,
      tools: [{ googleMaps: {} }, { googleSearch: {} }],
      toolConfig: location ? {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        }
      } : undefined
    },
  });

  const text = response.text || "I couldn't find an answer to that.";
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const groundingChunks: GroundingChunk[] = chunks.map((chunk: any) => {
    const result: GroundingChunk = {};
    if (chunk.maps) {
      result.maps = {
        uri: chunk.maps.uri,
        title: chunk.maps.title || "View on Google Maps"
      };
    }
    if (chunk.web) {
      result.web = {
        uri: chunk.web.uri,
        title: chunk.web.title || "Source"
      };
    }
    return result;
  }).filter((c: GroundingChunk) => c.maps || c.web);

  return { text, groundingChunks };
}
