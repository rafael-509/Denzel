import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

export async function getGeminiResponse(userPrompt: string) {
  try {
    // 1. Fetch dynamic config from our server
    const configRes = await fetch('/api/ai/config');
    const { systemInstructions, modelName } = await configRes.json();

    // 2. Initialize AI if not already done
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in environment variables.");
      }
      ai = new GoogleGenAI({ apiKey });
    }

    // 3. Generate content
    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstructions,
      }
    });

    return response.text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return "Desculpa, o meu sistema está um pouco lento agora. Tenta novamente em breve!";
  }
}
