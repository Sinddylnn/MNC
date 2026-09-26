/* ========================================================================
   FORMULÁRIO DE INSCRIÇÃO - ES6 MODULE
   ======================================================================== */

function atualizarStatus(elemento, mensagem, tipo) {
  elemento.textContent = mensagem;
  elemento.className = `form-status ${tipo}`;
}

/**
 * Envia o formulário sem recarregar a página e apresenta mensagens
 * acessíveis de andamento, sucesso e erro.
 */
export function inicializarFormularioInscricao() {
  const formulario = document.querySelector('.participate-form');
  if (!formulario) return;

  const botao = formulario.querySelector('[type="submit"]');
  const status = formulario.querySelector('.form-status');
  const endpoint = formulario.dataset.endpoint?.trim();
  const textoOriginal = botao.textContent;
  let enviando = false;

  formulario.addEventListener('submit', async event => {
    event.preventDefault();

    if (enviando) return;
    if (!formulario.reportValidity()) return;

    if (!endpoint) {
      atualizarStatus(
        status,
        'O envio online ainda não está configurado. Entre em contato pelo e-mail mnc.uepb@gmail.com.',
        'erro'
      );
      return;
    }

    enviando = true;
    botao.disabled = true;
    botao.textContent = 'Enviando...';
    atualizarStatus(status, 'Enviando sua inscrição...', 'enviando');

    try {
      const resposta = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(formulario),
        headers: { Accept: 'application/json' }
      });

      if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);

      formulario.reset();
      atualizarStatus(
        status,
        'Inscrição enviada! Entraremos em contato com os próximos passos.',
        'sucesso'
      );
    } catch (erro) {
      console.error('Erro ao enviar inscrição:', erro);
      atualizarStatus(
        status,
        'Não foi possível enviar agora. Tente novamente ou escreva para mnc.uepb@gmail.com.',
        'erro'
      );
    } finally {
      enviando = false;
      botao.disabled = false;
      botao.textContent = textoOriginal;
    }
  });
}
