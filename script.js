const STORAGE_KEY = "streak-calendar:v1";
const ACHIEVEMENT_STORAGE_KEY = "streak-calendar:achievements:v1";
const NOTES_STORAGE_KEY = "streak-calendar:notes:v1";
const THEME_STORAGE_KEY = "streak-calendar:theme:v1";
const STREAKS_STORAGE_KEY = "streak-calendar:streaks:v2";
const EXPORT_VERSION = 2;
const DEFAULT_THEME = "ocean-dark";
const DEFAULT_STREAK_ID = "streak-default";
const DEFAULT_STREAK_NAME = "Mi racha";
const MAX_STREAK_NAME_LENGTH = 40;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ACHIEVEMENT_MODAL_TIMEOUT = 5200;
const THEME_IDS = new Set([
  "ocean-dark",
  "forest-dark",
  "grape-dark",
  "sunrise-light",
  "mint-light",
  "lavender-light",
]);

const ACHIEVEMENTS = [
  { id: "day-1", type: "streak", target: 1, name: "El Comienzo" },
  { id: "day-2", type: "streak", target: 2, name: "Segundo Paso" },
  { id: "day-3", type: "streak", target: 3, name: "En Marcha" },
  { id: "day-5", type: "streak", target: 5, name: "Ritmo Inicial" },
  { id: "day-7", type: "streak", target: 7, name: "Primera Semana" },
  { id: "day-10", type: "streak", target: 10, name: "Diez Días Firmes" },
  { id: "day-14", type: "streak", target: 14, name: "Dos Semanas" },
  { id: "day-15", type: "streak", target: 15, name: "Disciplina Real" },
  { id: "day-21", type: "streak", target: 21, name: "Hábito Formado" },
  { id: "day-30", type: "streak", target: 30, name: "Un Mes de Éxito" },
  { id: "day-45", type: "streak", target: 45, name: "Constancia Clara" },
  { id: "day-50", type: "streak", target: 50, name: "Imparable" },
  { id: "day-60", type: "streak", target: 60, name: "Dos Meses Fuertes" },
  { id: "day-66", type: "streak", target: 66, name: "Conducta Automática" },
  { id: "day-75", type: "streak", target: 75, name: "Impulso Sostenido" },
  { id: "day-90", type: "streak", target: 90, name: "Trimestre Dorado" },
  { id: "day-100", type: "streak", target: 100, name: "Centurión" },
  { id: "day-120", type: "streak", target: 120, name: "Cuatro Meses" },
  { id: "day-150", type: "streak", target: 150, name: "Determinación de Acero" },
  { id: "day-180", type: "streak", target: 180, name: "Medio Año de Victoria" },
  { id: "day-200", type: "streak", target: 200, name: "Doble Centuria" },
  { id: "day-250", type: "streak", target: 250, name: "Referente de Constancia" },
  { id: "day-270", type: "streak", target: 270, name: "Nueve Meses" },
  { id: "day-300", type: "streak", target: 300, name: "Maestro de la Voluntad" },
  { id: "day-330", type: "streak", target: 330, name: "Recta Final Anual" },
  { id: "day-365", type: "streak", target: 365, name: "Un Año de Transformación" },
  { id: "day-400", type: "streak", target: 400, name: "Más Allá del Año" },
  { id: "day-500", type: "streak", target: 500, name: "Quinientos Días" },
  { id: "day-600", type: "streak", target: 600, name: "Voluntad Extendida" },
  { id: "day-730", type: "streak", target: 730, name: "Dos Años Imparables" },
  { id: "total-10", type: "total", target: 10, name: "Diez Marcas Totales" },
  { id: "total-30", type: "total", target: 30, name: "Treinta Días Acumulados" },
  { id: "total-50", type: "total", target: 50, name: "Cincuenta Cumplimientos" },
  { id: "total-100", type: "total", target: 100, name: "Cien Días Marcados" },
  { id: "total-200", type: "total", target: 200, name: "Doscientos Días Totales" },
  { id: "total-365", type: "total", target: 365, name: "Año Acumulado" },
  { id: "perfect-month-1", type: "perfect-month", target: 1, name: "Mes Perfecto" },
  { id: "recovery-1", type: "recovery", target: 1, name: "Racha Rescatada" },
  { id: "weekend-1", type: "weekend", target: 1, name: "Fin de Semana Completo" },
  { id: "weekend-4", type: "weekend", target: 4, name: "Cuatro Fines de Semana" },
  { id: "weekend-12", type: "weekend", target: 12, name: "Doce Fines de Semana" },
];

const ACHIEVEMENT_IDS = new Set(ACHIEVEMENTS.map((achievement) => achievement.id));
const ACHIEVEMENT_ORDER = new Map(
  ACHIEVEMENTS.map((achievement, index) => [achievement.id, index]),
);
const initialStreakState = loadStreakState();

