import {
  ACHIEVEMENTS,
  ACHIEVEMENT_IDS,
  DEFAULT_STREAK_ID,
  DEFAULT_STREAK_NAME,
  EXPORT_VERSION,
  THEME_IDS,
} from "./constants.js";
import { showModal, hideModal } from "./dom-utils.js";
import {
  addDays,
  capitalize,
  longDateFormatter,
  parseDateKey,
  startOfMonth,
  toDateKey,
} from "./date-utils.js";
import {
  deriveAchievementsFromCompletedDates,
  getActiveAchievementDates,
} from "./achievements.js";
import { createEmptyStreak, normalizeStreakName } from "./streaks.js";
import {
  createBackup,
  loadSelectedTheme,
  loadStreakState,
  normalizeBackupData,
  saveSelectedTheme,
  saveStreakStateData,
} from "./storage.js";
import {
  applyTheme,
  getSelectedCatchUpDates,
  hideAchievementModal,
  render,
  showDataStatus,
  showUnlockedAchievements,
} from "./ui.js";

let state;
let elements;

export function startApp() {
  const initialStreakState = loadStreakState();

  state = {
    streaks: initialStreakState.streaks,
    activeStreakId: initialStreakState.activeStreakId,
    selectedTheme: loadSelectedTheme(),
    visibleDate: startOfMonth(new Date()),
    selectedDateKey: null,
    editingStreakId: null,
    deferredInstallPrompt: null,
    achievementModalSequence: 0,
  };
  elements = getElements();

  bindEvents();
  applyTheme(state.selectedTheme, elements);
  refreshActiveStreakAchievements();
  renderApp();
  registerServiceWorker();
}

function getElements() {
  return {
    themeOptions: document.querySelectorAll("[data-theme-option]"),
    streaksList: document.querySelector("#streaksList"),
    newStreakButton: document.querySelector("#newStreakButton"),
    streakEditorModal: document.querySelector("#streakEditorModal"),
    streakEditorForm: document.querySelector("#streakEditorForm"),
    streakEditorTitle: document.querySelector("#streakEditorTitle"),
    streakEditorName: document.querySelector("#streakEditorName"),
    closeStreakEditorButton: document.querySelector("#closeStreakEditorButton"),
    cancelStreakEditorButton: document.querySelector("#cancelStreakEditorButton"),
    todayLabel: document.querySelector("#todayLabel"),
    todayStatus: document.querySelector("#todayStatus"),
    toggleTodayButton: document.querySelector("#toggleTodayButton"),
    currentStreak: document.querySelector("#currentStreak"),
    bestStreak: document.querySelector("#bestStreak"),
    totalCompleted: document.querySelector("#totalCompleted"),
    monthCompleted: document.querySelector("#monthCompleted"),
    catchUpSection: document.querySelector("#catchUpSection"),
    catchUpText: document.querySelector("#catchUpText"),
    catchUpList: document.querySelector("#catchUpList"),
    dismissCatchUpButton: document.querySelector("#dismissCatchUpButton"),
    saveCatchUpButton: document.querySelector("#saveCatchUpButton"),
    achievementsUnlockedCount: document.querySelector("#achievementsUnlockedCount"),
    nextAchievementName: document.querySelector("#nextAchievementName"),
    nextAchievementProgress: document.querySelector("#nextAchievementProgress"),
    nextAchievementProgressBar: document.querySelector("#nextAchievementProgressBar"),
    nextAchievementProgressValue: document.querySelector("#nextAchievementProgressValue"),
    achievementsPreviewList: document.querySelector("#achievementsPreviewList"),
    openAchievementsModalButton: document.querySelector("#openAchievementsModalButton"),
    achievementsModal: document.querySelector("#achievementsModal"),
    closeAchievementsModalButton: document.querySelector("#closeAchievementsModalButton"),
    achievementsList: document.querySelector("#achievementsList"),
    achievementsEmpty: document.querySelector("#achievementsEmpty"),
    availableAchievementsList: document.querySelector("#availableAchievementsList"),
    availableAchievementsEmpty: document.querySelector("#availableAchievementsEmpty"),
    achievementHistorySection: document.querySelector("#achievementHistorySection"),
    achievementHistoryList: document.querySelector("#achievementHistoryList"),
    achievementHistoryEmpty: document.querySelector("#achievementHistoryEmpty"),
    achievementModalStack: document.querySelector("#achievementModalStack"),
    calendarTitle: document.querySelector("#calendarTitle"),
    calendarGrid: document.querySelector("#calendarGrid"),
    prevMonthButton: document.querySelector("#prevMonthButton"),
    nextMonthButton: document.querySelector("#nextMonthButton"),
    todayMonthButton: document.querySelector("#todayMonthButton"),
    dayEditorModal: document.querySelector("#dayEditorModal"),
    dayEditorTitle: document.querySelector("#dayEditorTitle"),
    dayEditorCompleted: document.querySelector("#dayEditorCompleted"),
    dayEditorNote: document.querySelector("#dayEditorNote"),
    closeDayEditorButton: document.querySelector("#closeDayEditorButton"),
    cancelDayEditorButton: document.querySelector("#cancelDayEditorButton"),
    saveDayEditorButton: document.querySelector("#saveDayEditorButton"),
    exportDataButton: document.querySelector("#exportDataButton"),
    importDataButton: document.querySelector("#importDataButton"),
    importDataInput: document.querySelector("#importDataInput"),
    installAppButton: document.querySelector("#installAppButton"),
    dataStatus: document.querySelector("#dataStatus"),
  };
}

