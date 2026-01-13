import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "fake-key" });

export async function getAIResponse(message: string): Promise<string> {
  try {
    const systemPrompt = `You are an agricultural assistant for an app called AgriConnect that connects farmers with buyers. 
    Your goal is to provide helpful, accurate information about:
    1. Farming techniques and best practices
    2. Crop information (planting seasons, growing requirements, storage, etc.)
    3. Market trends and pricing information
    4. General agricultural knowledge
    
    Keep responses concise, practical and focused on helping farmers and buyers in the agricultural marketplace.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't process your request.";
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return "I'm having trouble connecting to my knowledge base. Please try again later.";
  }
}

// Get crop price prediction
export async function getPricePrediction(cropName: string, region: string): Promise<{
  currentPrice: number;
  fifteenDayForecast: number;
  thirtyDayForecast: number;
  trend: "rising" | "falling" | "stable";
}> {
  try {
    const prompt = `As an agricultural market analysis expert, predict the price trend for ${cropName} in ${region} for the next 30 days.
    Provide a JSON response with the following structure:
    {
      "currentPrice": [current price in rupees per kg],
      "fifteenDayForecast": [price in 15 days in rupees per kg],
      "thirtyDayForecast": [price in 30 days in rupees per kg],
      "trend": [one of: "rising", "falling", "stable"]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);

    return {
      currentPrice: result.currentPrice,
      fifteenDayForecast: result.fifteenDayForecast,
      thirtyDayForecast: result.thirtyDayForecast,
      trend: result.trend
    };
  } catch (error) {
    console.error("Error getting price prediction:", error);

    // Return fallback mock data in case of error
    return {
      currentPrice: 50,
      fifteenDayForecast: 55,
      thirtyDayForecast: 60,
      trend: "rising"
    };
  }
}