const state = {
  streaks: initialStreakState.streaks,
  activeStreakId: initialStreakState.activeStreakId,
  selectedTheme: loadSelectedTheme(),
  visibleDate: startOfMonth(new Date()),
  selectedDateKey: null,
  editingStreakId: null,
  deferredInstallPrompt: null,
  catchUpDismissed: false,
  achievementModalTimerId: null,
};

const elements = {
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
  achievementModal: document.querySelector("#achievementModal"),
  achievementModalTitle: document.querySelector("#achievementModalTitle"),
  achievementModalMessage: document.querySelector("#achievementModalMessage"),
  closeAchievementModalButton: document.querySelector("#closeAchievementModalButton"),
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

const longDateFormatter = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const monthFormatter = new Intl.DateTimeFormat("es-CO", {
  month: "long",
  year: "numeric",
});

const unlockedDateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

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
elements.closeAchievementModalButton.addEventListener("click", hideAchievementModal);
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

applyTheme(state.selectedTheme);
render();
registerServiceWorker();

function handleThemeOptionClick(event) {
  const selectedTheme = event.currentTarget.dataset.themeOption;

  if (!THEME_IDS.has(selectedTheme)) {
    return;
  }

  state.selectedTheme = selectedTheme;
  saveSelectedTheme(selectedTheme);
  applyTheme(selectedTheme);
}

function applyTheme(themeId) {
  const selectedTheme = THEME_IDS.has(themeId) ? themeId : DEFAULT_THEME;
  document.documentElement.dataset.theme = selectedTheme;

  elements.themeOptions.forEach((option) => {
    const isSelected = option.dataset.themeOption === selectedTheme;
    option.classList.toggle("is-selected", isSelected);
    option.setAttribute("aria-pressed", String(isSelected));
  });
}

function render() {
  const activeStreak = getActiveStreak();
  const today = new Date();
  const todayKey = toDateKey(today);
  const isTodayComplete = activeStreak.completedDates.includes(todayKey);
  const monthKey = toMonthKey(state.visibleDate);
  const currentMonthKey = toMonthKey(today);
  const stats = getStats(activeStreak.completedDates, today);

  renderStreaks();

  elements.todayLabel.textContent = capitalize(longDateFormatter.format(today));
  elements.todayStatus.textContent = isTodayComplete
    ? "Hoy ya está completado"
    : "Pendiente por completar";
  elements.toggleTodayButton.textContent = isTodayComplete
    ? "Desmarcar hoy"
    : "Marcar hoy";
  elements.toggleTodayButton.classList.toggle("is-complete", isTodayComplete);

  elements.currentStreak.textContent = stats.currentStreak;
  elements.bestStreak.textContent = stats.bestStreak;
  elements.totalCompleted.textContent = stats.totalCompleted;
  elements.monthCompleted.textContent = activeStreak.completedDates.filter((dateKey) =>
    dateKey.startsWith(monthKey),
  ).length;
  elements.calendarTitle.textContent = capitalize(monthFormatter.format(state.visibleDate));
  elements.todayMonthButton.hidden = monthKey === currentMonthKey;
  elements.todayMonthButton.disabled = monthKey === currentMonthKey;

  renderCatchUp();
  renderAchievements();
  renderCalendar();
}

function renderStreaks() {
  elements.streaksList.replaceChildren();

  state.streaks.forEach((streak) => {
    const stats = getStats(streak.completedDates, new Date());
    const isActive = streak.id === state.activeStreakId;
    const card = document.createElement("article");
    card.className = "streak-card";
    card.classList.toggle("is-active", isActive);

    const selectButton = document.createElement("button");
    selectButton.className = "streak-card__main";
    selectButton.type = "button";
    selectButton.dataset.streakAction = "select";
    selectButton.dataset.streakId = streak.id;
    selectButton.setAttribute(
      "aria-label",
      `Abrir ${streak.name}. Racha actual ${formatDaysLabel(
        stats.currentStreak,
      )}, mejor racha ${formatDaysLabel(stats.bestStreak)}, ${formatDaysLabel(
        stats.totalCompleted,
      )} completados.`,
    );

    const title = document.createElement("strong");
    title.textContent = streak.name;

    const meta = document.createElement("span");
    meta.className = "streak-card__meta";
    meta.textContent = isActive ? "Racha activa" : "Toca para abrir";

    const metrics = document.createElement("span");
    metrics.className = "streak-card__metrics";
    metrics.innerHTML = `
      <span><b>${stats.currentStreak}</b> actual</span>
      <span><b>${stats.bestStreak}</b> mejor</span>
      <span><b>${stats.totalCompleted}</b> total</span>
    `;

    const editButton = document.createElement("button");
    editButton.className = "streak-card__edit";
    editButton.type = "button";
    editButton.dataset.streakAction = "edit";
    editButton.dataset.streakId = streak.id;
    editButton.setAttribute("aria-label", `Renombrar ${streak.name}`);
    editButton.textContent = "Editar";

    selectButton.append(title, meta, metrics);
    card.append(selectButton, editButton);
    elements.streaksList.append(card);
  });
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
  elements.streakEditorModal.hidden = false;
  elements.streakEditorModal.setAttribute("aria-hidden", "false");
  updateModalLock();

  window.requestAnimationFrame(() => {
    elements.streakEditorModal.classList.add("is-visible");
    elements.streakEditorName.focus();
  });
}

function hideStreakEditor() {
  elements.streakEditorModal.classList.remove("is-visible");
  elements.streakEditorModal.setAttribute("aria-hidden", "true");
  state.editingStreakId = null;

  window.setTimeout(() => {
    if (!elements.streakEditorModal.classList.contains("is-visible")) {
      elements.streakEditorModal.hidden = true;
      updateModalLock();
    }
  }, 180);
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
  render();
}

function renderCatchUp() {
  const pendingDates = getPendingCatchUpDates();

  elements.catchUpList.replaceChildren();

  if (state.catchUpDismissed || pendingDates.length === 0) {
    elements.catchUpSection.hidden = true;
    return;
  }

  elements.catchUpSection.hidden = false;
  elements.catchUpText.textContent =
    pendingDates.length === 1
      ? "Selecciona el día que sí cumpliste para agregarlo a tu racha."
      : `Selecciona los ${pendingDates.length} días que sí cumpliste para agregarlos a tu racha.`;

  pendingDates.forEach((dateKey) => {
    const option = document.createElement("label");
    option.className = "catch-up-option";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = dateKey;
    checkbox.checked = true;

    const content = document.createElement("span");
    content.className = "catch-up-option__content";

    const title = document.createElement("strong");
    title.textContent = capitalize(longDateFormatter.format(parseDateKey(dateKey)));

    const hint = document.createElement("span");
    hint.textContent = formatDateKey(dateKey);

    content.append(title, hint);
    option.append(checkbox, content);
    elements.catchUpList.append(option);
  });

  updateCatchUpActionState();
}

function renderAchievements() {
  const unlockedAchievements = getUnlockedAchievements();
  const stats = getStats(getActiveStreak().completedDates, new Date());
  const availableAchievements = getAvailableAchievements(stats);
  const nextAchievement = availableAchievements[0];
  const previewAchievements = getPreviewAchievements(
    unlockedAchievements,
    availableAchievements,
    nextAchievement,
  );

  elements.achievementsPreviewList.replaceChildren();
  elements.achievementsList.replaceChildren();
  elements.availableAchievementsList.replaceChildren();

  elements.achievementsUnlockedCount.textContent = `${unlockedAchievements.length}/${ACHIEVEMENTS.length}`;

  if (nextAchievement) {
    const nextAchievementProgress = getAchievementProgress(nextAchievement, stats);

    elements.nextAchievementName.textContent = nextAchievement.name;
    elements.nextAchievementProgress.textContent = getAchievementProgressText(
      nextAchievement,
      stats,
    );
    updateProgressBar(elements.nextAchievementProgressBar, nextAchievementProgress);
    elements.nextAchievementProgressValue.textContent = `${Math.round(
      nextAchievementProgress.ratio * 100,
    )}%`;
  } else {
    elements.nextAchievementName.textContent = "Colección completa";
    elements.nextAchievementProgress.textContent = "Ya conseguiste todos los logros disponibles";
    updateProgressBar(elements.nextAchievementProgressBar, {
      current: 1,
      target: 1,
      ratio: 1,
    });
    elements.nextAchievementProgressValue.textContent = "100%";
  }

  previewAchievements.forEach((item) => {
    elements.achievementsPreviewList.append(createAchievementCard(item, stats));
  });

  elements.achievementsEmpty.hidden = unlockedAchievements.length > 0;
  elements.availableAchievementsEmpty.hidden = availableAchievements.length > 0;

  unlockedAchievements.forEach((item) => {
    elements.achievementsList.append(createAchievementCard(item, stats));
  });

  availableAchievements.forEach((achievement) => {
    elements.availableAchievementsList.append(createAchievementCard({ achievement }, stats));
  });
}

function getPreviewAchievements(unlockedAchievements, availableAchievements, nextAchievement) {
  const recentUnlocked = [...unlockedAchievements].reverse().slice(0, 2);
  const nextAvailable = availableAchievements
    .slice(0, 4 - recentUnlocked.length)
    .map((achievement) => ({
      achievement,
      isNext: achievement.id === nextAchievement?.id,
    }));
  const previewAchievements = [...recentUnlocked, ...nextAvailable];

  if (previewAchievements.length > 0) {
    return previewAchievements.slice(0, 4);
  }

  return [...unlockedAchievements].reverse().slice(0, 4);
}

function createAchievementCard({ achievement, unlockedDateKey, isNext = false }, stats) {
  const isUnlocked = Boolean(unlockedDateKey);
  const progress = isUnlocked
    ? { current: achievement.target, target: achievement.target, ratio: 1 }
    : getAchievementProgress(achievement, stats);
  const card = document.createElement("article");
  card.className = `achievement-card achievement-card--${getAchievementTier(achievement)}`;

  card.classList.toggle("achievement-card--unlocked", isUnlocked);
  card.classList.toggle("achievement-card--locked", !isUnlocked);
  card.classList.toggle("achievement-card--next", isNext);

  card.setAttribute(
    "aria-label",
    isUnlocked
      ? `${achievement.name}, ${getAchievementGoalLabel(achievement)}, conseguido el ${formatDateKey(
          unlockedDateKey,
        )}`
      : `${achievement.name}, ${getAchievementGoalLabel(
          achievement,
        )}, ${getAchievementProgressText(achievement, stats)}`,
  );

  const badge = document.createElement("span");
  badge.className = "achievement-card__days";
  badge.textContent = getAchievementBadge(achievement);

  const stateIcon = document.createElement("span");
  stateIcon.className = "achievement-card__state";
  stateIcon.setAttribute("aria-hidden", "true");
  stateIcon.textContent = isUnlocked ? "✓" : isNext ? "→" : "○";

  const title = document.createElement("strong");
  title.textContent = achievement.name;

  const detail = document.createElement("span");
  detail.className = "achievement-card__date";
  detail.textContent = isUnlocked
    ? `Conseguido el ${formatDateKey(unlockedDateKey)}`
    : getAchievementProgressText(achievement, stats);

  const progressBar = document.createElement("span");
  progressBar.className = "achievement-card__progress";
  progressBar.setAttribute("aria-hidden", "true");

  const progressValue = document.createElement("span");
  progressValue.style.width = `${Math.round(progress.ratio * 100)}%`;
  progressBar.append(progressValue);

  card.append(badge, stateIcon, title, detail, progressBar);
  return card;
}

function renderCalendar() {
  elements.calendarGrid.replaceChildren();

  const activeStreak = getActiveStreak();
  const year = state.visibleDate.getFullYear();
  const month = state.visibleDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const leadingEmptyDays = getMondayBasedWeekday(firstDay);
  const todayKey = toDateKey(new Date());

  for (let index = 0; index < leadingEmptyDays; index += 1) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "day is-empty";
    elements.calendarGrid.append(emptyDay);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month, day);
    const dateKey = toDateKey(date);
    const isComplete = activeStreak.completedDates.includes(dateKey);
    const isToday = dateKey === todayKey;
    const isFuture = dateKey > todayKey;
    const isEditable = !isFuture;
    const hasNote = Boolean(activeStreak.notesByDate[dateKey]);

    const dayButton = document.createElement("button");
    dayButton.className = "day";
    dayButton.type = "button";
    dayButton.disabled = !isEditable;
    dayButton.dataset.dateKey = dateKey;
    dayButton.setAttribute("aria-label", getDayAriaLabel(date, isComplete, isToday, isFuture, hasNote));

    dayButton.classList.toggle("is-complete", isComplete);
    dayButton.classList.toggle("is-today", isToday);
    dayButton.classList.toggle("is-future", isFuture);
    dayButton.classList.toggle("is-editable", isEditable);
    dayButton.classList.toggle("has-note", hasNote);

    if (isEditable) {
      dayButton.addEventListener("click", () => openDayEditor(dateKey));
    }

    const number = document.createElement("span");
    number.className = "day__number";
    number.textContent = day;
    dayButton.append(number);

    if (isComplete || isToday || isFuture) {
      const status = document.createElement("span");
      status.className = "day__status";
      status.textContent = getDayStatus(isComplete, isToday, isFuture);
      dayButton.append(status);
    }

    if (hasNote) {
      const note = document.createElement("span");
      note.className = "day__note";
      note.setAttribute("aria-hidden", "true");
      note.title = "Con nota";
      dayButton.append(note);
    }

    elements.calendarGrid.append(dayButton);
  }
}

