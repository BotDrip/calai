import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// 1. Initialize API
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) console.error("Missing Gemini API Key in .env");

const genAI = new GoogleGenerativeAI(apiKey);

// 2. Feature: AI Coach (Text) - Uses Flash for speed
export const getAICoachingResponse = async (prompt: string, context: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fullPrompt = `You are a high-energy fitness coach. Context: ${context}. Question: ${prompt}. Keep it short and motivating!`;
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Coach Error:", error);
    return "Let's focus on your training! (AI Connection Issue)";
  }
};

// 3. Feature: Food Scanner (Vision) - Uses Flash & Disables Safety Filters
export const analyzeFoodImage = async (imageBase64: string) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      // Critical: Disable filters so food isn't blocked
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    });

    // Clean Base64 string
    const data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const prompt = `Analyze this food. Return valid JSON only.
    {
      "foodName": "string",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fats": number,
      "healthScore": number,
      "recommendation": "string"
    }`;

    const result = await model.generateContent([
      prompt, 
      { inlineData: { data, mimeType: "image/jpeg" } }
    ]);
    
    const text = result.response.text();
    // Clean markdown before parsing
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Scan Error:", error);
    throw new Error("AI Scan Failed");
  }
};