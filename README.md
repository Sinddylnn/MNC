# Mulheres na Computação (MNC) — Guia de Onboarding 🚀

Bem-vindo(a)! Este documento é um guia de integração para desenvolvedores que vão manter o site do projeto **Mulheres na Computação (MNC)**. Aqui você encontrará contexto do projeto, arquitetura, instruções para rodar as automações locais e práticas recomendadas para manutenção.

---

## Sobre o Projeto

O site MNC apresenta informações institucionais, artigos, equipe, galeria de fotos, formulário de inscrição e o cronograma do projeto. A estrutura principal de páginas está em `paginas/`:

- `index.html` — Página inicial
- `artigos.html` — Lista de artigos e conteúdo editorial
- `equipe.html` — Perfil/contato da equipe organizadora
- `galeria.html` — Visualização das fotos convertidas/otimizadas
- `inscricao.html` — Formulário de inscrição
- `programa.html` — Página de `Programa` que gerencia cronogramas e eventos do projeto

O site é construído com HTML/CSS/JS simples e mantido como um repositório estático. As imagens são otimizadas por scripts Python que mantêm a galeria leve e atualizada.

---

## Arquitetura Técnica e Tecnologias

- Frontend: HTML5 estático com estilos organizados em `css/`:
	- `css/base.css`, `css/components.css`, `css/layout.css`, `css/style.css`
	- `css/paginas/` contém estilos específicos por página (`index.css`, `galeria.css`, etc.)
- Comportamento cliente: `js/script.js`
- Automação/Backend leve: Python (scripts em `tools/`) para processamento de assets (imagens) e geração de JSON usado pela galeria.

Estrutura de alto nível (resumo):

| Pasta / Arquivo | Propósito |
|---|---|
| `paginas/` | Páginas HTML do site |
| `css/` | Folhas de estilo modulares |
| `imagens/fotos_originais/` | Fotos brutas por evento (YYYY-MM-DD) |
| `imagens/galeria/` | Fotos otimizadas (.webp) geradas pela automação |
| `data/timeline.json` | Linha do tempo gerada automaticamente para a galeria |
| `tools/converter_fotos.py` | Script Python que converte imagens e atualiza `timeline.json` |

---

## Automação de Imagens da Galeria (detalhada)

O script central é `tools/converter_fotos.py`. Fluxo completo:

1. Estrutura de origem: coloque fotos brutas em pastas com o padrão de nome `YYYY-MM-DD` dentro de `imagens/fotos_originais/`.
	 - Exemplo: `imagens/fotos_originais/2026-05-11/` contendo `foto1.jpg`, `foto2.png`, ...

2. Execução do script (`tools/converter_fotos.py`):
	 - O script lista as pastas de eventos (ordenadas cronologicamente, do mais recente ao mais antigo).
	 - Para cada imagem com extensão `.png`, `.jpg` ou `.jpeg`, o script:
		 - Abre a imagem com Pillow (`PIL.Image`).
		 - Garante que a imagem esteja em `RGB` e salva uma versão otimizada em `.webp` (qualidade padrão 80) dentro de `imagens/galeria/<YYYY-MM-DD>/`.
		 - Registra o caminho relativo do arquivo `.webp` em uma lista do evento.
		 - Mantém contadores de fotos processadas e erros (caso alguma imagem não possa ser lida por Pillow).
	 - Ao final do processamento, o script escreve/atualiza `data/timeline.json` com uma lista de objetos no formato:

```json
[
	{
		"data": "2026-05-11",
		"fotos": [
			"imagens/galeria/2026-05-11/foto1.webp",
			"imagens/galeria/2026-05-11/foto2.webp"
		]
	},
	{
		"data": "2026-03-11",
		"fotos": []
	}
]
```

3. Resultado: `imagens/galeria/` contém as imagens otimizadas e `data/timeline.json` alimenta a página `paginas/galeria.html` com os itens ordenados.

Observações importantes:
- O script é idempotente em relação à geração do JSON: sempre sobrescreve `data/timeline.json` com o estado atualizado.
- Não edite `data/timeline.json` manualmente — ele é gerado pela automação.

---

## Pré-requisitos e Instalação Local

1. Ter o Python 3.x instalado (recomenda-se 3.8+; o repositório foi testado com 3.12/3.14).

