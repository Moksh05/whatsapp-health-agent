
export function getSleepSummary(user, dailyData) {
  const actual = dailyData.sleep.durationHours;
  const target = user.goals.sleepHours;
  const status = actual >= target ? "met" : "below";
  return { actual: actual + " hours", target: target + " hours", status };
}

export function getStepsSummary(user, dailyData) {
  const actual = dailyData.activity.steps;
  const target = user.goals.stepsPerDay;
  const status = actual >= target ? "met" : "below";
  return { actual: actual + " steps", target: target + " steps", status };
}

export function getHeartRateSummary(dailyData) {
    // Heart rate is informational only, no target comparison in requirements, but we can just show avg
    const actual = dailyData.heart.avgHeartRate;
    return { actual: actual + " bpm", target: "N/A", status: "informational" };
}

export function getNutritionSummary(user, dailyData) {
    const actual = dailyData.nutrition;
    const target = user.goals.diet;
    
    // Simple comparison based on calories for status, or just return data
    // Requirement says "Compare nutrition intake vs diet goals"
    // Let's create a summary string or object
    const status = actual.caloriesConsumed <= target.calories ? "met" : "exceeded"; // simplifying logic
    
    return {
        actual: `Calories: ${actual.caloriesConsumed}, Protein: ${actual.protein}g`,
        target: `Calories: ${target.calories}, Protein: ${target.protein}g`,
        status
    };
}
