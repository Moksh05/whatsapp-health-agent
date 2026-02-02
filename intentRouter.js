import { classifyIntent, generateExplanation, generateRecommendation } from "./llm.js";
import {
  getSleepSummary,
  getStepsSummary,
  getHeartRateSummary,
  getNutritionSummary
} from "./controller.js";
import { users, dailyHealthData } from "./data.js";
import { log } from "./utils.js";

export async function handleMessage(fromNumber, messageBody) {
  log(`Incoming message from ${fromNumber}`);
  log(`Message content: ${messageBody}`);

  let user = users[fromNumber];
  let dailyData = dailyHealthData[fromNumber];

  if (!user) {
    log("User not found, using fallback dummy user");
    user = users["whatsapp:+919821063740"];
    dailyData = dailyHealthData["whatsapp:+919821063740"];
  } else {
    log(`User found: ${user.profile.name}`);
  }

  // 2. Classify Intent
  log("Starting intent classification");

  const { intent, llmUnavailable } = await classifyIntent(messageBody);

  log(`Intent result: ${intent}`);

  if (llmUnavailable) {
    log("LLM unavailable during intent classification");
    return "⚠️ The health agent is currently overloaded and temporarily unavailable.\nPlease try again in a few minutes.";
  }

  // 3. Backend Logic & 4. Explanation
  let responseText = "";

  if (intent === "sleep_summary") {
    log("Handling sleep summary");
    const summary = getSleepSummary(user, dailyData);
    responseText = await generateExplanation(user.profile.name, summary);

  } else if (intent === "steps_summary") {
    log("Handling steps summary");
    const summary = getStepsSummary(user, dailyData);
    responseText = await generateExplanation(user.profile.name, summary);

  } else if (intent === "heart_rate_summary") {
    log("Handling heart rate summary");
    const summary = getHeartRateSummary(dailyData);
    responseText = await generateExplanation(user.profile.name, summary);

  } else if (intent === "nutrition_summary") {
    log("Handling nutrition summary");
    const summary = getNutritionSummary(user, dailyData);
    responseText = await generateExplanation(user.profile.name, summary);

  } else if (intent === "recommendation") {
    log("Handling recommendation request");
    responseText = await generateRecommendation(user, messageBody);

  } else {
    log("Fallback intent triggered");
    responseText =
      "I can currently help with sleep, steps, heart rate, and nutrition summaries 😊";
  }

  log("Response prepared and sent to user");

  return responseText;
}