function bindEvents() {
  elements.themeOptions.forEach((option) => {
    option.addEventListener("click", handleThemeOptionClick);
  });
  elements.streaksList.addEventListener("click", handleStreaksListClick);
  elements.newStreakButton.addEventListener("click", openNewStreakEditor);
  elements.streakEditorForm.addEventListener("submit", saveStreakEditor);
  elements.closeStreakEditorButton.addEventListener("click", hideStreakEditor);
  elements.cancelStreakEditorButton.addEventListener("click", hideStreakEditor);
  elements.streakEditorModal.addEventListener("click", handleStreakEditorModalClick);
  elements.toggleTodayButton.addEventListener("click", toggleToday);
  elements.prevMonthButton.addEventListener("click", () => changeMonth(-1));
  elements.nextMonthButton.addEventListener("click", () => changeMonth(1));
  elements.todayMonthButton.addEventListener("click", showCurrentMonth);
  elements.catchUpList.addEventListener("change", updateCatchUpActionState);
  elements.dismissCatchUpButton.addEventListener("click", dismissCatchUp);
  elements.saveCatchUpButton.addEventListener("click", saveCatchUpDates);
  elements.openAchievementsModalButton.addEventListener("click", showAchievementsModal);
  elements.closeAchievementsModalButton.addEventListener("click", hideAchievementsModal);
  elements.achievementsModal.addEventListener("click", handleAchievementsModalClick);
  elements.closeDayEditorButton.addEventListener("click", hideDayEditor);
  elements.cancelDayEditorButton.addEventListener("click", hideDayEditor);
  elements.saveDayEditorButton.addEventListener("click", saveDayEditor);
  elements.dayEditorModal.addEventListener("click", handleDayEditorModalClick);
  elements.exportDataButton.addEventListener("click", exportData);
  elements.importDataButton.addEventListener("click", () => elements.importDataInput.click());
  elements.importDataInput.addEventListener("change", handleImportDataInputChange);
  elements.installAppButton.addEventListener("click", installApp);
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);
  document.addEventListener("keydown", handleDocumentKeydown);
}

function renderApp() {
  render({
    state,
    elements,
    getActiveStreak,
    getPendingCatchUpDates,
    openDayEditor,
  });
  updateCatchUpActionState();
}

