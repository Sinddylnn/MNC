## Sumário

- Visão Geral do Projeto
- Arquitetura e Tecnologias
- Estrutura de arquivos
- Como configurar e rodar localmente
- Executar o script de conversão de imagens
- Fluxo CI/CD (GitHub Actions)
- Guia de manutenção

## Visão Geral do Projeto

O site apresenta páginas institucionais, seção de artigos, equipe, galeria de memórias, formulário de inscrição e a página de Programa (cronogramas e eventos). A galeria é construída dinamicamente pelo frontend a partir do arquivo `data/timeline.json`, gerado pela automação Python.

## Arquitetura e Tecnologias

- **Frontend**
    - HTML5 estático para conteúdo e estrutura.
    - CSS organizado em arquivos modulares (`css/base.css`, `css/components.css`, `css/layout.css`, `css/style.css` e `css/paginas/*`).
    - JavaScript organizado em **Módulos ES6** (na pasta `js/`), com as seguintes divisões de responsabilidade:
        - `main.js`: Arquivo principal que importa os módulos e inicializa o site.
        - `ui.js`: Responsável por carregar `header.html` e `footer.html` dinamicamente via `fetch` e pela alternância de tema (dark/light) com persistência em `localStorage`.
        - `utils.js`: Funções utilitárias reaproveitáveis (como embaralhamento de arrays e correção de rotas).
        - `animacoes.js`: Gerencia animações e transições customizadas (ex: efeito visual tipo circuito impresso em Canvas).
        - `galeria.js` e `acordeao.js`: Lidam com a renderização dinâmica da galeria a partir do `data/timeline.json`, criação de botões de filtro, formatação de datas em pt-BR e estruturação da exibição (Timeline, Grid Masonry fluido e Acordeão para a seção "Escolas").

- **Automação (Python)**
    - Script principal: `tools/converter_fotos.py`.
    - Responsabilidades:
        - Percorrer as pastas de fotos originais organizadas por categoria e data.
        - Converter imagens para o formato `.webp` (otimizado) com Pillow.
        - Gerar/atualizar `data/timeline.json` com a lista de eventos e fotos.

## Estrutura de arquivos (resumo)

| Caminho | Propósito |
|---|---|
| `paginas/` | Páginas HTML do site (`index.html`, `galeria.html`, `programa.html`, etc.) |
| `css/` | Folhas de estilo modulares e específicas por página |
| `js/` | Código JavaScript modularizado do frontend (`main.js` e demais módulos) |
| `imagens/fotos_originais/` | Fotos brutas organizadas por categoria e data (devem ser baixadas do Google Drive e colocadas localmente nesta pasta) |
| `imagens/galeria/` | Imagens otimizadas geradas pelo script Python |
| `data/timeline.json` | Linha do tempo consumida pelo frontend para montar a galeria |
| `tools/converter_fotos.py` | Script Python responsável pela otimização e geração do JSON |
| `.github/workflows/otimizar-imagens.yml` | Workflow que automatiza a conversão em CI (opcional) |

## Como configurar e rodar localmente

1. **Pré-requisitos**
   - Python 3.x instalado (recomenda-se 3.8+).
   - `pip` disponível.

2. **Instalar dependências Python**
   ```bash
   pip install Pillow
```

3. Execute o script de automação em Python:
```bash
python tools/converter_fotos.py
```


Executar o script de conversão de imagens
----------------------------------------

1. Estrutura de origem esperada (exemplo):

```
imagens/fotos_originais/<categoria>/<YYYY-MM-DD>/*.jpg
```

2. Rodar o conversor localmente (a partir da raiz do repositório):

```bash
python tools/converter_fotos.py
```

O script irá:

- Validar e percorrer as pastas dentro de `imagens/galeria/` (ou converter a partir de `imagens/fotos_originais/` dependendo do fluxo configurado).
- Gerar versões otimizadas em `imagens/galeria/<categoria>/<data>/*.webp`.
- Atualizar o arquivo `data/timeline.json` com os eventos e as imagens encontradas.

Fluxo CI/CD (GitHub Actions)
----------------------------

O repositório inclui um workflow (`.github/workflows/otimizar-imagens.yml`) que pode ser configurado para:

- Disparar em `push` para caminhos de fotos originais.
- Configurar um ambiente Python, instalar dependências e executar o conversor automaticamente.
- Comitar de volta os artefatos gerados (imagens `.webp` e `data/timeline.json`).

Verifique o conteúdo do workflow para garantir que ele invoque o mesmo script que você usa localmente (`tools/converter_fotos.py`) ou um wrapper consistente.

Boas práticas de manutenção
---------------------------

- Não edite manualmente `data/timeline.json` a menos que seja estritamente necessário; prefira ajustar a estrutura de pastas e reexecutar a automação.
- Nomeie pastas de data no formato `YYYY-MM-DD` sempre que possível.
- Evite commitar imagens pesadas não otimizadas; prefira as versões `.webp` geradas pela automação.
- Antes de abrir um PR que altera imagens, rode `python tools/converter_fotos.py` localmente e confirme que `data/timeline.json` e `imagens/galeria/` foram atualizados corretamente.

Licença
-------

Consulte o arquivo `LICENSE` no repositório para informações sobre a licença do projeto.

---

Arquivo de referência
---------------------

O código-chave está em:

- `js/script.js` — lógica de carregamento dinâmico, filtros e renderização da galeria.
- `tools/converter_fotos.py` — conversão de imagens e geração de `data/timeline.json`.
- `.github/workflows/otimizar-imagens.yml` — workflow de CI para conversão automática.

