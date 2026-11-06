# Diretrizes para agentes no projeto MNC

## Contexto

Este repositório contém o site institucional do projeto de extensão Mulheres na Computação (MNC), da UEPB. Consulte o README para a arquitetura e os comandos atuais.

## Arquitetura

- O site é estático e usa HTML, CSS e JavaScript em módulos ES6.
- Não há framework, bundler ou dependências de frontend em produção. O `package.json` configura os testes nativos do Node.js e o servidor local.
- `index.html` fica na raiz; as demais páginas ficam em `paginas/`.
- Cada página mantém seu documento HTML, estilos, scripts e conteúdo. Cabeçalho e rodapé são carregados dos arquivos compartilhados `header.html` e `footer.html` por `js/core/includes.js`, antes da inicialização dos controles. Não há build para desenvolvimento.
- `js/main.js` é o ponto de entrada e delega a inicialização a `js/core/bootstrap.js`.
- A galeria é gerada a partir de `data/timeline.json`.
- `tools/converter_fotos.py` converte fotos para WebP, gera miniaturas e atualiza a timeline.
- `tools/build_site.py` copia os arquivos públicos para `_site` somente para publicação; `tools/validar_site.py` verifica a raiz por padrão ou a pasta passada como argumento.

## Regras de implementação

- Siga os componentes e convenções definidos em `docs/FRONTEND.md`; botões de ação usam `btn` e uma variante compartilhada, e campos usam `form-control`. Não crie sobrescritas locais para esses componentes.
- Preserve o uso de HTML, CSS e JavaScript puros, salvo solicitação explícita para mudar a arquitetura.
- Reutilize as variáveis e componentes CSS existentes antes de criar estilos duplicados.
- Coloque estilos específicos em `css/paginas/` e estilos compartilhados nos arquivos globais adequados.
- Use `js/core/paths.js` para recursos carregados pelo JavaScript.
- Edite navegação e rodapé somente em `header.html` e `footer.html`; não duplique esse conteúdo nas páginas. Mantenha os pontos de montagem com `data-include` e preserve os identificadores usados em `js/features/navigation.js`. Os caminhos dos fragmentos são relativos à raiz do projeto.
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

Sirva a raiz por HTTP usando Live Server ou o comando abaixo, pois módulos ES6 e chamadas `fetch` podem falhar com arquivos abertos diretamente:

```bash
node tools/serve_site.js
```

Após uma alteração, verifique pelo menos:

- a página inicial e a página modificada;
- o carregamento do cabeçalho e do rodapé;
- os links e caminhos de imagens;
- os temas claro e escuro;
- uma largura de desktop e uma largura de celular;
- o console do navegador, sem novos erros.

Execute também os testes locais:

```bash
node --test
```

O GitHub Actions executa o validador Python e processa fotos originais com Pillow. Se precisar reproduzir o processamento das fotos localmente, instale Pillow e execute:

```bash
python -m pip install Pillow
python tools/converter_fotos.py
```

## Escopo das mudanças

- Faça alterações pequenas e focadas no pedido atual.
- Preserve conteúdo institucional existente, salvo quando a atualização for solicitada.
- Não reformule toda a identidade visual para corrigir um problema localizado.
- Atualize a documentação quando mudar a estrutura, o processo de execução ou o fluxo da galeria.
