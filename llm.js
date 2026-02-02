import dotenv from "dotenv";
dotenv.config();

import { log } from "./utils.js";
import { GoogleGenAI } from "@google/genai";
import {
  INTENT_SYSTEM_PROMPT,
  EXPLANATION_USER_PROMPT,
  RECOMMENDATION_PROMPT 
} from "./prompts.js";

log("Initializing Gemini client");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

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
  log("Intent classification started");

  try {
    log("Preparing intent prompt");

    const prompt = INTENT_SYSTEM_PROMPT.replace("{{message}}", message);

    log("Calling Gemini for intent classification");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    const text = response.text.trim().toLowerCase();
    log(`Raw intent received: ${text}`);

    const validIntents = [
      "sleep_summary",
      "steps_summary",
      "heart_rate_summary",
      "nutrition_summary",
      "recommendation",
      "fallback"
    ];

    const finalIntent = validIntents.includes(text) ? text : "fallback";
    log(`Final intent resolved: ${finalIntent}`);

    return {
      intent: finalIntent,
      llmUnavailable: false
    };

  } catch (error) {
    log(`Intent LLM error: ${error?.message || error}`);

    if (isLLMOverloaded(error)) {
      log("Intent LLM unavailable (quota or overload)");
      return { intent: "fallback", llmUnavailable: true };
    }

    log("Intent fallback used");
    return { intent: "fallback", llmUnavailable: false };
  }
}


// ---- EXPLANATION GENERATION ----
export async function generateExplanation(userName, summaryData) {
  log(`Explanation generation started for user: ${userName}`);

  try {
    const summaryLines = [];

    if (summaryData.actual) summaryLines.push(`Actual: ${summaryData.actual}`);
    if (summaryData.target) summaryLines.push(`Target: ${summaryData.target}`);
    if (summaryData.age) summaryLines.push(`User age: ${summaryData.age}`);
    if (summaryData.status) summaryLines.push(`Status: ${summaryData.status}`);

    log("Explanation summary prepared");

    const summaryString = summaryLines.join("\n");

    const prompt = EXPLANATION_USER_PROMPT
      .replace("{{name}}", userName)
      .replace("{{summary}}", summaryString);

    log("Calling Gemini for explanation");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    log("Explanation generated successfully");

    return response.text.trim();

  } catch (error) {
    log(`Explanation LLM error: ${error?.message || error}`);

    if (isLLMOverloaded(error)) {
      log("Explanation LLM unavailable (quota or overload)");
      return "⚠️ The health agent is currently overloaded and temporarily unavailable.\nPlease try again in a few minutes.";
    }

    log("Explanation fallback used");
    return `Here is your summary:\nActual: ${summaryData.actual}\nTarget: ${summaryData.target}`;
  }
}


// ---- RECOMMENDATION GENERATION ----
export async function generateRecommendation(user, message) {
  log(`Recommendation generation started for user: ${user.profile.name}`);

  try {
    log("Preparing recommendation prompt");

    const prompt = RECOMMENDATION_PROMPT
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

    log("Calling Gemini for recommendation");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    log("Recommendation generated successfully");

    return response.text.trim();

  } catch (error) {
    log(`Recommendation LLM error: ${error?.message || error}`);

    if (isLLMOverloaded(error)) {
      log("Recommendation LLM unavailable (quota or overload)");
      return "⚠️ The health agent is currently unavailable due to high demand.\nPlease try again in a few minutes.";
    }

    log("Recommendation fallback used");
    return "I can suggest general lifestyle tips aligned with your goals 😊";
  }
}
