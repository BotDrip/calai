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
    if (!apiKey) {
      throw new Error("Gemini API Key not configured. Please add VITE_GEMINI_API_KEY to your .env file");
    }

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

    const prompt = `You are a professional nutritionist AI. Analyze this food image in detail.

CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no explanations, just the JSON object.

Provide a comprehensive nutrition analysis including:
- Exact food name/dish name
- Estimated portion size (e.g., "1 cup", "200g", "1 medium bowl")
- Food category (e.g., "Protein", "Carbohydrate", "Vegetable", "Dairy", "Snack", "Beverage")
- Complete macronutrient breakdown per serving
- Micronutrient highlights (fiber, vitamins, minerals if applicable)
- Health score from 1-10 based on nutritional value
- Confidence score (0-100) in your analysis
- Personalized recommendation for bodybuilders/athletes
- Whether it's suitable for cutting/bulking phases

Return this EXACT JSON structure:
{
  "foodName": "exact dish or food name",
  "portionSize": "estimated portion",
  "category": "food category",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number,
  "fiber": number,
  "healthScore": number (1-10),
  "confidenceScore": number (0-100),
  "recommendation": "detailed recommendation for athletes",
  "suitableFor": "bulking/cutting/maintenance",
  "micronutrients": "key vitamins/minerals if notable"
}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data, mimeType: "image/jpeg" } }
    ]);

    const text = result.response.text();
    console.log("Gemini Raw Response:", text);

    // Clean markdown and any extra text
    let jsonStr = text.trim();
    jsonStr = jsonStr.replace(/```json\s*/g, '');
    jsonStr = jsonStr.replace(/```\s*/g, '');
    jsonStr = jsonStr.replace(/^[^{]*/, ''); // Remove text before first {
    jsonStr = jsonStr.replace(/[^}]*$/, ''); // Remove text after last }

    console.log("Cleaned JSON String:", jsonStr);

    const parsed = JSON.parse(jsonStr);

    // Validate required fields
    if (!parsed.foodName || typeof parsed.calories !== 'number') {
      throw new Error("Invalid response format from AI");
    }

    return parsed;

  } catch (error: any) {
    console.error("Scan Error Details:", error);

    if (error.message?.includes("API Key")) {
      throw new Error("API Key not configured. Check your .env file");
    }

    if (error.message?.includes("quota")) {
      throw new Error("API quota exceeded. Please try again later");
    }

    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse AI response. The image might not contain recognizable food");
    }

    throw new Error(error.message || "AI analysis failed. Please try with a clearer image");
  }
};