
import { classifyIntent, generateExplanation ,generateRecommendation } from "./llm.js";
import { getSleepSummary, getStepsSummary, getHeartRateSummary, getNutritionSummary } from "./controller.js";
import { users, dailyHealthData } from "./data.js";

export async function handleMessage(fromNumber, messageBody) {

  let user = users[fromNumber];
  let dailyData = dailyHealthData[fromNumber];

  if (!user) {
      // Create user with dummy data if not exists (per constraints)
      user = users["whatsapp:+919821063740"]; // Fallback to dummy
      dailyData = dailyHealthData["whatsapp:+919821063740"];
  }

  // 2. Classify Intent
  const intent = await classifyIntent(messageBody);

  // 3. Backend Logic & 4. Explanation
  let responseText = "";

  if (intent === "sleep_summary") {
      const summary = getSleepSummary(user, dailyData);
      responseText = await generateExplanation(user.profile.name, summary);
  } else if (intent === "steps_summary") {
      const summary = getStepsSummary(user, dailyData);
      responseText = await generateExplanation(user.profile.name, summary);
  } else if (intent === "heart_rate_summary") {
      const summary = getHeartRateSummary(dailyData);
      responseText = await generateExplanation(user.profile.name, summary);
  } else if (intent === "nutrition_summary") {
      const summary = getNutritionSummary(user, dailyData);
      responseText = await generateExplanation(user.profile.name, summary);
  } else if (intent === "recommendation") {
    responseText = await generateRecommendation(user, messageBody);
  }
  else {
      // Fallback
      responseText = "I can currently help with sleep, steps, heart rate, and nutrition summaries 😊";
  }

  return responseText;
}
