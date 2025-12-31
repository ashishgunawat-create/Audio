import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "../types";

const API_KEY = process.env.API_KEY || '';

/**
 * Generates speech from text using Gemini 2.5 Flash TTS.
 * @param text The text to synthesize.
 * @param voiceName The voice to use.
 * @returns The base64 encoded audio string from the API.
 */
export const generateSpeech = async (
  text: string,
  voiceName: VoiceName = VoiceName.Kore
): Promise<string | undefined> => {
  if (!API_KEY) {
    throw new Error("API_KEY is missing. Please set it in the environment.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data received from Gemini API.");
    }

    return base64Audio;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};