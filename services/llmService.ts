import { GoogleGenAI } from "@google/genai";
import { FlowchartSpec, Language } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFlowchart = async (
  description: string,
  systemPrompt: string,
  language: Language,
  modelName: string = 'gemini-2.5-flash'
): Promise<FlowchartSpec> => {
  const client = getClient();
  
  const runtimeHint = `\n\nUser-selected language code: ${language}. You only handle structure and labels.`;
  const fullSystemPrompt = systemPrompt + runtimeHint;

  try {
    const response = await client.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [{ text: description }]
        }
      ],
      config: {
        systemInstruction: fullSystemPrompt,
        responseMimeType: "application/json",
        temperature: 0.4, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");

    // Clean up potential markdown formatting if the model slips up, 
    // though responseMimeType should handle it.
    const jsonString = text.replace(/```json\n?|```/g, '').trim();
    const data = JSON.parse(jsonString);
    
    // Basic validation
    if (!data.nodes || !data.edges) {
      throw new Error("Invalid flowchart schema received");
    }

    return data as FlowchartSpec;

  } catch (error) {
    console.error("LLM Generation Error:", error);
    throw error;
  }
};