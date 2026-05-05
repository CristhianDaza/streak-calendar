import {
  ACHIEVEMENTS,
  ACHIEVEMENT_MODAL_TIMEOUT,
  DEFAULT_THEME,
  THEME_IDS,
} from "./constants.js";
import {
  getAchievementBadge,
  getAchievementGoalLabel,
  getAchievementModalMessage,
  getAchievementProgress,
  getAchievementProgressText,
  getAchievementTier,
  getAvailableAchievements,
  getStats,
  getUnlockedAchievements,
} from "./achievements.js";
import { createElement, updateProgressBar } from "./dom-utils.js";
import {
  capitalize,
  formatDateKey,
  formatDaysLabel,
  getMondayBasedWeekday,
  longDateFormatter,
  monthFormatter,
  parseDateKey,
  toDateKey,
  toMonthKey,
} from "./date-utils.js";

const achievementModalTimers = new WeakMap();

export function applyTheme(themeId, elements) {
  const selectedTheme = THEME_IDS.has(themeId) ? themeId : DEFAULT_THEME;
  document.documentElement.dataset.theme = selectedTheme;

  elements.themeOptions.forEach((option) => {
    const isSelected = option.dataset.themeOption === selectedTheme;
    option.classList.toggle("is-selected", isSelected);
    option.setAttribute("aria-pressed", String(isSelected));
  });
}

export function render({
  state,
  elements,
  getActiveStreak,
  getPendingCatchUpDates,
  openDayEditor,
}) {
  const activeStreak = getActiveStreak();
  const today = new Date();
  const todayKey = toDateKey(today);
  const isTodayComplete = activeStreak.completedDates.includes(todayKey);
  const monthKey = toMonthKey(state.visibleDate);
  const currentMonthKey = toMonthKey(today);
  const stats = getStats(activeStreak.completedDates, today);

  renderStreaks({ state, elements });

  elements.todayLabel.textContent = capitalize(longDateFormatter.format(today));
  elements.todayStatus.textContent = isTodayComplete
    ? "Hoy ya está completado"
    : "Pendiente por completar";
  elements.toggleTodayButton.textContent = isTodayComplete ? "Desmarcar hoy" : "Marcar hoy";
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

  renderCatchUp({ elements, pendingDates: getPendingCatchUpDates() });
  renderAchievements({ elements, activeStreak });
  renderCalendar({ state, elements, activeStreak, openDayEditor });
}

export function renderStreaks({ state, elements }) {
  elements.streaksList.replaceChildren();

  state.streaks.forEach((streak) => {
    const stats = getStats(streak.completedDates, new Date());
    const isActive = streak.id === state.activeStreakId;
    const card = createElement("article", { className: "streak-card" });
    card.classList.toggle("is-active", isActive);

    const selectButton = createElement("button", {
      className: "streak-card__main",
      type: "button",
      dataset: {
        streakAction: "select",
        streakId: streak.id,
      },
      attributes: {
        "aria-label": `Abrir ${streak.name}. Racha actual ${formatDaysLabel(
          stats.currentStreak,
        )}, mejor racha ${formatDaysLabel(stats.bestStreak)}, ${formatDaysLabel(
          stats.totalCompleted,
        )} completados.`,
      },
    });

    const title = createElement("strong", { text: streak.name });
    const meta = createElement("span", {
      className: "streak-card__meta",
      text: isActive ? "Racha activa" : "Toca para abrir",
    });
    const metrics = createElement("span", {
      className: "streak-card__metrics",
      html: `
      <span><b>${stats.currentStreak}</b> actual</span>
      <span><b>${stats.bestStreak}</b> mejor</span>
      <span><b>${stats.totalCompleted}</b> total</span>
    `,
    });
    const editButton = createElement("button", {
      className: "streak-card__edit",
      type: "button",
      text: "Editar",
      dataset: {
        streakAction: "edit",
        streakId: streak.id,
      },
      attributes: {
        "aria-label": `Renombrar ${streak.name}`,
      },
    });

    selectButton.append(title, meta, metrics);
    card.append(selectButton, editButton);
    elements.streaksList.append(card);
  });
}

export function renderCatchUp({ elements, pendingDates }) {
  elements.catchUpList.replaceChildren();

  if (pendingDates.length === 0) {
    elements.catchUpSection.hidden = true;
    return;
  }

  elements.catchUpSection.hidden = false;
  elements.catchUpText.textContent =
    pendingDates.length === 1
      ? "Selecciona el día que sí cumpliste para agregarlo a tu racha."
      : `Selecciona los ${pendingDates.length} días que sí cumpliste para agregarlos a tu racha.`;

  pendingDates.forEach((dateKey) => {
    const checkbox = createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = dateKey;
    checkbox.checked = true;

    const title = createElement("strong", {
      text: capitalize(longDateFormatter.format(parseDateKey(dateKey))),
    });
    const hint = createElement("span", { text: formatDateKey(dateKey) });
    const content = createElement("span", { className: "catch-up-option__content" }, [
      title,
      hint,
    ]);
    const option = createElement("label", { className: "catch-up-option" }, [
      checkbox,
      content,
    ]);

    elements.catchUpList.append(option);
  });
}