function toggleToday() {
  const activeStreak = getActiveStreak();
  const todayKey = toDateKey(new Date());
  const exists = activeStreak.completedDates.includes(todayKey);
  const previousAchievementIds = new Set(Object.keys(activeStreak.unlockedAchievements));

  setCompletedDate(todayKey, !exists);
  const newlyUnlockedAchievements = syncUnlockedAchievementsFromCompletedDates(previousAchievementIds);

  saveStreakState();
  render();
  showLatestAchievement(newlyUnlockedAchievements);
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
  elements.dayEditorModal.hidden = false;
  elements.dayEditorModal.setAttribute("aria-hidden", "false");
  updateModalLock();

  window.requestAnimationFrame(() => {
    elements.dayEditorModal.classList.add("is-visible");
    elements.dayEditorCompleted.focus();
  });
}

function hideDayEditor() {
  elements.dayEditorModal.classList.remove("is-visible");
  elements.dayEditorModal.setAttribute("aria-hidden", "true");
  state.selectedDateKey = null;

  window.setTimeout(() => {
    if (!elements.dayEditorModal.classList.contains("is-visible")) {
      elements.dayEditorModal.hidden = true;
      updateModalLock();
    }
  }, 180);
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
  const previousAchievementIds = new Set(Object.keys(activeStreak.unlockedAchievements));
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
  render();
  showLatestAchievement(newlyUnlockedAchievements);
}

