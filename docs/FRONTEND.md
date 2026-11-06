# Padrões do frontend

O site usa HTML, CSS e módulos JavaScript nativos. Os componentes compartilhados são a fonte de verdade; páginas combinam esses componentes e acrescentam somente seu layout e conteúdo.

## Responsabilidades

| Local | Responsabilidade |
| --- | --- |
| `css/base.css` | Cores dos temas, fontes, medidas compartilhadas, reset e foco por teclado |
| `css/components.css` | Botões, campos, avisos de formulário, badges e hero compartilhada |
| `css/layout.css` | Cabeçalho, menu, rodapé e suas adaptações para celular |
| `css/paginas/` | Layout e elementos exclusivos de cada página |
| `header.html` e `footer.html` | Conteúdo único da navegação e do rodapé |
| `js/core/` | Inicialização, fragmentos, caminhos e aplicação antecipada do tema |
| `js/features/` | Comportamentos compartilhados, com funções `initNome()` |
| `js/pages/` | Comportamentos específicos, com função pública `init()` |

## Botões

Use `btn` junto de uma variante. Links navegam; elementos `button` executam ações. Ambos recebem a mesma tipografia, alinhamento, altura mínima, borda e espaçamento.

```html
<a class="btn btn--primary" href="...">Quero participar</a>
<button class="btn btn--primary" type="submit">Enviar mensagem</button>
<a class="btn btn--secondary" href="...">Conhecer o programa</a>
<a class="btn btn--soft btn--small" href="..." download>Baixar PDF</a>
```

`btn--primary` mantém como referência o botão de acompanhar o Instagram: fonte de `.88rem`, peso 700 e altura de linha 1.65. Não sobrescreva fontes, padding ou cores de `.btn` em um CSS de página. Se uma nova variação for necessária, crie uma variante compartilhada. Estados `disabled` são centralizados; formulários com `aria-busy="true"` indicam envio em andamento. Filtros, acordeões e botões de ícone continuam sendo controles especializados.

## Formulários

Use `form-field` para agrupar rótulo e campo, `form-control` no input/textarea, `form-note` na orientação e `form-status` para retorno do envio. Associe rótulos com `for`/`id`, orientações com `aria-describedby` e mensagens com `role="status"`. Cada formulário define regras de validação e sua disposição responsiva. Nome, telefone/WhatsApp e mensagem do contato são obrigatórios.

## Páginas e acessibilidade

- Um único `h1` por página; `h2` para seções e `h3` para subseções.
- Conteúdo principal em `<main id="conteudo" tabindex="-1">`, destino do link de pular navegação.
- Cabeçalho e rodapé usam os pontos de montagem `data-include`, sem cópias locais.
- Ordem de estilos: base, layout, componentes, página.
- `theme-preload.js` é carregado como script clássico no head para aplicar o tema antes de mostrar a página. `main.js` é um módulo e inicializa os controles após carregar os fragmentos.
- Caminhos nos fragmentos são relativos à raiz do projeto; JavaScript usa `projectHref()` ou `projectUrl()`. Não use caminhos que dependam de o site estar na raiz do domínio.
- Foco por teclado é definido em `base.css`, com uma cor por tema. Evite regras locais que removam ou substituam o indicador de foco.

## Manutenção

Use nomes de classes e arquivos em kebab-case, funções JavaScript em camelCase e textos da interface em português. O `.editorconfig` define UTF-8, LF e indentação de dois espaços (quatro no Python). Preserve a formatação das áreas não alteradas.

Antes de concluir uma mudança no frontend, execute `node --test`. Use `SITE_URL` para incluir os testes HTTP com o servidor local ativo. O validador Python e o empacotamento são executados no GitHub Actions; para editar e visualizar o frontend localmente, Python é opcional. Confira as telas afetadas nos dois temas, em desktop e celular, e teste teclado, menu e formulários. Testes com respostas simuladas não comprovam entrega real de e-mail.
