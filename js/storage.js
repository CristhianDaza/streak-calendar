import {
  ACHIEVEMENT_STORAGE_KEY,
  DEFAULT_STREAK_ID,
  DEFAULT_STREAK_NAME,
  DEFAULT_THEME,
  EXPORT_VERSION,
  NOTES_STORAGE_KEY,
  STORAGE_KEY,
  STREAKS_STORAGE_KEY,
  THEME_IDS,
  THEME_STORAGE_KEY,
} from "./constants.js";
import { deriveAchievementsFromCompletedDates } from "./achievements.js";
import {
  normalizeDateArray,
  isRecordObject,
  normalizeNotesByDate,
  normalizeStreak,
  normalizeStreakState,
  normalizeUnlockedAchievements,
} from "./streaks.js";
import { isDateKey } from "./date-utils.js";

export function loadSelectedTheme() {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return THEME_IDS.has(storedTheme) ? storedTheme : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function saveSelectedTheme(themeId) {
  localStorage.setItem(THEME_STORAGE_KEY, themeId);
}

export function loadStreakState() {
  try {
    const storedValue = localStorage.getItem(STREAKS_STORAGE_KEY);

    if (storedValue) {
      const parsedValue = JSON.parse(storedValue);
      const streakState = normalizeStreakState(parsedValue);
      saveStreakStateData(streakState);
      return streakState;
    }
  } catch (error) {
    console.warn("No se pudo cargar el estado de rachas guardado. Se intentará migrar desde datos v1.", error);
  }

  const migratedState = createMigratedStreakState();
  saveStreakStateData(migratedState);
  return migratedState;
}

export function saveStreakStateData(streakState) {
  localStorage.setItem(
    STREAKS_STORAGE_KEY,
    JSON.stringify({
      version: EXPORT_VERSION,
      activeStreakId: streakState.activeStreakId,
      streaks: streakState.streaks,
    }),
  );
}

export function createBackup(streakState) {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    activeStreakId: streakState.activeStreakId,
    streaks: streakState.streaks,
  };
}

export function normalizeBackupData(value) {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new Error("Invalid backup");
  }

  if (typeof value.version !== "number") {
    throw new Error("Invalid backup version");
  }

  if (value.version >= 2 && Array.isArray(value.streaks)) {
    return normalizeStreakState(value);
  }

  const completedDates = normalizeDateArray(value.completedDates);
  const notesByDate = isRecordObject(value.notesByDate)
    ? normalizeNotesByDate(value.notesByDate)
    : {};
  const unlockedAchievements = isRecordObject(value.unlockedAchievements)
    ? normalizeUnlockedAchievements(value.unlockedAchievements)
    : {};

  return {
    version: EXPORT_VERSION,
    activeStreakId: DEFAULT_STREAK_ID,
    streaks: [
      normalizeStreak(
        {
          id: DEFAULT_STREAK_ID,
          name: DEFAULT_STREAK_NAME,
          createdAt: new Date().toISOString(),
          completedDates,
          notesByDate,
          unlockedAchievements,
        },
        0,
      ),
    ],
  };
}

function createMigratedStreakState() {
  const completedDates = loadCompletedDates();
  const storedAchievements = loadUnlockedAchievements();

  return {
    version: EXPORT_VERSION,
    activeStreakId: DEFAULT_STREAK_ID,
    streaks: [
      {
        id: DEFAULT_STREAK_ID,
        name: DEFAULT_STREAK_NAME,
        createdAt: new Date().toISOString(),
        completedDates,
        dismissedCatchUpDates: [],
        notesByDate: loadNotesByDate(),
        unlockedAchievements: {
          ...deriveAchievementsFromCompletedDates(completedDates),
          ...storedAchievements,
        },
      },
    ],
  };
}

function loadCompletedDates() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return [...new Set(parsedValue.filter(isDateKey))].sort();
  } catch {
    return [];
  }
}

function loadNotesByDate() {
  try {
    const storedValue = localStorage.getItem(NOTES_STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : {};

    if (!isRecordObject(parsedValue)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedValue)
        .filter(([dateKey, note]) => isDateKey(dateKey) && typeof note === "string")
        .map(([dateKey, note]) => [dateKey, note.trim()])
        .filter(([, note]) => note),
    );
  } catch {
    return {};
  }
}

function loadUnlockedAchievements() {
  try {
    const storedValue = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : {};

    if (!isRecordObject(parsedValue)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedValue).filter(
        ([achievementId, unlockedDateKey]) =>
          normalizeUnlockedAchievements({ [achievementId]: unlockedDateKey })[achievementId],
      ),
    );
  } catch {
    return {};
  }
}