function handleThemeOptionClick(event) {
  const selectedTheme = event.currentTarget.dataset.themeOption;

  if (!THEME_IDS.has(selectedTheme)) {
    return;
  }

  state.selectedTheme = selectedTheme;
  saveSelectedTheme(selectedTheme);
  applyTheme(selectedTheme, elements);
}

function handleStreaksListClick(event) {
  const actionButton = event.target.closest("[data-streak-action]");

  if (!actionButton) {
    return;
  }

  const streakId = actionButton.dataset.streakId;

  if (actionButton.dataset.streakAction === "select") {
    setActiveStreak(streakId);
    return;
  }

  if (actionButton.dataset.streakAction === "edit") {
    openEditStreakEditor(streakId);
  }
}

function openNewStreakEditor() {
  state.editingStreakId = null;
  elements.streakEditorTitle.textContent = "Nueva racha";
  elements.streakEditorName.value = "";
  showStreakEditor();
}

function openEditStreakEditor(streakId) {
  const streak = getStreakById(streakId);

  if (!streak) {
    return;
  }

  state.editingStreakId = streakId;
  elements.streakEditorTitle.textContent = "Renombrar racha";
  elements.streakEditorName.value = streak.name;
  showStreakEditor();
}

function showStreakEditor() {
  showModal({
    modal: elements.streakEditorModal,
    focusTarget: elements.streakEditorName,
    updateModalLock,
  });
}

function hideStreakEditor() {
  hideModal({
    modal: elements.streakEditorModal,
    updateModalLock,
    afterHide: () => {
      state.editingStreakId = null;
    },
  });
}

function handleStreakEditorModalClick(event) {
  if (event.target.matches("[data-close-streak-modal]")) {
    hideStreakEditor();
  }
}

function saveStreakEditor(event) {
  event.preventDefault();

  const name = normalizeStreakName(elements.streakEditorName.value);

  if (!name) {
    elements.streakEditorName.focus();
    return;
  }

  if (state.editingStreakId) {
    updateStreak(state.editingStreakId, { name });
  } else {
    const newStreak = createEmptyStreak(name);
    state.streaks = [...state.streaks, newStreak];
    state.activeStreakId = newStreak.id;
  }

  saveStreakState();
  hideStreakEditor();
  renderApp();
}

function toggleToday() {
  const activeStreak = getActiveStreak();
  const todayKey = toDateKey(new Date());
  const exists = activeStreak.completedDates.includes(todayKey);
  const previousAchievementIds = refreshActiveStreakAchievements();

  setCompletedDate(todayKey, !exists);
  commitActiveStreakChange(previousAchievementIds);
}

function openDayEditor(dateKey) {
  if (dateKey > toDateKey(new Date())) {
    return;
  }

  state.selectedDateKey = dateKey;
  const activeStreak = getActiveStreak();
  elements.dayEditorTitle.textContent = capitalize(
    longDateFormatter.format(parseDateKey(dateKey)),
  );
  elements.dayEditorCompleted.checked = activeStreak.completedDates.includes(dateKey);
  elements.dayEditorNote.value = activeStreak.notesByDate[dateKey] || "";

  showModal({
    modal: elements.dayEditorModal,
    focusTarget: elements.dayEditorCompleted,
    updateModalLock,
  });
}

function hideDayEditor() {
  hideModal({
    modal: elements.dayEditorModal,
    updateModalLock,
    afterHide: () => {
      state.selectedDateKey = null;
    },
  });
}

function handleDayEditorModalClick(event) {
  if (event.target.matches("[data-close-day-modal]")) {
    hideDayEditor();
  }
}