2. Instalar a dependência Pillow:

```bash
pip install Pillow
```

3. Executar a automação localmente (a partir da raiz do repositório):

```bash
python tools/converter_fotos.py
```

Saída esperada:
- Criação/atualização de pastas em `imagens/galeria/<YYYY-MM-DD>/` com arquivos `.webp`;
- Geração/atualização do arquivo `data/timeline.json` com a lista de eventos e imagens.

Se preferir executar interativamente em um ambiente virtual (recomendado para evitar poluir o Python global):

```bash
python -m venv .venv
source .venv/bin/activate   # Linux / macOS
.\.venv\Scripts\Activate  # Windows PowerShell
pip install --upgrade pip
pip install Pillow
python tools/converter_fotos.py
```

---

## Fluxo de Trabalho CI/CD (GitHub Actions)

O repositório contém um workflow em `.github/workflows/otimizar-imagens.yml`. Resumo do que ele faz:

1. Gatilho: `push` que altera arquivos sob `imagens/fotos_originais/**`.
2. Ações executadas:
	 - Faz checkout do repositório (`actions/checkout`).
	 - Configura Python (versão 3.12 declarada no workflow).
	 - Instala a biblioteca `Pillow`.
	 - Executa um script de otimização (no workflow atual: `scripts/otimizar_fotos_ci.py`).
	 - Usa uma ação de commit automático (`git-auto-commit-action`) para commitar os `.webp` e o `data/timeline.json` resultantes.

Benefícios:
- Quando um mantenedor adiciona fotos brutas em `imagens/fotos_originais/` e faz push, o Actions automatiza a conversão e commita os artefatos otimizados de volta à branch principal — poupando trabalho manual e garantindo que o site sempre sirva imagens leves.

Nota técnica: verifique o caminho/programa chamado pelo workflow (`scripts/otimizar_fotos_ci.py`) — no repositório de desenvolvimento atual o conversor principal é `tools/converter_fotos.py`. Caso deseje alinhar, considere atualizar o workflow para chamar diretamente `tools/converter_fotos.py` ou manter um pequeno wrapper em `scripts/` que invoque o converter em `tools/`.

---

## Guia de Manutenção e Boas Práticas

- Como adicionar um novo evento (passo a passo):
	1. Crie uma pasta dentro de `imagens/fotos_originais/` com o nome no formato `YYYY-MM-DD`.
	2. Coloque as fotos brutas dentro dessa pasta (formatos suportados: `.jpg`, `.jpeg`, `.png`).
	3. Faça commit e push. O GitHub Actions irá automaticamente processar (se estiver habilitado). Se preferir, rode localmente `python tools/converter_fotos.py`.

- Padrões e recomendações:
	- Nomes de arquivos com caracteres especiais são permitidos, mas evite nomes que contenham novas linhas ou caracteres de controle.
	- Prefira fotos com orientação correta; o script não faz rotação EXIF automática.
	- Mantenha o repositório organizado: fotos brutas em `imagens/fotos_originais/`, imagens otimizadas geradas em `imagens/galeria/`.

- Sobre o arquivo `data/timeline.json`:
	- É gerado automaticamente — NÃO EDITAR manualmente.
	- Caso seja necessário corrigir algo manualmente, prefira atualizar as pastas de origem e re-executar a automação localmente.

---

## Checklist rápido para novos mantenedores

- [ ] Ter Python 3.x e `pip` instalados
- [ ] Entender a estrutura `imagens/fotos_originais/` → `imagens/galeria/` → `data/timeline.json`
- [ ] Verificar o workflow `.github/workflows/otimizar-imagens.yml` se o CI está ativo na organização
- [ ] Rodar `python tools/converter_fotos.py` localmente antes de abrir PRs que mexam nas imagens

---

## Dúvidas e próximos passos

Se quiser, posso:

- Ajustar o workflow do GitHub Actions para chamar diretamente `tools/converter_fotos.py` ou adicionar um wrapper `scripts/otimizar_fotos_ci.py` para compatibilidade.
- Incluir opções no script (`--quality`, `--dry-run`, `--clean-old`) e gerar thumbnails automáticos.

Contribuições são bem-vindas — abra uma issue ou PR com alterações propostas.

---

© Projeto Mulheres na Computação
