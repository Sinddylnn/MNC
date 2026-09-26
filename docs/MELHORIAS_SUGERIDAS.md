# Melhorias sugeridas para o projeto MNC

Este documento reúne oportunidades encontradas durante a análise inicial do projeto. Ele serve como lista de referência; os itens não precisam ser implementados todos de uma vez.

## Prioridade 1 — pendências

### Ativar o envio das inscrições

O comportamento do formulário já está implementado em `js/inscricao.js`, incluindo mensagens de andamento, sucesso e erro e proteção contra envios duplicados.

Ainda falta:

- [ ] escolher ou confirmar o serviço que receberá as inscrições;
- [ ] fornecer o endpoint HTTPS desse serviço;
- [ ] preencher o atributo `data-endpoint` em `paginas/inscricao.html`;
- [ ] fazer um envio real de teste e confirmar onde a inscrição foi recebida.

### Completar os dados da equipe

A página não contém mais cargos falsos, e-mails inválidos ou avatares externos. Até que os dados oficiais sejam fornecidos, ela apresenta as iniciais das integrantes e o contato geral do MNC.

| Integrante | Cargo | Foto local | Contato individual |
|---|---|---|---|
| Luciana | Coordenadora — confirmado | Pendente | Pendente ou dispensável |
| Sinddy | Pendente | Pendente | Pendente ou dispensável |
| Jasmine | Pendente | Pendente | Pendente ou dispensável |
| Sonally | Pendente | Pendente | Pendente ou dispensável |
| Julia | Pendente | Pendente | Pendente ou dispensável |

Ainda falta:

- [ ] confirmar os cargos das integrantes;
- [ ] fornecer as fotos que devem aparecer no site;
- [ ] decidir se haverá contato individual ou somente o e-mail geral;
- [ ] adicionar as imagens em uma pasta local e otimizá-las;
- [ ] revisar a página completa com os dados definitivos.

### Itens concluídos

- [x] Remover a referência à folha de estilo inexistente.
- [x] Adicionar a página da equipe ao cabeçalho e ao rodapé.
- [x] Manter o estado ativo do link “Equipe” pelo `navMap` de `js/ui.js`.
- [x] Remover cargos provisórios, links `mailto:#` e avatares externos.
- [x] Adicionar ao formulário os estados de envio, sucesso e erro.
- [x] Impedir envios duplicados enquanto uma solicitação estiver em andamento.

## Prioridade 2 — concluída

- [x] Criar um menu compacto para telas menores que 900 px.
- [x] Identificar o botão do menu e expor seu estado com `aria-expanded`.
- [x] Permitir fechar o menu por botão, link, tecla `Escape` ou mudança para desktop.
- [x] Marcar a página atual com `aria-current="page"`.
- [x] Permitir abrir as fotos da galeria com `Enter` ou barra de espaço.
- [x] Transformar o lightbox em um diálogo identificado e isolado com `inert` quando fechado.
- [x] Mover o foco para o botão de fechar e devolvê-lo à foto de origem.
- [x] Manter o foco dentro do lightbox enquanto ele estiver aberto.
- [x] Corrigir `aria-expanded` e `aria-controls` no acordeão de escolas.
- [x] Expor o estado dos filtros da galeria com `aria-pressed`.
- [x] Desativar transições de página e reduzir animações com `prefers-reduced-motion`.
- [x] Adicionar estados globais de `focus-visible` nos elementos interativos.
- [x] Revisar os textos alternativos das imagens e ocultar elementos visuais decorativos.
- [x] Corrigir a duplicação do elemento `<main>` na página da galeria.
- [x] Validar visualmente a galeria em larguras de 500 px e 1440 px.
- [x] Validar visualmente o menu móvel aberto.

## Prioridade 3 — concluída

- [x] Remover `css/style.css` e distribuir suas regras compartilhadas entre `base.css`, `layout.css` e `components.css`.
- [x] Manter em `css/paginas/index.css` somente as regras específicas da página inicial.
- [x] Reconverter um WebP quando a imagem original for mais recente.
- [x] Corrigir a orientação EXIF antes da conversão.
- [x] Gerar miniaturas WebP de até 640 × 640 px para as grades da galeria.
- [x] Preservar arquivos órfãos por padrão e oferecer a opção explícita `--limpar-orfaos`.
- [x] Validar nomes de categorias e datas antes de gerar a timeline.
- [x] Registrar largura, altura e caminho da miniatura no `timeline.json`.
- [x] Usar as dimensões intrínsecas nas imagens para reservar espaço durante o carregamento.
- [x] Abrir a imagem completa no lightbox mesmo quando a grade usa a miniatura.
- [x] Tornar o e-mail do rodapé clicável.
- [x] Proteger links que abrem outra aba com `rel="noopener noreferrer"`.
- [x] Manter as fontes do Google com `display=swap` e alternativas de sistema já definidas nas variáveis CSS.
- [x] Manter no repositório as imagens essenciais e as fotos publicadas.

## Prioridade 4 — concluída

- [x] Criar `tools/validar_site.py` para verificar a estrutura HTML e os caminhos locais.
- [x] Verificar imagens sem texto alternativo e links `_blank` sem proteção.
- [x] Verificar referências em CSS e importações relativas dos módulos JavaScript.
- [x] Validar categorias, datas, dimensões, fotos e miniaturas do `timeline.json`.
- [x] Executar `node --check` em todos os módulos JavaScript no CI.
- [x] Criar um workflow reutilizável para branches, pull requests e execução manual.
- [x] Impedir a publicação quando qualquer validação falhar.
- [x] Montar um artefato somente com os arquivos públicos do site.
- [x] Publicar automaticamente no GitHub Pages após pushes na branch `main`.
- [x] Permitir publicação manual pelo GitHub Actions.
- [x] Evitar publicações concorrentes e expor a URL gerada no ambiente `github-pages`.
- [x] Documentar a execução local, os gatilhos e a ativação inicial do GitHub Pages.

## Próximos passos recomendados

1. Fornecer o endpoint do formulário e os dados definitivos da equipe para encerrar a Prioridade 1.
2. Após integrar as mudanças à `main`, selecionar **GitHub Actions** como fonte em **Settings → Pages**.