function dismissCatchUp() {
  state.catchUpDismissed = true;
  render();
}

function saveCatchUpDates() {
  const selectedDates = getSelectedCatchUpDates();

  if (selectedDates.length === 0) {
    return;
  }

  const activeStreak = getActiveStreak();
  const previousAchievementIds = new Set(Object.keys(activeStreak.unlockedAchievements));
  updateActiveStreak({
    completedDates: [...new Set([...activeStreak.completedDates, ...selectedDates])].sort(),
  });
  const newlyUnlockedAchievements = syncUnlockedAchievementsFromCompletedDates(
    previousAchievementIds,
    ["recovery-1"],
  );

  saveStreakState();
  render();
  showLatestAchievement(newlyUnlockedAchievements);
}

function updateCatchUpActionState() {
  elements.saveCatchUpButton.disabled = getSelectedCatchUpDates().length === 0;
}

function changeMonth(offset) {
  state.visibleDate = startOfMonth(
    new Date(state.visibleDate.getFullYear(), state.visibleDate.getMonth() + offset, 1),
  );
  render();
}

function showCurrentMonth() {
  state.visibleDate = startOfMonth(new Date());
  render();
}

function setCompletedDate(dateKey, isComplete) {
  const activeStreak = getActiveStreak();
  const completedSet = new Set(activeStreak.completedDates);

  if (isComplete) {
    completedSet.add(dateKey);
  } else {
    completedSet.delete(dateKey);
  }

  updateActiveStreak({ completedDates: [...completedSet].sort() });
}

