const STORAGE_KEY = 'mnc-theme';

function updateThemeLabel(button, root) {
  if (!button) return;
  const darkTheme = root.getAttribute('data-theme') === 'dark';
  button.setAttribute('aria-label', darkTheme ? 'Ativar tema claro' : 'Ativar tema escuro');
}

export function initTheme() {
  const root = document.documentElement;
  const button = document.getElementById('themeToggle');
  if (!button) return;

  updateThemeLabel(button, root);
  button.addEventListener('click', () => {
    const theme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // A troca visual continua disponível mesmo sem persistência.
    }
    updateThemeLabel(button, root);
  });
}
