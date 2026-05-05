import { ACHIEVEMENTS, ACHIEVEMENT_ORDER } from "./constants.js";
import {
  addDays,
  daysBetween,
  formatDaysLabel,
  parseDateKey,
  stripTime,
  toDateKey,
} from "./date-utils.js";

export function getStats(completedDates, today) {
  const uniqueDates = [...new Set(completedDates)].sort();
  const completedSet = new Set(uniqueDates);
  let bestStreak = 0;
  let runningStreak = 0;
  let previousDate = null;

  uniqueDates.forEach((dateKey) => {
    const currentDate = parseDateKey(dateKey);

    if (previousDate && daysBetween(previousDate, currentDate) === 1) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    bestStreak = Math.max(bestStreak, runningStreak);
    previousDate = currentDate;
  });

  let currentStreak = 0;
  let cursor = stripTime(today);

  while (completedSet.has(toDateKey(cursor))) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  return {
    currentStreak,
    bestStreak,
    totalCompleted: uniqueDates.length,
    perfectMonths: getPerfectMonthEndDates(uniqueDates).length,
    completedWeekends: getCompletedWeekendEndDates(uniqueDates).length,
  };
}

export function getUnlockedAchievements(activeStreak) {
  return ACHIEVEMENTS.filter((achievement) => activeStreak.unlockedAchievements[achievement.id]).map(
    (achievement) => ({
      achievement,
      unlockedDateKey: activeStreak.unlockedAchievements[achievement.id],
    }),
  );
}

export function getAvailableAchievements(activeStreak, stats) {
  return ACHIEVEMENTS.filter((achievement) => !activeStreak.unlockedAchievements[achievement.id]).sort(
    (firstAchievement, secondAchievement) =>
      compareAchievementProgress(firstAchievement, secondAchievement, stats, activeStreak),
  );
}

export function compareAchievementProgress(firstAchievement, secondAchievement, stats, activeStreak) {
  const firstProgress = getAchievementProgress(firstAchievement, stats, activeStreak);
  const secondProgress = getAchievementProgress(secondAchievement, stats, activeStreak);
  const ratioDifference = secondProgress.ratio - firstProgress.ratio;

  if (ratioDifference !== 0) {
    return ratioDifference;
  }

  return ACHIEVEMENT_ORDER.get(firstAchievement.id) - ACHIEVEMENT_ORDER.get(secondAchievement.id);
}

export function deriveAchievementsFromCompletedDates(completedDates) {
  const uniqueDates = [...new Set(completedDates)].sort();
  const unlockedAchievements = {};
  let runningStreak = 0;
  let previousDate = null;

  uniqueDates.forEach((dateKey, index) => {
    const currentDate = parseDateKey(dateKey);

    if (previousDate && daysBetween(previousDate, currentDate) === 1) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    ACHIEVEMENTS.forEach((achievement) => {
      if (
        achievement.type === "streak" &&
        runningStreak >= achievement.target &&
        !unlockedAchievements[achievement.id]
      ) {
        const unlockDate = addDays(currentDate, -(runningStreak - achievement.target));
        unlockedAchievements[achievement.id] = toDateKey(unlockDate);
      }

      if (
        achievement.type === "total" &&
        index + 1 >= achievement.target &&
        !unlockedAchievements[achievement.id]
      ) {
        unlockedAchievements[achievement.id] = dateKey;
      }
    });

    previousDate = currentDate;
  });

  const perfectMonthEndDates = getPerfectMonthEndDates(uniqueDates);
  const completedWeekendEndDates = getCompletedWeekendEndDates(uniqueDates);

  ACHIEVEMENTS.forEach((achievement) => {
    if (
      achievement.type === "perfect-month" &&
      perfectMonthEndDates.length >= achievement.target
    ) {
      unlockedAchievements[achievement.id] = perfectMonthEndDates[achievement.target - 1];
    }

    if (achievement.type === "weekend" && completedWeekendEndDates.length >= achievement.target) {
      unlockedAchievements[achievement.id] = completedWeekendEndDates[achievement.target - 1];
    }
  });

  return unlockedAchievements;
}

export function getAchievementProgress(achievement, stats, activeStreak) {
  let current = 0;
  
  switch (achievement.type) {
    case "streak":
      current = stats.currentStreak;
      break;
    case "total":
      current = stats.totalCompleted;
      break;
    case "perfect-month":
      current = stats.perfectMonths;
      break;
    case "weekend":
      current = stats.completedWeekends;
      break;
    case "recovery":
      if (activeStreak.unlockedAchievements[achievement.id]) {
        current = 1;
      }
      break;
    default:
      break;
  }

  return {
    current,
    target: achievement.target,
    missing: Math.max(achievement.target - current, 0),
    ratio: Math.min(current / achievement.target, 1),
  };
}