function saveDayEditor() {
  const dateKey = state.selectedDateKey;

  if (!dateKey || dateKey > toDateKey(new Date())) {
    return;
  }

  const activeStreak = getActiveStreak();
  const wasComplete = activeStreak.completedDates.includes(dateKey);
  const shouldComplete = elements.dayEditorCompleted.checked;
  const note = elements.dayEditorNote.value.trim();
  const previousAchievementIds = refreshActiveStreakAchievements();
  const extraAchievementIds = [];

  setCompletedDate(dateKey, shouldComplete);

  if (note) {
    updateActiveStreak({
      notesByDate: { ...getActiveStreak().notesByDate, [dateKey]: note },
    });
  } else {
    const notesByDate = { ...getActiveStreak().notesByDate };
    delete notesByDate[dateKey];
    updateActiveStreak({ notesByDate });
  }

  if (!wasComplete && shouldComplete && dateKey < toDateKey(new Date())) {
    extraAchievementIds.push("recovery-1");
  }

  const newlyUnlockedAchievements = syncUnlockedAchievementsFromCompletedDates(
    previousAchievementIds,
    extraAchievementIds,
  );

  saveStreakState();
  hideDayEditor();
  renderApp();
  showUnlockedAchievements(elements, state, newlyUnlockedAchievements);
}

function dismissCatchUp() {
  const pendingDates = getPendingCatchUpDates();

  if (pendingDates.length > 0) {
    const activeStreak = getActiveStreak();
    updateActiveStreak({
      dismissedCatchUpDates: [
        ...new Set([...activeStreak.dismissedCatchUpDates, ...pendingDates]),
      ].sort(),
    });
    saveStreakState();
  }

  renderApp();
}

function saveCatchUpDates() {
  const selectedDates = getSelectedCatchUpDates(elements);

  if (selectedDates.length === 0) {
    return;
  }

  const activeStreak = getActiveStreak();
  const previousAchievementIds = refreshActiveStreakAchievements();
  const selectedDatesSet = new Set(selectedDates);
  updateActiveStreak({
    completedDates: [...new Set([...activeStreak.completedDates, ...selectedDates])].sort(),
    dismissedCatchUpDates: activeStreak.dismissedCatchUpDates.filter(
      (dateKey) => !selectedDatesSet.has(dateKey),
    ),
  });

  commitActiveStreakChange(previousAchievementIds, ["recovery-1"]);
}

function updateCatchUpActionState() {
  elements.saveCatchUpButton.disabled = getSelectedCatchUpDates(elements).length === 0;
}

function changeMonth(offset) {
  state.visibleDate = startOfMonth(
    new Date(state.visibleDate.getFullYear(), state.visibleDate.getMonth() + offset, 1),
  );
  renderApp();
}

function showCurrentMonth() {
  state.visibleDate = startOfMonth(new Date());
  renderApp();
}

function setCompletedDate(dateKey, isComplete) {
  const activeStreak = getActiveStreak();
  const completedSet = new Set(activeStreak.completedDates);
  const dismissedSet = new Set(activeStreak.dismissedCatchUpDates);

  if (isComplete) {
    completedSet.add(dateKey);
    dismissedSet.delete(dateKey);
  } else {
    completedSet.delete(dateKey);
  }

  updateActiveStreak({
    completedDates: [...completedSet].sort(),
    dismissedCatchUpDates: [...dismissedSet].sort(),
  });
}

function commitActiveStreakChange(previousAchievementIds, extraAchievementIds = []) {
  const newlyUnlockedAchievements = syncUnlockedAchievementsFromCompletedDates(
    previousAchievementIds,
    extraAchievementIds,
  );

  saveStreakState();
  renderApp();
  showUnlockedAchievements(elements, state, newlyUnlockedAchievements);
}

function refreshActiveStreakAchievements() {
  const activeStreak = getActiveStreak();
  const retainedCycleAchievements = getCurrentCycleAchievements(activeStreak);
  const currentAchievementIds = Object.keys(activeStreak.unlockedAchievements);
  const hasLostActiveAchievements = currentAchievementIds.some(
    (achievementId) => !retainedCycleAchievements[achievementId],
  );

  if (!hasLostActiveAchievements) {
    return new Set(currentAchievementIds);
  }

  const nextUnlockedAchievements = getCurrentCycleAchievements(activeStreak, {
    retainManualAchievements: false,
  });

  updateActiveStreak({
    unlockedAchievements: nextUnlockedAchievements,
    achievementHistory: archiveUnlockedAchievements(activeStreak),
  });
  saveStreakState();
  return new Set(Object.keys(nextUnlockedAchievements));
}

