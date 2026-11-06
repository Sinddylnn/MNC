export function init() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const button = form.querySelector('button[type="submit"]');
  const status = document.getElementById('contact-status');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (button.disabled || !form.reportValidity()) return;

    const fields = new FormData(form);
    if (String(fields.get('_honey') || '').trim()) return;
    const name = String(fields.get('nome') || '').trim();
    const phone = String(fields.get('telefone') || '').trim();
    if (!name || !phone) {
      status.textContent = 'Preencha seu nome e telefone/WhatsApp antes de enviar.';
      form.elements.namedItem(!name ? 'nome' : 'telefone').focus();
      return;
    }
    const message = String(fields.get('mensagem') || '').trim();
    if (!message) {
      status.textContent = 'Escreva uma mensagem antes de enviar.';
      form.elements.namedItem('mensagem').focus();
      return;
    }

    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Enviando sua mensagem…';

    try {
      const response = await fetch('https://formsubmit.co/ajax/mnc.uepb@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...Object.fromEntries(fields),
          nome: name,
          telefone: phone,
          mensagem: message
        }),
        signal: AbortSignal.timeout(20000)
      });
      const result = await response.json();
      if (!response.ok || !(result.success === true || result.success === 'true')) {
        throw new Error('Envio não confirmado pelo serviço');
      }
      status.textContent = 'Mensagem recebida pelo serviço de envio. Obrigada pelo contato!';
      form.reset();
    } catch {
      status.textContent = 'Não foi possível confirmar o envio. Sua mensagem foi mantida. Tente novamente em alguns instantes ou escreva para mnc.uepb@gmail.com.';
    } finally {
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
}