export function getAchievementProgressText(achievement, stats, activeStreak) {
  if (achievement.type === "recovery") {
    return "Recupera un día pasado para desbloquearlo";
  }

  const progress = getAchievementProgress(achievement, stats, activeStreak);

  if (progress.missing === 0) {
    return "Listo para desbloquear";
  }

  return `Faltan ${formatAchievementUnit(achievement, progress.missing)}`;
}

export function getAchievementGoalLabel(achievement) {
  let label;
  
  switch (achievement.type) {
    case "streak":
      label = `logro de ${formatDaysLabel(achievement.target)} de racha`;
      break;
    case "total":
      label = `logro de ${formatDaysLabel(achievement.target)} completados`;
      break;
    case "perfect-month":
      label = "logro de mes perfecto";
      break;
    case "weekend":
      label = `logro de ${formatWeekendLabel(achievement.target)}`;
      break;
    default:
      label = "logro de recuperación";
      break;
  }
  return label;
}

export function getAchievementBadge(achievement) {
  if (achievement.type === "streak") {
    return formatDaysLabel(achievement.target);
  }

  if (achievement.type === "total") {
    return `${achievement.target} total`;
  }

  if (achievement.type === "perfect-month") {
    return "Mes perfecto";
  }

  if (achievement.type === "weekend") {
    return formatWeekendShortLabel(achievement.target);
  }

  return "Recuperación";
}

export function formatAchievementUnit(achievement, amount) {
  if (achievement.type === "perfect-month") {
    return `${amount} ${amount === 1 ? "mes perfecto" : "meses perfectos"}`;
  }

  if (achievement.type === "weekend") {
    return formatWeekendLabel(amount);
  }

  return formatDaysLabel(amount);
}

export function formatWeekendLabel(amount) {
  return `${amount} ${amount === 1 ? "fin de semana" : "fines de semana"}`;
}

export function formatWeekendShortLabel(amount) {
  return amount === 1 ? "1 finde" : `${amount} findes`;
}

export function getAchievementTier(achievement) {
  if (achievement.type === "recovery") return "bronze";
  if (achievement.type === "perfect-month") return "gold";

  if (achievement.type === "weekend") {
    if (achievement.target <= 1) return "bronze";
    if (achievement.target <= 4) return "silver";
    return "gold";
  }

  if (achievement.target <= 30) return "bronze";
  if (achievement.target <= 100) return "silver";
  if (achievement.target <= 200) return "gold";
  return "platinum";
}

export function getAchievementModalMessage(achievement) {
  if (achievement.type === "streak") {
    return `Cumpliste ${formatDaysLabel(achievement.target)} de racha.`;
  }

  if (achievement.type === "total") {
    return `Acumulaste ${formatDaysLabel(achievement.target)} completados.`;
  }

  if (achievement.type === "perfect-month") {
    return "Completaste todos los días de un mes.";
  }

  if (achievement.type === "weekend") {
    return `Completaste ${formatWeekendLabel(achievement.target)}.`;
  }

  return "Recuperaste un día pasado.";
}

export function getCompletedWeekendEndDates(completedDates) {
  const completedSet = new Set(completedDates);

  return completedDates
    .filter((dateKey) => parseDateKey(dateKey).getDay() === 6)
    .map((dateKey) => toDateKey(addDays(parseDateKey(dateKey), 1)))
    .filter((sundayKey) => completedSet.has(sundayKey))
    .sort();
}

export function getPerfectMonthEndDates(completedDates) {
  const completedSet = new Set(completedDates);
  const monthKeys = [...new Set(completedDates.map((dateKey) => dateKey.slice(0, 7)))].sort();

  return monthKeys
    .filter((monthKey) => {
      const [year, month] = monthKey.split("-").map(Number);
      const totalDays = new Date(year, month, 0).getDate();

      for (let day = 1; day <= totalDays; day += 1) {
        const dateKey = `${monthKey}-${String(day).padStart(2, "0")}`;

        if (!completedSet.has(dateKey)) {
          return false;
        }
      }

      return true;
    })
    .map((monthKey) => {
      const [year, month] = monthKey.split("-").map(Number);
      const totalDays = new Date(year, month, 0).getDate();
      return `${monthKey}-${String(totalDays).padStart(2, "0")}`;
    });
}
