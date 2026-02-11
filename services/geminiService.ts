
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTIONS } from "../constants";
import { AppMode } from "../types";

export interface GeminiResult {
  text: string;
  sources?: { title: string; uri: string }[];
  image?: string;
  maps?: { title: string; uri: string }[];
}

export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioToBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const getGeminiResponse = async (
  prompt: string,
  mode: AppMode,
  history: any[] = [],
  imageInBase64?: string
): Promise<GeminiResult> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const isImageRequest = prompt.toLowerCase().includes('fakkii') || prompt.toLowerCase().includes('kaasi') || prompt.toLowerCase().includes('uumi');

  try {
    if (isImageRequest && !imageInBase64) {
      const imgResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `Generate an image based on this Oromo description: ${prompt}.` }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      let generatedImage;
      if (imgResponse.candidates?.[0]?.content?.parts) {
        for (const part of imgResponse.candidates[0].content.parts) {
          if (part.inlineData) generatedImage = `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return { text: "Fakkii ati gaafatte qopheesseera.", image: generatedImage };
    }

    const parts: any[] = [{ text: prompt }];
    if (imageInBase64) parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageInBase64 } });

    let latLng = undefined;
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      latLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch (e) { }

    // FIX: Using gemini-2.5-flash for maps support as explicitly required in prompt examples. 
    // This fixes the 400 "Google Maps tool is not enabled for this model" error.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: history.length > 0 ? history : [{ role: 'user', parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.GENERAL,
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        toolConfig: latLng ? { retrievalConfig: { latLng } } : undefined,
        temperature: 0.7,
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks.filter((c: any) => c.web).map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
    const maps = chunks.filter((c: any) => c.maps).map((c: any) => ({ title: c.maps.title, uri: c.maps.uri }));

    return { text: response.text || "Dogoggorri uumameera.", sources, maps };
  } catch (error: any) {
    console.error("Gemini API Error:", error);

    // Provide user-friendly Afaan Oromo error messages
    const errorMsg = error?.message || JSON.stringify(error);

    if (errorMsg.includes("API key") || errorMsg.includes("401") || errorMsg.includes("403")) {
      throw new Error("Dogoggora: API key sirrii miti. Maaloo .env.local keessatti API key kee sirrii ta'e galchi.");
    } else if (errorMsg.includes("quota") || errorMsg.includes("429")) {
      throw new Error("Gaaffii baay'ee ergameera. Maaloo daqiiqaa muraasa booda irra deebi'ii yaali.");
    } else if (errorMsg.includes("network") || errorMsg.includes("fetch")) {
      throw new Error("Walitti dhufeenya interneetii hin jiru. Maaloo interneetii kee mirkaneessi.");
    } else if (errorMsg.includes("Google Maps tool is not enabled")) {
      // Graceful fallback: retry without Maps tool
      console.warn("Maps not supported, retrying without Maps tool...");
      try {
        const retryResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: history.length > 0 ? history : [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: SYSTEM_INSTRUCTIONS.GENERAL,
            tools: [{ googleSearch: {} }], // Only search, no maps
            temperature: 0.7,
          },
        });
        const retryChunks = retryResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const retrySources = retryChunks.filter((c: any) => c.web).map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
        return { text: retryResponse.text || "Dogoggorri uumameera.", sources: retrySources };
      } catch (retryError) {
        throw new Error("Dogoggora: Odeeffannoo argachuu hin dandeenye. Maaloo irra deebi'ii yaali.");
      }
    } else {
      throw new Error(`Dogoggora: ${errorMsg.substring(0, 100)}...`);
    }
  }
};

export const generateQuiz = async (topic: string) => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Qorumsa gabaabaa gaaffilee 5 qabu waa'ee ${topic} Afaan Oromoon qopheessi. Gaaffilee fi deebiiwwan JSON format qulqulluu ta'een kenni.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: 'Gaafficha Afaan Oromoon.',
            },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Filannoo deebii 4.',
            },
            answer: {
              type: Type.INTEGER,
              description: 'Index deebii sirrii (0-3).',
            },
          },
          required: ["question", "options", "answer"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
};

export const generateVideo = async (prompt: string, setProgress: (msg: string) => void) => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

  setProgress("Viidiyoo uumaa jirra...");
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    setProgress("Viidiyoo bilcheessaa jirra (Daqiiqaa 1 fudhachuu danda'a)...");
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed - no URI found.");

  return `${downloadLink}&key=${import.meta.env.VITE_GEMINI_API_KEY}`;
};

export const generateStoryConversation = async (topic: string) => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const prompt = `TTS the following conversation between Jaalalaa (an old man) and Boonaa (a young boy) about ${topic} in Afaan Oromo:
      Jaalalaa: Ashamaa Boonaa, waa'ee ${topic} sitti himuu?
      Boonaa: Eeyyee abbaa, natti himi maaloo.
      Jaalalaa: Tole, dhaggeeffadhu, ${topic} jechuun...`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: 'Jaalalaa',
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
            },
            {
              speaker: 'Boonaa',
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
            }
          ]
        }
      }
    }
  });

  return { audio: response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data };
};
