import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";
import {
  INTENT_SYSTEM_PROMPT,
  EXPLANATION_USER_PROMPT, RECOMMENDATION_PROMPT 
} from "./prompts.js";

console.log(process.env.GEMINI_API_KEY);
// Gemini client (API key is auto-read from GEMINI_API_KEY)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY });


function isLLMOverloaded(error) {
  const msg = error?.message?.toLowerCase() || "";
  return (
    msg.includes("overloaded") ||
    msg.includes("unavailable") ||
    msg.includes("503") ||
    msg.includes("quota") ||
    msg.includes("429")
  );
}

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

    return {
      intent: validIntents.includes(text) ? text : "fallback",
      llmUnavailable: false
    };

  } catch (error) {
    console.error("LLM Error (Intent):", error?.message || error);

    if (isLLMOverloaded(error)) {
      return {
        intent: "fallback",
        llmUnavailable: true
      };
    }

    return {
      intent: "fallback",
      llmUnavailable: false
    };
  }
}


// ---- EXPLANATION GENERATION ----
export async function generateExplanation(userName, summaryData) {
  try {
    const summaryLines = [];

    if (summaryData.actual) {
      summaryLines.push(`Actual: ${summaryData.actual}`);
    }

    if (summaryData.target) {
      summaryLines.push(`Target: ${summaryData.target}`);
    }

    if (summaryData.age) {
      summaryLines.push(`User age: ${summaryData.age}`);
    }

    if (summaryData.status) {
      summaryLines.push(`Status: ${summaryData.status}`);
    }

    const summaryString = summaryLines.join("\n");


    let prompt = EXPLANATION_USER_PROMPT
      .replace("{{name}}", userName)
      .replace("{{summary}}", summaryString);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return response.text.trim();
  } catch (error) {
    console.error("LLM Error (Explanation):", error?.message || error);
    if (isLLMOverloaded(error)) {
      return "⚠️ The health agent is currently overloaded and temporarily unavailable.\nPlease try again in a few minutes.";
    }

    return `Here is your summary:\nActual: ${summaryData.actual}\nTarget: ${summaryData.target}`;
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
    if (isLLMOverloaded(error)) {
      return "⚠️ The health agent is currently unavailable due to high demand.\nPlease try again in a few minutes.";
    }

    return "I can suggest general lifestyle tips aligned with your goals 😊";
  }
}