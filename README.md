# Calendario de Rachas

Sitio web estático para registrar hábitos diarios, mantener rachas, revisar progreso mensual y desbloquear logros. La aplicación funciona como PWA, guarda los datos en el navegador y permite exportar/importar respaldos en formato JSON.

## Características

- Registro diario de cumplimiento.
- Soporte para múltiples rachas.
- Cambio rápido entre rachas activas.
- Edición de días pasados con estado completado y nota.
- Vista mensual con navegación por meses.
- Estadísticas de racha actual, mejor racha, total completado y progreso del mes.
- Recuperación de días omitidos para reconstruir una racha.
- Sistema de logros por racha, total acumulado, meses perfectos, fines de semana completos y recuperación.
- Exportación e importación de respaldos JSON.
- Temas visuales seleccionables.
- Instalación como aplicación web progresiva en navegadores compatibles.
- Funcionamiento offline mediante service worker.

## Tecnologías

Este proyecto no depende de frameworks ni de un proceso de build.

- HTML.
- CSS.
- JavaScript moderno con módulos ES.
- Web App Manifest.
- Service Worker.
- LocalStorage.

## Requisitos

Solo necesitas un navegador moderno. Para probar correctamente los módulos JavaScript y el service worker, sirve el proyecto con un servidor local.

Opciones recomendadas:

- Python 3.
- Node.js con `npx`.
- Cualquier servidor estático.

## Ejecución local

Desde la carpeta del proyecto:

Con Python:

```powershell
python -m http.server 8000
```

Abre:

```text
http://localhost:8000
```

Con Node.js:

```powershell
npx serve .
```

> Abrir `index.html` directamente como archivo puede limitar el comportamiento de módulos, service worker e instalación PWA. Para una prueba real usa HTTP local.

## Uso

1. Abre el sitio en el navegador.
2. Usa **Marcar hoy** para completar el día actual.
3. Crea nuevas rachas desde **Nueva racha**.
4. Cambia entre rachas desde la lista de rachas disponibles.
5. Navega entre meses con los botones de la vista mensual.
6. Selecciona un día pasado para marcarlo, desmarcarlo o añadir una nota.
7. Revisa los logros desbloqueados y el siguiente logro disponible.
8. Exporta tus datos desde **Exportar respaldo** cuando quieras guardarlos fuera del navegador.
9. Importa un respaldo JSON desde **Importar respaldo** para fusionar datos existentes.

## Temas disponibles

La aplicación incluye estos temas:

- `stormy-morning`
- `blue-eclipse`
- `ink-wash`
- `wisteria-bloom`
- `desert-dusk`
- `cherry-blossom`

El tema seleccionado se guarda en `localStorage` y se aplica antes de renderizar la interfaz para evitar cambios visuales bruscos al cargar.

## Persistencia de datos

Los datos se guardan en el navegador usando `localStorage`.

Claves principales:

- `streak-calendar:streaks:v2`: estado actual de rachas.
- `streak-calendar:theme:v1`: tema seleccionado.

La aplicación también puede migrar datos antiguos desde:

- `streak-calendar:v1`
- `streak-calendar:achievements:v1`
- `streak-calendar:notes:v1`

Los datos son locales al navegador y al perfil del usuario. Si se limpia el almacenamiento del sitio, los datos se perderán salvo que exista un respaldo exportado.

## Respaldo e importación

La exportación genera un archivo JSON con nombre similar a:

```text
calendario-rachas-YYYY-MM-DD.json
```

El respaldo incluye:

- versión del formato.
- fecha de exportación.
- racha activa.
- lista de rachas.
- fechas completadas.
- notas por día.
- logros desbloqueados.
- días omitidos en recuperación.

Al importar un respaldo, la aplicación fusiona los datos con el estado actual. Si una racha ya existe, combina fechas completadas, notas y logros en lugar de reemplazar todo el estado.

## PWA y modo offline

El proyecto incluye:

- `manifest.json` para instalación como aplicación.
- `service-worker.js` para cachear archivos esenciales.
- íconos de 192x192 y 512x512.

El service worker cachea los archivos del sitio y responde con `index.html` cuando no hay conexión y la navegación lo requiere.

Para que la instalación y el service worker funcionen, el sitio debe ejecutarse sobre `http://localhost`, `https://` o un origen compatible.

## Logros

Los logros se calculan a partir de las fechas completadas de cada racha. Hay logros por:

- días consecutivos de racha.
- total de días marcados.
- mes perfecto.
- fines de semana completos.
- recuperación de días pasados.

Los hitos principales de racha llegan hasta 730 días.

## Consideraciones

- Los datos no se sincronizan entre dispositivos automáticamente.
- El modo offline depende de que el service worker haya sido instalado previamente.
- La importación espera un respaldo JSON compatible.
- El botón de instalación solo aparece cuando el navegador dispara el evento `beforeinstallprompt`.
- Los días futuros no se pueden editar ni marcar.

## Licencia

Este proyecto no declara una licencia actualmente. Añade una licencia antes de distribuirlo públicamente si quieres definir condiciones de uso, copia o modificación.