export function renderAchievements({ elements, activeStreak }) {
  const unlockedAchievements = getUnlockedAchievements(activeStreak);
  const stats = getStats(activeStreak.completedDates, new Date());
  const availableAchievements = getAvailableAchievements(activeStreak, stats);
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
    const nextAchievementProgress = getAchievementProgress(nextAchievement, stats, activeStreak);

    elements.nextAchievementName.textContent = nextAchievement.name;
    elements.nextAchievementProgress.textContent = getAchievementProgressText(
      nextAchievement,
      stats,
      activeStreak,
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
    elements.achievementsPreviewList.append(createAchievementCard(item, stats, activeStreak));
  });

  elements.achievementsEmpty.hidden = unlockedAchievements.length > 0;
  elements.availableAchievementsEmpty.hidden = availableAchievements.length > 0;

  unlockedAchievements.forEach((item) => {
    elements.achievementsList.append(createAchievementCard(item, stats, activeStreak));
  });

  availableAchievements.forEach((achievement) => {
    elements.availableAchievementsList.append(
      createAchievementCard({ achievement }, stats, activeStreak),
    );
  });
}

export function renderCalendar({ state, elements, activeStreak, openDayEditor }) {
  elements.calendarGrid.replaceChildren();

  const year = state.visibleDate.getFullYear();
  const month = state.visibleDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const leadingEmptyDays = getMondayBasedWeekday(firstDay);
  const todayKey = toDateKey(new Date());

  for (let index = 0; index < leadingEmptyDays; index += 1) {
    elements.calendarGrid.append(createElement("div", { className: "day is-empty" }));
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month, day);
    const dateKey = toDateKey(date);
    const isComplete = activeStreak.completedDates.includes(dateKey);
    const isToday = dateKey === todayKey;
    const isFuture = dateKey > todayKey;
    const isEditable = !isFuture;
    const hasNote = Boolean(activeStreak.notesByDate[dateKey]);

    const dayButton = createElement("button", {
      className: "day",
      type: "button",
      dataset: { dateKey },
      attributes: {
        "aria-label": getDayAriaLabel(date, isComplete, isToday, isFuture, hasNote),
      },
    });
    dayButton.disabled = !isEditable;

    dayButton.classList.toggle("is-complete", isComplete);
    dayButton.classList.toggle("is-today", isToday);
    dayButton.classList.toggle("is-future", isFuture);
    dayButton.classList.toggle("is-editable", isEditable);
    dayButton.classList.toggle("has-note", hasNote);

    if (isEditable) {
      dayButton.addEventListener("click", () => openDayEditor(dateKey));
    }

    dayButton.append(createElement("span", { className: "day__number", text: day }));

    if (isComplete || isToday || isFuture) {
      dayButton.append(
        createElement("span", {
          className: "day__status",
          text: getDayStatus(isComplete, isToday, isFuture),
        }),
      );
    }

    if (hasNote) {
      dayButton.append(
        createElement("span", {
          className: "day__note",
          attributes: {
            "aria-hidden": "true",
            title: "Con nota",
          },
        }),
      );
    }

    elements.calendarGrid.append(dayButton);
  }
}

export function showDataStatus(elements, message, isError = false) {
  elements.dataStatus.textContent = message;
  elements.dataStatus.classList.toggle("is-error", isError);
}

export function showUnlockedAchievements(elements, state, newlyUnlockedAchievements) {
  newlyUnlockedAchievements.forEach((achievement) => {
    showAchievementModal(elements, state, achievement);
  });
}