function syncUnlockedAchievementsFromCompletedDates(
  previousAchievementIds,
  extraAchievementIds = [],
  unlockedDateKey = toDateKey(new Date()),
) {
  const activeStreak = getActiveStreak();
  const retainedCycleAchievements = getCurrentCycleAchievements(activeStreak);
  const lostActiveAchievements = Object.keys(activeStreak.unlockedAchievements).some(
    (achievementId) => !retainedCycleAchievements[achievementId],
  );
  const derivedAchievements = lostActiveAchievements
    ? getCurrentCycleAchievements(activeStreak, { retainManualAchievements: false })
    : retainedCycleAchievements;
  const extraAchievements = Object.fromEntries(
    extraAchievementIds
      .filter((achievementId) => ACHIEVEMENT_IDS.has(achievementId))
      .map((achievementId) => [achievementId, unlockedDateKey]),
  );
  const nextAchievements = {
    ...derivedAchievements,
    ...extraAchievements,
  };
  const achievementHistory = lostActiveAchievements
    ? archiveUnlockedAchievements(activeStreak)
    : activeStreak.achievementHistory;
  const mergedAchievements = Object.fromEntries(
    Object.entries(nextAchievements).map(([achievementId, dateKey]) => [
      achievementId,
      lostActiveAchievements
        ? dateKey
        : activeStreak.unlockedAchievements[achievementId] || dateKey,
    ]),
  );
  const newlyUnlockedAchievements = ACHIEVEMENTS.filter(
    (achievement) => mergedAchievements[achievement.id] && !previousAchievementIds.has(achievement.id),
  );

  updateActiveStreak({ unlockedAchievements: mergedAchievements, achievementHistory });
  return newlyUnlockedAchievements;
}

function getCurrentCycleAchievements(streak, { retainManualAchievements = true } = {}) {
  const activeAchievementDates = getActiveAchievementDates(streak.completedDates);
  const achievements = deriveAchievementsFromCompletedDates(activeAchievementDates);

  if (!retainManualAchievements || activeAchievementDates.length === 0) {
    return achievements;
  }

  Object.entries(streak.unlockedAchievements).forEach(([achievementId, unlockedDateKey]) => {
    const achievement = ACHIEVEMENTS.find((item) => item.id === achievementId);

    if (achievement?.type === "recovery") {
      achievements[achievementId] = unlockedDateKey;
    }
  });

  return achievements;
}

function archiveUnlockedAchievements(streak, archivedAt = new Date().toISOString()) {
  const historyByKey = new Map(
    (streak.achievementHistory || []).map((item) => [
      `${item.achievementId}|${item.unlockedDateKey}|${item.archivedAt}`,
      item,
    ]),
  );

  Object.entries(streak.unlockedAchievements).forEach(([achievementId, unlockedDateKey]) => {
    const historyItem = { achievementId, unlockedDateKey, archivedAt };
    historyByKey.set(`${achievementId}|${unlockedDateKey}|${archivedAt}`, historyItem);
  });

  return [...historyByKey.values()].sort((firstItem, secondItem) =>
    firstItem.archivedAt.localeCompare(secondItem.archivedAt),
  );
}

function saveStreakState() {
  saveStreakStateData({
    version: EXPORT_VERSION,
    activeStreakId: state.activeStreakId,
    streaks: state.streaks,
  });
}

function getActiveStreak() {
  const activeStreak = getStreakById(state.activeStreakId);

  if (activeStreak) {
    return activeStreak;
  }

  if (state.streaks.length === 0) {
    const fallbackStreak = createEmptyStreak(DEFAULT_STREAK_NAME, DEFAULT_STREAK_ID);
    state.streaks = [fallbackStreak];
    state.activeStreakId = fallbackStreak.id;
    saveStreakState();
    return fallbackStreak;
  }

  state.activeStreakId = state.streaks[0].id;
  saveStreakState();
  return state.streaks[0];
}

