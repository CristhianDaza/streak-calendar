export const STORAGE_KEY = "streak-calendar:v1";
export const ACHIEVEMENT_STORAGE_KEY = "streak-calendar:achievements:v1";
export const NOTES_STORAGE_KEY = "streak-calendar:notes:v1";
export const THEME_STORAGE_KEY = "streak-calendar:theme:v1";
export const STREAKS_STORAGE_KEY = "streak-calendar:streaks:v2";
export const EXPORT_VERSION = 2;
export const DEFAULT_THEME = "stormy-morning";
export const DEFAULT_STREAK_ID = "streak-default";
export const DEFAULT_STREAK_NAME = "Mi racha";
export const MAX_STREAK_NAME_LENGTH = 40;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const ACHIEVEMENT_MODAL_TIMEOUT = 5200;

export const THEME_IDS = new Set([
  "stormy-morning",
  "blue-eclipse",
  "ink-wash",
  "wisteria-bloom",
  "desert-dusk",
  "cherry-blossom",
]);

export const ACHIEVEMENTS = [
  { id: "day-1", type: "streak", target: 1, name: "El comienzo" },
  { id: "day-2", type: "streak", target: 2, name: "Segundo paso" },
  { id: "day-3", type: "streak", target: 3, name: "En marcha" },
  { id: "day-5", type: "streak", target: 5, name: "Ritmo inicial" },
  { id: "day-7", type: "streak", target: 7, name: "Primera semana" },
  { id: "day-10", type: "streak", target: 10, name: "Diez días firmes" },
  { id: "day-14", type: "streak", target: 14, name: "Dos semanas" },
  { id: "day-15", type: "streak", target: 15, name: "Disciplina real" },
  { id: "day-21", type: "streak", target: 21, name: "Hábito formado" },
  { id: "day-30", type: "streak", target: 30, name: "Un mes de éxito" },
  { id: "day-45", type: "streak", target: 45, name: "Constancia clara" },
  { id: "day-50", type: "streak", target: 50, name: "Imparable" },
  { id: "day-60", type: "streak", target: 60, name: "Dos meses fuertes" },
  { id: "day-66", type: "streak", target: 66, name: "Conducta automática" },
  { id: "day-75", type: "streak", target: 75, name: "Impulso sostenido" },
  { id: "day-90", type: "streak", target: 90, name: "Trimestre dorado" },
  { id: "day-100", type: "streak", target: 100, name: "Centurión" },
  { id: "day-120", type: "streak", target: 120, name: "Cuatro meses" },
  { id: "day-150", type: "streak", target: 150, name: "Determinación de acero" },
  { id: "day-180", type: "streak", target: 180, name: "Medio Año de victoria" },
  { id: "day-200", type: "streak", target: 200, name: "Doble centuria" },
  { id: "day-250", type: "streak", target: 250, name: "Referente de constancia" },
  { id: "day-270", type: "streak", target: 270, name: "Nueve meses" },
  { id: "day-300", type: "streak", target: 300, name: "Maestro de la voluntad" },
  { id: "day-330", type: "streak", target: 330, name: "Recta final anual" },
  { id: "day-365", type: "streak", target: 365, name: "Un año de transformación" },
  { id: "day-400", type: "streak", target: 400, name: "Más allá del año" },
  { id: "day-500", type: "streak", target: 500, name: "Quinientos días" },
  { id: "day-600", type: "streak", target: 600, name: "Voluntad extendida" },
  { id: "day-730", type: "streak", target: 730, name: "Dos años imparables" },
  { id: "total-10", type: "total", target: 10, name: "Diez marcas totales" },
  { id: "total-30", type: "total", target: 30, name: "Treinta días acumulados" },
  { id: "total-50", type: "total", target: 50, name: "Cincuenta cumplimientos" },
  { id: "total-100", type: "total", target: 100, name: "Cien días marcados" },
  { id: "total-200", type: "total", target: 200, name: "Doscientos días totales" },
  { id: "total-365", type: "total", target: 365, name: "Año acumulado" },
  { id: "perfect-month-1", type: "perfect-month", target: 1, name: "Mes perfecto" },
  { id: "recovery-1", type: "recovery", target: 1, name: "Racha rescatada" },
  { id: "weekend-1", type: "weekend", target: 1, name: "Fin de semana completo" },
  { id: "weekend-4", type: "weekend", target: 4, name: "Cuatro fines de semana" },
  { id: "weekend-12", type: "weekend", target: 12, name: "Doce fines de semana" },
];

export const ACHIEVEMENT_IDS = new Set(ACHIEVEMENTS.map((achievement) => achievement.id));
export const ACHIEVEMENT_ORDER = new Map(
  ACHIEVEMENTS.map((achievement, index) => [achievement.id, index]),
);
