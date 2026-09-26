# Informações do projeto MNC

## Visão geral

O **Mulheres na Computação (MNC)** é um site institucional do projeto de extensão da Universidade Estadual da Paraíba (UEPB), Campus I, em Campina Grande. O projeto foi criado em 2020 e atua no acolhimento, formação e incentivo à participação de meninas e mulheres na computação.

O site apresenta o projeto, sua programação, equipe, publicações, registros fotográficos e um formulário de inscrição. O repositório está disponível em [github.com/Sinddylnn/MNC](https://github.com/Sinddylnn/MNC) e usa a licença MIT.

Documentos relacionados:

- `MELHORIAS_SUGERIDAS.md`: lista priorizada de melhorias possíveis;
- `AGENTS.md`: diretrizes do projeto para o Codex e outros agentes de código.

## Tecnologias

- HTML5 para a estrutura das páginas;
- CSS3 modular, com estilos globais e específicos por página;
- JavaScript em módulos ES6, sem framework;
- Canvas API para a animação de transição entre páginas;
- `fetch` para carregar cabeçalho, rodapé e dados da galeria;
- `localStorage` para salvar a preferência de tema claro ou escuro;
- Python 3 e Pillow para converter imagens em WebP;
- GitHub Actions para automatizar a otimização das imagens.

O frontend não possui etapa de compilação, `package.json` ou dependências Node.js.

## Páginas

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Página inicial, apresentação do MNC, impacto, ações e destaques |
| `paginas/programa.html` | Objetivos do programa e matérias sobre o projeto |
| `paginas/equipe.html` | Integrantes e funções da equipe |
| `paginas/galeria.html` | Galeria dinâmica com filtros, linha do tempo, acordeão e lightbox |
| `paginas/artigos.html` | Publicações acadêmicas e download dos PDFs |
| `paginas/inscricao.html` | Formulário para novas participantes |

O cabeçalho e o rodapé ficam em `header.html` e `footer.html`. Eles são carregados em todas as páginas pelo módulo `js/ui.js`.

## Estrutura principal

```text
MNC/
├── .github/workflows/otimizar-imagens.yml
├── .github/workflows/publicar-site.yml
├── .github/workflows/validar-site.yml
├── AGENTS.md
├── INFORMACOES_PROJETO.md
├── MELHORIAS_SUGERIDAS.md
├── css/
│   ├── base.css
│   ├── components.css
│   ├── layout.css
│   └── paginas/
├── data/timeline.json
├── imagens/
│   ├── galeria/
│   ├── miniaturas/
│   └── logo_mnc2__1_.png
├── js/
│   ├── acordeao.js
│   ├── animacoes.js
│   ├── galeria.js
│   ├── main.js
│   ├── ui.js
│   └── utils.js
├── paginas/
├── pdfs/
├── tools/converter_fotos.py
├── tools/validar_site.py
├── footer.html
├── header.html
└── index.html
```

## Organização do JavaScript

| Arquivo | Responsabilidade |
|---|---|
| `js/main.js` | Ponto de entrada; inicializa interface, animações e galeria |
| `js/ui.js` | Carrega cabeçalho e rodapé, controla tema, menu móvel, navegação ativa e animações de revelação |
| `js/animacoes.js` | Cria a transição visual de circuito em Canvas entre páginas internas |
| `js/galeria.js` | Lê o JSON, cria filtros, renderiza fotos e controla o lightbox acessível |
| `js/acordeao.js` | Agrupa e exibe as fotos de escolas por ano |
| `js/utils.js` | Funções compartilhadas, correção de caminhos e resumo de artigos |

O fluxo principal do frontend é:

```text
DOMContentLoaded
    ├── carrega header.html e footer.html
    ├── inicializa tema e animações
    └── se a página tiver uma galeria
        ├── lê data/timeline.json
        ├── cria os filtros por categoria
        └── renderiza fotos, acordeão e lightbox
```

## Estilos e identidade visual

Os estilos compartilhados estão divididos desta forma:

- `css/base.css`: variáveis, fontes, temas e regras básicas;
- `css/layout.css`: cabeçalho, navegação e rodapé;
- `css/components.css`: componentes reutilizáveis;
- `css/paginas/*.css`: regras específicas de cada página.

A interface oferece temas escuro e claro. A escolha é armazenada no navegador com a chave `mnc-theme`. As fontes DM Serif Display, Poppins e JetBrains Mono são carregadas do Google Fonts com `display=swap`; as variáveis tipográficas também definem fontes de sistema como alternativas caso o serviço não esteja disponível.

Em telas menores que 900 px, a navegação é apresentada em um menu expansível operável por teclado. O site respeita `prefers-reduced-motion`, possui estados de foco visíveis e permite operar o lightbox da galeria por teclado.

## Como executar localmente

Como o projeto usa `fetch` e módulos ES6, ele deve ser aberto por um servidor HTTP. Abrir `index.html` diretamente pelo explorador de arquivos pode bloquear o carregamento de componentes e dados.

Na raiz do projeto, execute:

```bash
python -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

Não é necessário instalar dependências para visualizar o site. Pillow só é necessário para processar novas imagens:

```bash
python -m pip install Pillow
```

## Galeria e processamento de imagens

As fotos originais devem seguir esta estrutura:

```text
imagens/fotos_originais/<categoria>/<YYYY-MM-DD>/*.jpg
```

Para agrupamentos anuais, como a categoria `escolas`, a pasta também pode usar apenas o ano:

```text
imagens/fotos_originais/escolas/<YYYY>/*.png
```

Execute o conversor a partir da raiz:

```bash
python tools/converter_fotos.py
```

O script:

1. lê arquivos PNG, JPG e JPEG em `imagens/fotos_originais/`;
2. corrige a orientação registrada nos dados EXIF;
3. cria versões WebP com qualidade 80 em `imagens/galeria/`;
4. gera miniaturas de até 640 × 640 px em `imagens/miniaturas/`;
5. reconverte os arquivos quando o original é mais recente;
6. preserva a organização por categoria e data;
7. valida os nomes de categoria e as datas antes de incluí-los;
8. gera `data/timeline.json` em ordem cronológica decrescente, com dimensões e caminho da miniatura.

O conversor preserva arquivos antigos por padrão. A opção `--limpar-orfaos` remove explicitamente os WebPs da galeria e das miniaturas que não possuem mais um original correspondente:

```bash
python tools/converter_fotos.py --limpar-orfaos
```

Atualmente, `timeline.json` possui as categorias `encontros` e `escolas`. A galeria usa uma apresentação especial em acordeão para `escola` ou `escolas`; as demais categorias aparecem como itens da linha do tempo.

## Automação

O workflow `.github/workflows/otimizar-imagens.yml` instala Python e Pillow, executa o conversor e envia alterações em `imagens/galeria/`, `imagens/miniaturas/` e `data/timeline.json` para o repositório.

Ele pode ser iniciado manualmente pelo GitHub Actions. Também está configurado para reagir a alterações em `imagens/fotos_originais/**`, mas essa pasta consta no `.gitignore`; portanto, esse gatilho só funciona para arquivos que forem efetivamente adicionados ao Git.

O workflow `.github/workflows/validar-site.yml` executa `tools/validar_site.py` e `node --check` nos módulos JavaScript. Ele roda em pushes para branches diferentes de `main`, em pull requests destinados à `main`, manualmente e como etapa reutilizável da publicação.

O workflow `.github/workflows/publicar-site.yml` é acionado por pushes na `main` ou manualmente. Primeiro reutiliza a validação; depois monta `_site` somente com HTML, CSS, JavaScript, dados, imagens e PDFs e publica o artefato no ambiente `github-pages`. A concorrência cancela uma publicação antiga quando uma versão mais nova entra na fila.

Para habilitar a primeira publicação, selecione **GitHub Actions** como fonte em **Settings → Pages → Build and deployment** no GitHub. Essa é uma configuração única do repositório.

## Dependências e serviços externos

- Google Fonts para as fontes da interface;
- um serviço de formulário ainda a definir para receber as inscrições;
- páginas do G1 usadas como links de destaque;
- Instagram e LinkedIn no rodapé.

## Pontos pendentes antes da publicação

- Preencher o atributo `data-endpoint` de `paginas/inscricao.html` com um endpoint válido do serviço de formulário escolhido.
- Preencher cargos, fotos locais e contatos individuais confirmados em `paginas/equipe.html`. Até lá, a página exibe iniciais e somente o cargo confirmado da coordenadora.
- Ativar **GitHub Actions** como fonte do GitHub Pages após integrar os workflows à branch `main`.
- Atualizar os números institucionais sempre que houver novos artigos, participantes ou anos de atuação.

## Cuidados ao alterar o projeto

- Preserve os caminhos relativos diferentes entre `index.html` e os arquivos dentro de `paginas/`.
- Mantenha `header.html` e `footer.html` sem a estrutura completa de uma página, pois eles são fragmentos injetados via JavaScript.
- Ao criar uma página, inclua os contêineres `#main-header` e `#main-footer` e carregue `js/main.js` como módulo.
- Ao adicionar uma entrada ao menu, atualize também o `navMap` em `js/ui.js` para que o link ativo seja marcado corretamente.
- Prefira alterar as variáveis de `css/base.css` para mudanças globais de cores, fontes, espaçamentos e temas.
- Não edite `data/timeline.json` manualmente quando a mudança puder ser produzida por `tools/converter_fotos.py`.
- Execute `python tools/validar_site.py` antes de enviar alterações estruturais ou de conteúdo.

## Licença e autoria

O projeto usa a licença MIT. O arquivo `LICENSE` registra copyright de 2026 para Sinddy Lorrany.
