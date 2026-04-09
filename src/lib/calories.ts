/**
 * Metabolic Equivalent of Task (MET) values for different activities
 */
export const MET_VALUES: Record<string, number> = {
  walk: 3.5,
  run: 8.0,
  bike: 7.5,
  default: 3.0,
};

/**
 * Calculates estimated calorie burn
 *
 * @param type Activity type (walk, run, bike)
 * @param durationSeconds Duration of activity in seconds
 * @param weightKg User weight in kg (default 70kg if not specified)
 * @returns Estimated calories burned
 */
export function calculateCalories(
  type: string,
  durationSeconds: number,
  weightKg: number = 70
): number {
  const met = MET_VALUES[type.toLowerCase()] || MET_VALUES.default;
  const durationHours = durationSeconds / 3600;
  
  // Formula: Calories = MET * Weight(kg) * Time(hours)
  const calories = met * weightKg * durationHours;
  
  return Math.round(calories);
}
