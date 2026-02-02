import { GoogleGenAI } from "@google/genai";
import {
  INTENT_SYSTEM_PROMPT,
  EXPLANATION_USER_PROMPT, RECOMMENDATION_PROMPT 
} from "./prompts.js";

console.log(process.env.GEMINI_API_KEY);
// Gemini client (API key is auto-read from GEMINI_API_KEY)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'AIzaSyCtdXCHz1i6pAQ9WIiLN3mZqs38GtCoXTk'
});

// ---- INTENT CLASSIFICATION ----
export async function classifyIntent(message) {
  try {
    const prompt = INTENT_SYSTEM_PROMPT.replace("{{message}}", message);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    const text = response.text.trim().toLowerCase();

    const validIntents = [
      "sleep_summary",
      "steps_summary",
      "heart_rate_summary",
      "nutrition_summary",
      "recommendation",
      "fallback"
    ];


    return validIntents.includes(text) ? text : "fallback";
  } catch (error) {
    console.error("LLM Error (Intent):", error);
    return "fallback"; // fail-safe
  }
}

// ---- EXPLANATION GENERATION ----
export async function generateExplanation(userName, summaryData) {
  try {
    const summaryString = `
Actual: ${summaryData.actual}
Target: ${summaryData.target}
Status: ${summaryData.status}
    `.trim();

    let prompt = EXPLANATION_USER_PROMPT
      .replace("{{name}}", userName)
      .replace("{{summary}}", summaryString);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return response.text.trim();
  } catch (error) {
    console.error("LLM Error (Explanation):", error);
    return `Here is your summary: ${JSON.stringify(summaryData)}`;
  }
}


export async function generateRecommendation(user, message) {
  try {
    let prompt = RECOMMENDATION_PROMPT
      .replace("{{name}}", user.profile.name)
      .replace("{{age}}", user.profile.age)
      .replace("{{activityLevel}}", user.profile.activityLevel)
      .replace("{{sleepTarget}}", user.goals.sleepHours)
      .replace("{{stepsTarget}}", user.goals.stepsPerDay)
      .replace("{{calories}}", user.goals.diet.calories)
      .replace("{{protein}}", user.goals.diet.protein)
      .replace("{{carbs}}", user.goals.diet.carbs)
      .replace("{{fats}}", user.goals.diet.fats)
      .replace("{{message}}", message);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return response.text.trim();
  } catch (error) {
    console.error("LLM Error (Recommendation):", error);
    return "I can suggest general lifestyle tips aligned with your goals 😊";
  }
}