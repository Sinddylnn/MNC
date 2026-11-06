// Script clássico executado no <head> para aplicar o tema antes da renderização.
(() => {
  let theme = 'dark';
  try {
    if (localStorage.getItem('mnc-theme') === 'light') theme = 'light';
  } catch {
    // O site também funciona quando o navegador bloqueia armazenamento local.
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
