import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Model
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Feature 1: AI Coach (Text Model)
export const getAICoachingResponse = async (prompt: string, context: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  // We feed the user's health context to the model for "Personalization"
  const fullPrompt = `You are an expert fitness and nutrition coach. 
  User Context: ${context}
  User Question: ${prompt}
  Provide a concise, motivating, and actionable answer.`;
  
  const result = await model.generateContent(fullPrompt);
  return result.response.text();
};

// Feature 2: Food Scanner (Vision Model)
export const analyzeFoodImage = async (imageBase64: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  
  const prompt = `Analyze this food image. Return a raw JSON object (no markdown) with these exact keys:
  {
    "foodName": "string",
    "calories": number (estimate),
    "protein": number (grams),
    "carbs": number (grams),
    "fats": number (grams),
    "healthScore": number (1-10),
    "recommendation": "string (brief healthy tip)"
  }`;

  const imagePart = {
    inlineData: {
      data: imageBase64.split(',')[1], // Remove the "data:image/jpeg;base64," prefix
      mimeType: "image/jpeg",
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text();
  // Clean up potential markdown formatting from response
  const cleanText = text.replace(/```json/g, '').replace(/```/g, '');
  return JSON.parse(cleanText);
};