function getStreakById(streakId) {
  return state.streaks.find((streak) => streak.id === streakId);
}

function setActiveStreak(streakId) {
  if (!getStreakById(streakId) || streakId === state.activeStreakId) {
    return;
  }

  state.activeStreakId = streakId;
  hideDayEditor();
  hideAchievementModal(elements);
  refreshActiveStreakAchievements();
  saveStreakState();
  renderApp();
}

function updateActiveStreak(changes) {
  updateStreak(getActiveStreak().id, changes);
}

function updateStreak(streakId, changes) {
  state.streaks = state.streaks.map((streak) =>
    streak.id === streakId
      ? {
          ...streak,
          ...changes,
        }
      : streak,
  );
}

function exportData() {
  const backup = createBackup({
    activeStreakId: state.activeStreakId,
    streaks: state.streaks,
  });
  const backupBlob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const backupUrl = URL.createObjectURL(backupBlob);
  const downloadLink = document.createElement("a");

  downloadLink.href = backupUrl;
  downloadLink.download = `calendario-rachas-${toDateKey(new Date())}.json`;
  downloadLink.click();
  URL.revokeObjectURL(backupUrl);
  showDataStatus(elements, "Respaldo exportado.");
}

function handleImportDataInputChange(event) {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    try {
      const parsedBackup = JSON.parse(String(reader.result));
      const backup = normalizeBackupData(parsedBackup);
      const newlyUnlockedAchievements = mergeImportedData(backup);

      renderApp();
      showDataStatus(elements, "Respaldo importado y fusionado.");
      showUnlockedAchievements(elements, state, newlyUnlockedAchievements);
    } catch {
      showDataStatus(elements, "No se pudo importar: el archivo no es compatible.", true);
    } finally {
      elements.importDataInput.value = "";
    }
  });

  reader.addEventListener("error", () => {
    showDataStatus(elements, "No se pudo leer el archivo.", true);
    elements.importDataInput.value = "";
  });

  reader.readAsText(file);
}

function mergeImportedData(backup) {
  const activeStreak = getActiveStreak();
  const previousAchievementIds = new Set(Object.keys(activeStreak.unlockedAchievements));
  const streaksById = new Map(state.streaks.map((streak) => [streak.id, streak]));

  backup.streaks.forEach((importedStreak) => {
    const currentStreak = streaksById.get(importedStreak.id);

    if (!currentStreak) {
      streaksById.set(importedStreak.id, importedStreak);
      return;
    }

    const completedDates = [
      ...new Set([...currentStreak.completedDates, ...importedStreak.completedDates]),
    ].sort();
    const completedDateSet = new Set(completedDates);
    const dismissedCatchUpDates = [
      ...new Set([
        ...currentStreak.dismissedCatchUpDates,
        ...importedStreak.dismissedCatchUpDates,
      ]),
    ]
      .filter((dateKey) => !completedDateSet.has(dateKey))
      .sort();
    const unlockedAchievements = {
      ...importedStreak.unlockedAchievements,
      ...currentStreak.unlockedAchievements,
    };
    const achievementHistory = mergeAchievementHistory(
      currentStreak.achievementHistory,
      importedStreak.achievementHistory,
    );

    streaksById.set(importedStreak.id, {
      ...currentStreak,
      name: currentStreak.name || importedStreak.name,
      completedDates,
      dismissedCatchUpDates,
      notesByDate: {
        ...importedStreak.notesByDate,
        ...currentStreak.notesByDate,
      },
      unlockedAchievements,
      achievementHistory,
    });
  });

  state.streaks = Array.from(streaksById.values());

  if (getStreakById(backup.activeStreakId)) {
    state.activeStreakId = backup.activeStreakId;
  }

  saveStreakState();
  refreshActiveStreakAchievements();

  const updatedActiveStreak = getActiveStreak();
  return ACHIEVEMENTS.filter(
    (achievement) =>
      updatedActiveStreak.unlockedAchievements[achievement.id] &&
      !previousAchievementIds.has(achievement.id),
  );
}