export function showAchievementModal(elements, state, achievement) {
  const modalSequence = (state.achievementModalSequence += 1);
  const titleId = `achievementModalTitle-${modalSequence}`;
  const messageId = `achievementModalMessage-${modalSequence}`;
  const modal = createElement("div", {
    className: `achievement-modal achievement-modal--${getAchievementTier(
      achievement,
    )} is-celebrating`,
    attributes: {
      role: "dialog",
      "aria-modal": "false",
      "aria-labelledby": titleId,
      "aria-describedby": messageId,
      "aria-hidden": "false",
    },
  });
  const panel = createElement("div", { className: "achievement-modal__panel" });
  const kicker = createElement("span", {
    className: "achievement-modal__kicker",
    text: "Nuevo logro",
  });
  const title = createElement("strong", { text: achievement.name });
  const message = createElement("p", {
    text: getAchievementModalMessage(achievement),
  });
  const closeButton = createElement("button", {
    className: "achievement-modal__close",
    type: "button",
    html: "&times;",
    attributes: {
      "aria-label": `Cerrar logro ${achievement.name}`,
    },
  });

  title.id = titleId;
  message.id = messageId;

  panel.append(kicker, title, message, closeButton);
  renderAchievementCelebration(panel);
  modal.append(panel);
  elements.achievementModalStack.append(modal);

  const closeModal = () => hideAchievementModal(elements, modal);

  closeButton.addEventListener("click", closeModal);

  window.requestAnimationFrame(() => {
    modal.classList.add("is-visible");
  });

  achievementModalTimers.set(
    modal,
    window.setTimeout(closeModal, ACHIEVEMENT_MODAL_TIMEOUT),
  );
}

export function hideAchievementModal(elements, modal = null) {
  if (!modal) {
    [...elements.achievementModalStack.querySelectorAll(".achievement-modal")].forEach((item) => {
      hideAchievementModal(elements, item);
    });
    return;
  }

  window.clearTimeout(achievementModalTimers.get(modal));
  achievementModalTimers.delete(modal);
  modal.classList.remove("is-visible");
  modal.classList.remove("is-celebrating");
  modal.setAttribute("aria-hidden", "true");

  window.setTimeout(() => {
    if (!modal.classList.contains("is-visible")) {
      modal.remove();
    }
  }, 220);
}

export function renderAchievementCelebration(panel) {
  const existingBurst = panel.querySelector(".achievement-burst");

  existingBurst?.remove();

  const burst = createElement("span", {
    className: "achievement-burst",
    attributes: { "aria-hidden": "true" },
  });

  for (let index = 0; index < 10; index += 1) {
    const particle = createElement("i");
    particle.style.setProperty("--index", index);
    burst.append(particle);
  }

  panel.append(burst);
}

export function getSelectedCatchUpDates(elements) {
  return Array.from(elements.catchUpList.querySelectorAll("input[type='checkbox']:checked")).map(
    (checkbox) => checkbox.value,
  );
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

function createAchievementCard({ achievement, unlockedDateKey, isNext = false }, stats, activeStreak) {
  const isUnlocked = Boolean(unlockedDateKey);
  const progress = isUnlocked
    ? { current: achievement.target, target: achievement.target, ratio: 1 }
    : getAchievementProgress(achievement, stats, activeStreak);
  const card = createElement("article", {
    className: `achievement-card achievement-card--${getAchievementTier(achievement)}`,
    attributes: {
      "aria-label": isUnlocked
        ? `${achievement.name}, ${getAchievementGoalLabel(achievement)}, conseguido el ${formatDateKey(
            unlockedDateKey,
          )}`
        : `${achievement.name}, ${getAchievementGoalLabel(
            achievement,
          )}, ${getAchievementProgressText(achievement, stats, activeStreak)}`,
    },
  });

  card.classList.toggle("achievement-card--unlocked", isUnlocked);
  card.classList.toggle("achievement-card--locked", !isUnlocked);
  card.classList.toggle("achievement-card--next", isNext);

  const badge = createElement("span", {
    className: "achievement-card__days",
    text: getAchievementBadge(achievement),
  });
  const stateIcon = createElement("span", {
    className: "achievement-card__state",
    text: isUnlocked ? "✓" : isNext ? "→" : "○",
    attributes: { "aria-hidden": "true" },
  });
  const title = createElement("strong", { text: achievement.name });
  const detail = createElement("span", {
    className: "achievement-card__date",
    text: isUnlocked
      ? `Conseguido el ${formatDateKey(unlockedDateKey)}`
      : getAchievementProgressText(achievement, stats, activeStreak),
  });
  const progressValue = createElement("span");
  const progressBar = createElement("span", {
    className: "achievement-card__progress",
    attributes: { "aria-hidden": "true" },
  });

  progressValue.style.width = `${Math.round(progress.ratio * 100)}%`;
  progressBar.append(progressValue);
  card.append(badge, stateIcon, title, detail, progressBar);
  return card;
}

function getDayStatus(isComplete, isToday, isFuture) {
  if (isComplete) return "Listo";
  if (isToday) return "Hoy";
  if (isFuture) return "Futuro";
  return "";
}

function getDayAriaLabel(date, isComplete, isToday, isFuture, hasNote) {
  const labels = [longDateFormatter.format(date)];

  if (isComplete) labels.push("completado");
  if (isToday) labels.push("hoy");
  if (isFuture) labels.push("futuro");
  if (hasNote) labels.push("con nota");

  return capitalize(labels.join(", "));
}
