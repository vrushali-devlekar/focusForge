import { db } from "@/lib/db";
import { addDays } from "@/lib/day";

/**
 * Calculates and updates the active streak count for a user for a given day.
 *
 * Rules:
 * - If today's total focus time meets or exceeds targetSeconds:
 *   - Check yesterday's DailyStat.
 *   - If yesterday's goal was met (yesterday.totalSeconds >= yesterday.targetSeconds and yesterday.streakCount > 0),
 *     today's streak is incremented: yesterday.streakCount + 1.
 *   - If yesterday was missed or did not meet the target, streak resets to 1.
 * - If today's goal is not yet met:
 *   - Streak count remains 0 for today.
 */
export async function calculateAndUpdateStreak(
  userId: string,
  todayDate: Date,
  totalSecondsToday: number,
  targetSecondsToday: number
): Promise<number> {
  const isGoalMetToday = totalSecondsToday >= targetSecondsToday;

  if (!isGoalMetToday) {
    // Goal not met yet today -> streak for today is 0
    await db.dailyStat.update({
      where: {
        userId_date: {
          userId,
          date: todayDate,
        },
      },
      data: {
        streakCount: 0,
      },
    });
    return 0;
  }

  // Goal met today! Check yesterday's performance
  const yesterdayDate = addDays(todayDate, -1);
  const yesterdayStat = await db.dailyStat.findUnique({
    where: {
      userId_date: {
        userId,
        date: yesterdayDate,
      },
    },
  });

  let calculatedStreak = 1;

  if (
    yesterdayStat &&
    yesterdayStat.totalSeconds >= yesterdayStat.targetSeconds &&
    yesterdayStat.streakCount > 0
  ) {
    calculatedStreak = yesterdayStat.streakCount + 1;
  }

  await db.dailyStat.update({
    where: {
      userId_date: {
        userId,
        date: todayDate,
      },
    },
    data: {
      streakCount: calculatedStreak,
    },
  });

  return calculatedStreak;
}
