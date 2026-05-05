export function createElement(tagName, options = {}, children = []) {
  const element = document.createElement(tagName);
  const childNodes = Array.isArray(children) ? children : [children];

  if (options.className) {
    element.className = options.className;
  }

  if (options.text !== undefined) {
    element.textContent = options.text;
  }

  if (options.html !== undefined) {
    element.innerHTML = options.html;
  }

  if (options.type) {
    element.type = options.type;
  }

  Object.entries(options.dataset || {}).forEach(([key, value]) => {
    element.dataset[key] = value;
  });

  Object.entries(options.attributes || {}).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  childNodes.filter(Boolean).forEach((child) => element.append(child));
  return element;
}

export function showModal({ modal, focusTarget, updateModalLock }) {
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  updateModalLock();

  window.requestAnimationFrame(() => {
    modal.classList.add("is-visible");
    focusTarget?.focus();
  });
}

export function hideModal({ modal, updateModalLock, afterHide, duration = 180 }) {
  modal.classList.remove("is-visible");
  modal.setAttribute("aria-hidden", "true");
  afterHide?.();

  window.setTimeout(() => {
    if (!modal.classList.contains("is-visible")) {
      modal.hidden = true;
      updateModalLock();
    }
  }, duration);
}

export function updateProgressBar(progressBar, progress) {
  const percent = Math.round(progress.ratio * 100);

  progressBar.style.setProperty("--progress", `${percent}%`);
  progressBar.setAttribute("role", "progressbar");
  progressBar.setAttribute("aria-valuemin", "0");
  progressBar.setAttribute("aria-valuemax", String(progress.target));
  progressBar.setAttribute("aria-valuenow", String(Math.min(progress.current, progress.target)));
}