function mergeAchievementHistory(currentHistory = [], importedHistory = []) {
  const historyByKey = new Map();

  [...currentHistory, ...importedHistory].forEach((item) => {
    historyByKey.set(`${item.achievementId}|${item.unlockedDateKey}|${item.archivedAt}`, item);
  });

  return [...historyByKey.values()].sort((firstItem, secondItem) =>
    firstItem.archivedAt.localeCompare(secondItem.archivedAt),
  );
}

function handleBeforeInstallPrompt(event) {
  event.preventDefault();
  state.deferredInstallPrompt = event;
  elements.installAppButton.hidden = false;
}

async function installApp() {
  if (!state.deferredInstallPrompt) {
    return;
  }

  const promptEvent = state.deferredInstallPrompt;
  state.deferredInstallPrompt = null;
  elements.installAppButton.hidden = true;
  promptEvent.prompt();

  const choice = await promptEvent.userChoice;

  if (choice.outcome === "accepted") {
    showDataStatus(elements, "Instalación iniciada.");
    return;
  }
  showDataStatus(elements, "Instalación cancelada.");
}

function handleAppInstalled() {
  state.deferredInstallPrompt = null;
  elements.installAppButton.hidden = true;
  showDataStatus(elements, "App instalada.");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !["http:", "https:"].includes(window.location.protocol)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      showDataStatus(elements, "No se pudo activar el modo offline.", true);
    });
  });
}

function showAchievementsModal() {
  showModal({
    modal: elements.achievementsModal,
    focusTarget: elements.closeAchievementsModalButton,
    updateModalLock,
  });
}

function hideAchievementsModal() {
  hideModal({
    modal: elements.achievementsModal,
    updateModalLock,
  });
}

function handleAchievementsModalClick(event) {
  if (event.target.matches("[data-close-achievements-modal]")) {
    hideAchievementsModal();
  }
}

function handleDocumentKeydown(event) {
  if (event.key !== "Escape") {
    return;
  }

  if (!elements.streakEditorModal.hidden) {
    hideStreakEditor();
    return;
  }

  if (!elements.dayEditorModal.hidden) {
    hideDayEditor();
    return;
  }

  if (!elements.achievementsModal.hidden) {
    hideAchievementsModal();
  }
}

function updateModalLock() {
  document.body.classList.toggle(
    "has-open-modal",
    !elements.achievementsModal.hidden ||
      !elements.dayEditorModal.hidden ||
      !elements.streakEditorModal.hidden,
  );
}

function getPendingCatchUpDates() {
  const todayKey = toDateKey(new Date());
  const yesterday = addDays(new Date(), -1);
  const yesterdayKey = toDateKey(yesterday);
  const activeStreak = getActiveStreak();
  const completedSet = new Set(activeStreak.completedDates);
  const dismissedSet = new Set(activeStreak.dismissedCatchUpDates);
  const lastCompletedBeforeToday = activeStreak.completedDates
    .filter((dateKey) => dateKey < todayKey)
    .sort()
    .at(-1);

  if (!lastCompletedBeforeToday || lastCompletedBeforeToday >= yesterdayKey) {
    return [];
  }

  const pendingDates = [];
  let cursor = addDays(parseDateKey(lastCompletedBeforeToday), 1);

  while (toDateKey(cursor) <= yesterdayKey) {
    const cursorKey = toDateKey(cursor);

    if (!completedSet.has(cursorKey) && !dismissedSet.has(cursorKey)) {
      pendingDates.push(cursorKey);
    }

    cursor = addDays(cursor, 1);
  }

  return pendingDates;
}
