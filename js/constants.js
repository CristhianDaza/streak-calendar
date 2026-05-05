export const STORAGE_KEY = "streak-calendar:v1";
export const ACHIEVEMENT_STORAGE_KEY = "streak-calendar:achievements:v1";
export const NOTES_STORAGE_KEY = "streak-calendar:notes:v1";
export const THEME_STORAGE_KEY = "streak-calendar:theme:v1";
export const STREAKS_STORAGE_KEY = "streak-calendar:streaks:v2";
export const EXPORT_VERSION = 2;
export const DEFAULT_THEME = "ocean-dark";
export const DEFAULT_STREAK_ID = "streak-default";
export const DEFAULT_STREAK_NAME = "Mi racha";
export const MAX_STREAK_NAME_LENGTH = 40;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const ACHIEVEMENT_MODAL_TIMEOUT = 5200;

export const THEME_IDS = new Set([
  "ocean-dark",
  "forest-dark",
  "grape-dark",
  "sunrise-light",
  "mint-light",
  "lavender-light",
]);

export const ACHIEVEMENTS = [
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

export const ACHIEVEMENT_IDS = new Set(ACHIEVEMENTS.map((achievement) => achievement.id));
export const ACHIEVEMENT_ORDER = new Map(
  ACHIEVEMENTS.map((achievement, index) => [achievement.id, index]),
);