function getStats(completedDates, today) {
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

function getUnlockedAchievements() {
  const activeStreak = getActiveStreak();

  return ACHIEVEMENTS.filter((achievement) => activeStreak.unlockedAchievements[achievement.id]).map(
    (achievement) => ({
      achievement,
      unlockedDateKey: activeStreak.unlockedAchievements[achievement.id],
    }),
  );
}

function getAvailableAchievements(stats) {
  const activeStreak = getActiveStreak();

  return ACHIEVEMENTS.filter((achievement) => !activeStreak.unlockedAchievements[achievement.id]).sort(
    (firstAchievement, secondAchievement) =>
      compareAchievementProgress(firstAchievement, secondAchievement, stats),
  );
}

function compareAchievementProgress(firstAchievement, secondAchievement, stats) {
  const firstProgress = getAchievementProgress(firstAchievement, stats);
  const secondProgress = getAchievementProgress(secondAchievement, stats);
  const ratioDifference = secondProgress.ratio - firstProgress.ratio;

  if (ratioDifference !== 0) {
    return ratioDifference;
  }

  return ACHIEVEMENT_ORDER.get(firstAchievement.id) - ACHIEVEMENT_ORDER.get(secondAchievement.id);
}

function syncUnlockedAchievementsFromCompletedDates(
  previousAchievementIds,
  extraAchievementIds = [],
  unlockedDateKey = toDateKey(new Date()),
) {
  const activeStreak = getActiveStreak();
  const derivedAchievements = deriveAchievementsFromCompletedDates(activeStreak.completedDates);
  const extraAchievements = Object.fromEntries(
    extraAchievementIds
      .filter((achievementId) => ACHIEVEMENT_IDS.has(achievementId))
      .map((achievementId) => [achievementId, unlockedDateKey]),
  );
  const mergedAchievements = {
    ...derivedAchievements,
    ...extraAchievements,
    ...activeStreak.unlockedAchievements,
  };
  const newlyUnlockedAchievements = ACHIEVEMENTS.filter(
    (achievement) => mergedAchievements[achievement.id] && !previousAchievementIds.has(achievement.id),
  );

  updateActiveStreak({ unlockedAchievements: mergedAchievements });
  saveStreakState();

  return newlyUnlockedAchievements;
}

function initializeUnlockedAchievements(completedDates) {
  const storedAchievements = loadUnlockedAchievements();
  const migratedAchievements = deriveAchievementsFromCompletedDates(completedDates);
  const unlockedAchievements = {
    ...migratedAchievements,
    ...storedAchievements,
  };

  if (Object.keys(unlockedAchievements).length > Object.keys(storedAchievements).length) {
    saveUnlockedAchievements(unlockedAchievements);
  }

  return unlockedAchievements;
}

function deriveAchievementsFromCompletedDates(completedDates) {
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

function getAchievementProgress(achievement, stats) {
  let current = 0;

  if (achievement.type === "streak") {
    current = stats.currentStreak;
  }

  if (achievement.type === "total") {
    current = stats.totalCompleted;
  }

  if (achievement.type === "perfect-month") {
    current = stats.perfectMonths;
  }

  if (achievement.type === "weekend") {
    current = stats.completedWeekends;
  }

  if (achievement.type === "recovery" && getActiveStreak().unlockedAchievements[achievement.id]) {
    current = 1;
  }

  return {
    current,
    target: achievement.target,
    missing: Math.max(achievement.target - current, 0),
    ratio: Math.min(current / achievement.target, 1),
  };
}

function updateProgressBar(progressBar, progress) {
  const percent = Math.round(progress.ratio * 100);

  progressBar.style.setProperty("--progress", `${percent}%`);
  progressBar.setAttribute("role", "progressbar");
  progressBar.setAttribute("aria-valuemin", "0");
  progressBar.setAttribute("aria-valuemax", String(progress.target));
  progressBar.setAttribute("aria-valuenow", String(Math.min(progress.current, progress.target)));
}

function getAchievementProgressText(achievement, stats) {
  if (achievement.type === "recovery") {
    return "Recupera un día pasado para desbloquearlo";
  }

  const progress = getAchievementProgress(achievement, stats);

  if (progress.missing === 0) {
    return "Listo para desbloquear";
  }

  return `Faltan ${formatAchievementUnit(achievement, progress.missing)}`;
}

function getAchievementGoalLabel(achievement) {
  if (achievement.type === "streak") {
    return `logro de ${formatDaysLabel(achievement.target)} de racha`;
  }

  if (achievement.type === "total") {
    return `logro de ${formatDaysLabel(achievement.target)} completados`;
  }

  if (achievement.type === "perfect-month") {
    return "logro de mes perfecto";
  }

  if (achievement.type === "weekend") {
    return `logro de ${formatWeekendLabel(achievement.target)}`;
  }

  return "logro de recuperación";
}

function getAchievementBadge(achievement) {
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

function formatAchievementUnit(achievement, amount) {
  if (achievement.type === "perfect-month") {
    return `${amount} ${amount === 1 ? "mes perfecto" : "meses perfectos"}`;
  }

  if (achievement.type === "weekend") {
    return formatWeekendLabel(amount);
  }

  return formatDaysLabel(amount);
}

function formatWeekendLabel(amount) {
  return `${amount} ${amount === 1 ? "fin de semana" : "fines de semana"}`;
}

function formatWeekendShortLabel(amount) {
  return amount === 1 ? "1 finde" : `${amount} findes`;
}

function getAchievementTier(achievement) {
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

function showLatestAchievement(newlyUnlockedAchievements) {
  if (newlyUnlockedAchievements.length > 0) {
    showAchievementModal(newlyUnlockedAchievements[newlyUnlockedAchievements.length - 1]);
  }
}

function loadSelectedTheme() {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return THEME_IDS.has(storedTheme) ? storedTheme : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function saveSelectedTheme(themeId) {
  localStorage.setItem(THEME_STORAGE_KEY, themeId);
}

function loadStreakState() {
  try {
    const storedValue = localStorage.getItem(STREAKS_STORAGE_KEY);

    if (storedValue) {
      const parsedValue = JSON.parse(storedValue);
      const streakState = normalizeStreakState(parsedValue);
      saveStreakStateData(streakState);
      return streakState;
    }
  } catch {
    // Fall through to the v1 migration path.
  }

  const migratedState = createMigratedStreakState();
  saveStreakStateData(migratedState);
  return migratedState;
}

function normalizeStreakState(value) {
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

function normalizeStreak(value, index) {
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
  const notesByDate =
    value.notesByDate && !Array.isArray(value.notesByDate) && typeof value.notesByDate === "object"
      ? normalizeNotesByDate(value.notesByDate)
      : {};
  const storedAchievements =
    value.unlockedAchievements &&
    !Array.isArray(value.unlockedAchievements) &&
    typeof value.unlockedAchievements === "object"
      ? normalizeUnlockedAchievements(value.unlockedAchievements)
      : {};

  return {
    id,
    name,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : new Date().toISOString(),
    completedDates,
    notesByDate,
    unlockedAchievements: {
      ...deriveAchievementsFromCompletedDates(completedDates),
      ...storedAchievements,
    },
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
        notesByDate: loadNotesByDate(),
        unlockedAchievements: {
          ...deriveAchievementsFromCompletedDates(completedDates),
          ...storedAchievements,
        },
      },
    ],
  };
}

function createEmptyStreak(name = DEFAULT_STREAK_NAME, id = createStreakId()) {
  return {
    id,
    name: normalizeStreakName(name) || DEFAULT_STREAK_NAME,
    createdAt: new Date().toISOString(),
    completedDates: [],
    notesByDate: {},
    unlockedAchievements: {},
  };
}

function saveStreakState() {
  saveStreakStateData({
    version: EXPORT_VERSION,
    activeStreakId: state.activeStreakId,
    streaks: state.streaks,
  });
}

function saveStreakStateData(streakState) {
  localStorage.setItem(
    STREAKS_STORAGE_KEY,
    JSON.stringify({
      version: EXPORT_VERSION,
      activeStreakId: streakState.activeStreakId,
      streaks: streakState.streaks,
    }),
  );
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
  state.catchUpDismissed = false;
  hideDayEditor();
  hideAchievementModal();
  saveStreakState();
  render();
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

function normalizeStreakName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, MAX_STREAK_NAME_LENGTH);
}

function createStreakId() {
  if (window.crypto?.randomUUID) {
    return `streak-${window.crypto.randomUUID()}`;
  }

  return `streak-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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

function saveCompletedDates(completedDates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(completedDates));
}

function loadNotesByDate() {
  try {
    const storedValue = localStorage.getItem(NOTES_STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : {};

    if (!parsedValue || Array.isArray(parsedValue) || typeof parsedValue !== "object") {
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

function saveNotesByDate(notesByDate) {
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesByDate));
}

function loadUnlockedAchievements() {
  try {
    const storedValue = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : {};

    if (!parsedValue || Array.isArray(parsedValue) || typeof parsedValue !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedValue).filter(
        ([achievementId, unlockedDateKey]) =>
          ACHIEVEMENT_IDS.has(achievementId) && isDateKey(unlockedDateKey),
      ),
    );
  } catch {
    return {};
  }
}

function saveUnlockedAchievements(unlockedAchievements) {
  localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(unlockedAchievements));
}

function exportData() {
  const backup = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    activeStreakId: state.activeStreakId,
    streaks: state.streaks,
  };
  const backupBlob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const backupUrl = URL.createObjectURL(backupBlob);
  const downloadLink = document.createElement("a");

  downloadLink.href = backupUrl;
  downloadLink.download = `calendario-rachas-${toDateKey(new Date())}.json`;
  downloadLink.click();
  URL.revokeObjectURL(backupUrl);
  showDataStatus("Respaldo exportado.");
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

      render();
      showDataStatus("Respaldo importado y fusionado.");
      showLatestAchievement(newlyUnlockedAchievements);
    } catch {
      showDataStatus("No se pudo importar: el archivo no es compatible.", true);
    } finally {
      elements.importDataInput.value = "";
    }
  });

  reader.addEventListener("error", () => {
    showDataStatus("No se pudo leer el archivo.", true);
    elements.importDataInput.value = "";
  });

  reader.readAsText(file);
}

function normalizeBackupData(value) {
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
  const notesByDate =
    value.notesByDate && !Array.isArray(value.notesByDate) && typeof value.notesByDate === "object"
      ? normalizeNotesByDate(value.notesByDate)
      : {};
  const unlockedAchievements =
    value.unlockedAchievements &&
    !Array.isArray(value.unlockedAchievements) &&
    typeof value.unlockedAchievements === "object"
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

function normalizeDateArray(value) {
  if (!Array.isArray(value)) {
    throw new Error("Invalid dates");
  }

  return [...new Set(value.filter(isDateKey))].sort();
}

function normalizeNotesByDate(value) {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new Error("Invalid notes");
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([dateKey, note]) => isDateKey(dateKey) && typeof note === "string")
      .map(([dateKey, note]) => [dateKey, note.trim().slice(0, 220)])
      .filter(([, note]) => note),
  );
}

function normalizeUnlockedAchievements(value) {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new Error("Invalid achievements");
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      ([achievementId, unlockedDateKey]) =>
        ACHIEVEMENT_IDS.has(achievementId) && isDateKey(unlockedDateKey),
    ),
  );
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
    const unlockedAchievements = {
      ...deriveAchievementsFromCompletedDates(completedDates),
      ...importedStreak.unlockedAchievements,
      ...currentStreak.unlockedAchievements,
    };

    streaksById.set(importedStreak.id, {
      ...currentStreak,
      name: currentStreak.name || importedStreak.name,
      completedDates,
      notesByDate: {
        ...importedStreak.notesByDate,
        ...currentStreak.notesByDate,
      },
      unlockedAchievements,
    });
  });

  state.streaks = Array.from(streaksById.values());

  if (getStreakById(backup.activeStreakId)) {
    state.activeStreakId = backup.activeStreakId;
  }

  saveStreakState();

  const updatedActiveStreak = getActiveStreak();
  const newlyUnlockedAchievements = ACHIEVEMENTS.filter(
    (achievement) =>
      updatedActiveStreak.unlockedAchievements[achievement.id] &&
      !previousAchievementIds.has(achievement.id),
  );

  return newlyUnlockedAchievements;
}

function showDataStatus(message, isError = false) {
  elements.dataStatus.textContent = message;
  elements.dataStatus.classList.toggle("is-error", isError);
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
    showDataStatus("Instalación iniciada.");
  } else {
    showDataStatus("Instalación cancelada.");
  }
}

function handleAppInstalled() {
  state.deferredInstallPrompt = null;
  elements.installAppButton.hidden = true;
  showDataStatus("App instalada.");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !["http:", "https:"].includes(window.location.protocol)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      showDataStatus("No se pudo activar el modo offline.", true);
    });
  });
}

function showAchievementModal(achievement) {
  window.clearTimeout(state.achievementModalTimerId);

  elements.achievementModal.className = `achievement-modal achievement-modal--${getAchievementTier(
    achievement,
  )} is-celebrating`;
  elements.achievementModalTitle.textContent = achievement.name;
  elements.achievementModalMessage.textContent = getAchievementModalMessage(achievement);
  renderAchievementCelebration();
  elements.achievementModal.hidden = false;
  elements.achievementModal.setAttribute("aria-hidden", "false");

  window.requestAnimationFrame(() => {
    elements.achievementModal.classList.add("is-visible");
  });

  state.achievementModalTimerId = window.setTimeout(hideAchievementModal, ACHIEVEMENT_MODAL_TIMEOUT);
}

function getAchievementModalMessage(achievement) {
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

function hideAchievementModal() {
  window.clearTimeout(state.achievementModalTimerId);
  elements.achievementModal.classList.remove("is-visible");
  elements.achievementModal.classList.remove("is-celebrating");
  elements.achievementModal.setAttribute("aria-hidden", "true");

  window.setTimeout(() => {
    if (!elements.achievementModal.classList.contains("is-visible")) {
      elements.achievementModal.hidden = true;
    }
  }, 220);
}

function renderAchievementCelebration() {
  const panel = elements.achievementModal.querySelector(".achievement-modal__panel");
  const existingBurst = panel.querySelector(".achievement-burst");

  existingBurst?.remove();

  const burst = document.createElement("span");
  burst.className = "achievement-burst";
  burst.setAttribute("aria-hidden", "true");

  for (let index = 0; index < 10; index += 1) {
    const particle = document.createElement("i");
    particle.style.setProperty("--index", index);
    burst.append(particle);
  }

  panel.append(burst);
}

function showAchievementsModal() {
  elements.achievementsModal.hidden = false;
  elements.achievementsModal.setAttribute("aria-hidden", "false");
  updateModalLock();

  window.requestAnimationFrame(() => {
    elements.achievementsModal.classList.add("is-visible");
    elements.closeAchievementsModalButton.focus();
  });
}

function hideAchievementsModal() {
  elements.achievementsModal.classList.remove("is-visible");
  elements.achievementsModal.setAttribute("aria-hidden", "true");

  window.setTimeout(() => {
    if (!elements.achievementsModal.classList.contains("is-visible")) {
      elements.achievementsModal.hidden = true;
      updateModalLock();
    }
  }, 180);
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

function getDayStatus(isComplete, isToday, isFuture) {
  if (isComplete) return "Listo";
  if (isToday) return "Hoy";
  if (isFuture) return "Futuro";
  return "";
}

function getPendingCatchUpDates() {
  const todayKey = toDateKey(new Date());
  const yesterday = addDays(new Date(), -1);
  const yesterdayKey = toDateKey(yesterday);
  const activeStreak = getActiveStreak();
  const completedSet = new Set(activeStreak.completedDates);
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

    if (!completedSet.has(cursorKey)) {
      pendingDates.push(cursorKey);
    }

    cursor = addDays(cursor, 1);
  }

  return pendingDates;
}

function getSelectedCatchUpDates() {
  return Array.from(elements.catchUpList.querySelectorAll("input[type='checkbox']:checked")).map(
    (checkbox) => checkbox.value,
  );
}

function getDayAriaLabel(date, isComplete, isToday, isFuture, hasNote) {
  const labels = [longDateFormatter.format(date)];

  if (isComplete) labels.push("completado");
  if (isToday) labels.push("hoy");
  if (isFuture) labels.push("futuro");
  if (hasNote) labels.push("con nota");

  return capitalize(labels.join(", "));
}

function getCompletedWeekendEndDates(completedDates) {
  const completedSet = new Set(completedDates);

  return completedDates
    .filter((dateKey) => parseDateKey(dateKey).getDay() === 6)
    .map((dateKey) => toDateKey(addDays(parseDateKey(dateKey), 1)))
    .filter((sundayKey) => completedSet.has(sundayKey))
    .sort();
}

function getPerfectMonthEndDates(completedDates) {
  const completedSet = new Set(completedDates);
  const monthKeys = [...new Set(completedDates.map((dateKey) => dateKey.slice(0, 7)))].sort();

  return monthKeys.filter((monthKey) => {
    const [year, month] = monthKey.split("-").map(Number);
    const totalDays = new Date(year, month, 0).getDate();

    for (let day = 1; day <= totalDays; day += 1) {
      const dateKey = `${monthKey}-${String(day).padStart(2, "0")}`;

      if (!completedSet.has(dateKey)) {
        return false;
      }
    }

    return true;
  }).map((monthKey) => {
    const [year, month] = monthKey.split("-").map(Number);
    const totalDays = new Date(year, month, 0).getDate();
    return `${monthKey}-${String(totalDays).padStart(2, "0")}`;
  });
}

function getMondayBasedWeekday(date) {
  return (date.getDay() + 6) % 7;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function daysBetween(firstDate, secondDate) {
  return Math.round((stripTime(secondDate) - stripTime(firstDate)) / MS_PER_DAY);
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatDateKey(dateKey) {
  return unlockedDateFormatter.format(parseDateKey(dateKey));
}

function formatDaysLabel(days) {
  return `${days} ${days === 1 ? "día" : "días"}`;
}

function isDateKey(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return toDateKey(parseDateKey(value)) === value;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
