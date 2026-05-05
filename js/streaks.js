import {
  ACHIEVEMENT_IDS,
  DEFAULT_STREAK_ID,
  DEFAULT_STREAK_NAME,
  EXPORT_VERSION,
  MAX_STREAK_NAME_LENGTH,
} from "./constants.js";
import { deriveAchievementsFromCompletedDates } from "./achievements.js";
import { isDateKey } from "./date-utils.js";

export function normalizeStreakState(value) {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new Error("Invalid streak state");
  }

  const streaks = Array.isArray(value.streaks)
    ? value.streaks.map(normalizeStreak).filter(Boolean)
    : [];

  if (streaks.length === 0) {
    streaks.push(createEmptyStreak(DEFAULT_STREAK_NAME, DEFAULT_STREAK_ID));
  }

  const activeStreakId = streaks.some((streak) => streak.id === value.activeStreakId)
    ? value.activeStreakId
    : streaks[0].id;

  return {
    version: EXPORT_VERSION,
    activeStreakId,
    streaks,
  };
}

export function normalizeStreak(value, index) {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return null;
  }

  const id =
    typeof value.id === "string" && value.id.trim()
      ? value.id.trim().slice(0, 80)
      : createStreakId();
  const name = normalizeStreakName(value.name) || `${DEFAULT_STREAK_NAME} ${index + 1}`;
  const completedDates = Array.isArray(value.completedDates)
    ? normalizeDateArray(value.completedDates)
    : [];
  const completedDateSet = new Set(completedDates);
  const dismissedCatchUpDates = Array.isArray(value.dismissedCatchUpDates)
    ? normalizeDateArray(value.dismissedCatchUpDates).filter(
        (dateKey) => !completedDateSet.has(dateKey),
      )
    : [];
  const notesByDate = isRecordObject(value.notesByDate)
    ? normalizeNotesByDate(value.notesByDate)
    : {};
  const storedAchievements = isRecordObject(value.unlockedAchievements)
    ? normalizeUnlockedAchievements(value.unlockedAchievements)
    : {};

  return {
    id,
    name,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : new Date().toISOString(),
    completedDates,
    dismissedCatchUpDates,
    notesByDate,
    unlockedAchievements: {
      ...deriveAchievementsFromCompletedDates(completedDates),
      ...storedAchievements,
    },
  };
}

export function createEmptyStreak(name = DEFAULT_STREAK_NAME, id = createStreakId()) {
  return {
    id,
    name: normalizeStreakName(name) || DEFAULT_STREAK_NAME,
    createdAt: new Date().toISOString(),
    completedDates: [],
    dismissedCatchUpDates: [],
    notesByDate: {},
    unlockedAchievements: {},
  };
}

export function normalizeStreakName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, MAX_STREAK_NAME_LENGTH);
}

export function createStreakId() {
  if (window.crypto?.randomUUID) {
    return `streak-${window.crypto.randomUUID()}`;
  }

  return `streak-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeDateArray(value) {
  if (!Array.isArray(value)) {
    throw new Error("Invalid dates");
  }

  return [...new Set(value.filter(isDateKey))].sort();
}

export function normalizeNotesByDate(value) {
  if (!isRecordObject(value)) {
    throw new Error("Invalid notes");
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([dateKey, note]) => isDateKey(dateKey) && typeof note === "string")
      .map(([dateKey, note]) => [dateKey, note.trim().slice(0, 220)])
      .filter(([, note]) => note),
  );
}

export function normalizeUnlockedAchievements(value) {
  if (!isRecordObject(value)) {
    throw new Error("Invalid achievements");
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      ([achievementId, unlockedDateKey]) =>
        ACHIEVEMENT_IDS.has(achievementId) && isDateKey(unlockedDateKey),
    ),
  );
}

export function isRecordObject(value) {
  return Boolean(value) && !Array.isArray(value) && typeof value === "object";
}
