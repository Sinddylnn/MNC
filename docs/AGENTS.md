# Diretrizes para agentes no projeto MNC

## Contexto

Este repositório contém o site institucional do projeto de extensão Mulheres na Computação (MNC), da UEPB. Antes de fazer alterações amplas, consulte `INFORMACOES_PROJETO.md`. As melhorias já identificadas estão registradas em `MELHORIAS_SUGERIDAS.md`.

## Arquitetura

- O site é estático e usa HTML, CSS e JavaScript em módulos ES6.
- Não há framework, `package.json`, bundler ou etapa de compilação.
- `index.html` fica na raiz; as demais páginas ficam em `paginas/`.
- `header.html` e `footer.html` são fragmentos carregados por `js/ui.js`.
- `js/main.js` é o ponto de entrada de todas as páginas.
- A galeria é gerada a partir de `data/timeline.json`.
- `tools/converter_fotos.py` converte fotos para WebP, gera miniaturas e atualiza a timeline.
- `tools/validar_site.py` verifica a estrutura publicada, os caminhos locais e a consistência da galeria.

## Regras de implementação

- Preserve o uso de HTML, CSS e JavaScript puros, salvo solicitação explícita para mudar a arquitetura.
- Reutilize as variáveis e componentes CSS existentes antes de criar estilos duplicados.
- Coloque estilos específicos em `css/paginas/` e estilos compartilhados nos arquivos globais adequados.
- Considere a diferença entre caminhos relativos da raiz (`./`) e de `paginas/` (`../`).
- Ao alterar a navegação, mantenha `header.html`, `footer.html` e o `navMap` de `js/ui.js` consistentes.
- Preserve os temas claro e escuro e valide os dois após mudanças visuais.
- Mantenha a interface responsiva e navegável por teclado.
- Use HTML semântico, rótulos de formulário, textos alternativos e estados de foco visíveis.
- Não invente nomes, cargos, e-mails, métricas ou outros dados institucionais. Use marcadores claros quando o dado depender da equipe do MNC.
- Não inclua credenciais, tokens ou endpoints privados no repositório.

## Galeria

- Prefira atualizar a galeria por meio de `tools/converter_fotos.py`.
- Não edite `data/timeline.json` manualmente quando o script puder gerar a mudança.
- Preserve a estrutura `imagens/galeria/<categoria>/<data-ou-ano>/`.
- Preserve a estrutura equivalente em `imagens/miniaturas/` e os metadados de dimensões da timeline.
- Trate `escola` e `escolas` como categorias com apresentação em acordeão.
- Não remova fotos nem arquivos gerados sem confirmar que não são mais utilizados.
- Use `--limpar-orfaos` somente quando a remoção dos arquivos sem original for desejada.

## Execução e verificação

Sirva o projeto por HTTP, pois módulos ES6 e chamadas `fetch` podem falhar com arquivos abertos diretamente:

```bash
python -m http.server 8000
```

Após uma alteração, verifique pelo menos:

- a página inicial e a página modificada;
- o carregamento do cabeçalho e do rodapé;
- os links e caminhos de imagens;
- os temas claro e escuro;
- uma largura de desktop e uma largura de celular;
- o console do navegador, sem novos erros.

Execute também o validador automatizado:

```bash
python tools/validar_site.py
```

Se a mudança afetar fotos, instale Pillow e execute:

```bash
python -m pip install Pillow
python tools/converter_fotos.py
```

## Escopo das mudanças

- Faça alterações pequenas e focadas no pedido atual.
- Preserve conteúdo institucional existente, salvo quando a atualização for solicitada.
- Não reformule toda a identidade visual para corrigir um problema localizado.
- Atualize a documentação quando mudar a estrutura, o processo de execução ou o fluxo da galeria.
