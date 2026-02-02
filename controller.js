import { log } from "./utils.js";

export function getSleepSummary(user, dailyData) {
  log("Sleep summary calculation started");

  const actual = dailyData.sleep.durationHours;
  const target = user.goals.sleepHours;
  const status = actual >= target ? "met" : "below";

  log(`Sleep actual: ${actual}h, target: ${target}h, status: ${status}`);

  return {
    actual: actual + " hours",
    target: target + " hours",
    status
  };
}

export function getStepsSummary(user, dailyData) {
  log("Steps summary calculation started");

  const actual = dailyData.activity.steps;
  const target = user.goals.stepsPerDay;
  const status = actual >= target ? "met" : "below";

  log(`Steps actual: ${actual}, target: ${target}, status: ${status}`);

  return {
    actual: actual + " steps",
    target: target + " steps",
    status
  };
}

export function getHeartRateSummary(dailyData) {
  log("Heart rate summary calculation started");

  const actual = dailyData.heart.avgHeartRate;

  log(`Heart rate actual: ${actual} bpm`);

  return {
    actual: actual + " bpm",
    target: "N/A",
    status: "informational"
  };
}

export function getNutritionSummary(user, dailyData) {
  log("Nutrition summary calculation started");

  const actual = dailyData.nutrition;
  const target = user.goals.diet;

  const status =
    actual.caloriesConsumed <= target.calories ? "met" : "exceeded";

  log(
    `Nutrition actual: calories=${actual.caloriesConsumed}, protein=${actual.protein}g`
  );
  log(
    `Nutrition target: calories=${target.calories}, protein=${target.protein}g`
  );
  log(`Nutrition status: ${status}`);

  return {
    actual: `Calories: ${actual.caloriesConsumed}, Protein: ${actual.protein}g`,
    target: `Calories: ${target.calories}, Protein: ${target.protein}g`,
    status
  };
}
