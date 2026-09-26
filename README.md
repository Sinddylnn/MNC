# Mulheres na Computação — MNC

Site institucional do **Mulheres na Computação (MNC)**, projeto de extensão da Universidade Estadual da Paraíba (UEPB), Campus I, em Campina Grande.

Criado em 2020, o MNC promove acolhimento, formação, representatividade e protagonismo de meninas e mulheres na computação. O projeto é parceiro do Programa Meninas Digitais, da Sociedade Brasileira de Computação (SBC).

## Conteúdo do site

- apresentação e história do projeto;
- objetivos e ações do programa;
- equipe do MNC;
- galeria de encontros e atividades em escolas;
- publicações acadêmicas para download;
- formulário de inscrição para novas participantes;
- temas claro e escuro.

## Tecnologias

- HTML5;
- CSS3 modular;
- JavaScript em módulos ES6;
- Canvas API para animações de transição;
- Python 3 e Pillow para otimização de imagens;
- GitHub Actions para validar, processar imagens e publicar o site.

O frontend não usa framework, gerenciador de pacotes ou etapa de compilação.

## Executar localmente

O projeto deve ser servido por HTTP porque usa módulos JavaScript e `fetch` para carregar componentes e dados.

Na raiz do repositório, execute:

```bash
python -m http.server 8000
```

Depois acesse [http://localhost:8000](http://localhost:8000).

Não é necessário instalar dependências para visualizar o site.

## Estrutura do projeto

```text
MNC/
├── css/                         # Estilos globais e por página
├── data/timeline.json           # Dados consumidos pela galeria
├── imagens/galeria/             # Imagens WebP completas
├── imagens/miniaturas/          # WebPs menores usados nas grades
├── js/                          # Módulos JavaScript
├── paginas/                     # Páginas internas do site
├── pdfs/                        # Artigos disponíveis para download
├── tools/converter_fotos.py     # Conversor e gerador da timeline
├── footer.html                  # Rodapé compartilhado
├── header.html                  # Cabeçalho compartilhado
└── index.html                   # Página inicial
```

`header.html` e `footer.html` são carregados dinamicamente por `js/ui.js`. O ponto de entrada JavaScript é `js/main.js`.

## Atualizar a galeria

As fotos originais devem ser organizadas por categoria e data:

```text
imagens/fotos_originais/<categoria>/<YYYY-MM-DD>/*.jpg
```

Para categorias agrupadas por ano, também é aceito:

```text
imagens/fotos_originais/escolas/<YYYY>/*.png
```

Instale o Pillow e execute o conversor:

```bash
python -m pip install Pillow
python tools/converter_fotos.py
```

O script corrige a orientação EXIF, converte arquivos PNG, JPG e JPEG para WebP, gera versões menores em `imagens/miniaturas/` e atualiza `data/timeline.json` com os caminhos e as dimensões das fotos. Uma imagem é reconvertida quando o arquivo original for mais recente que a versão gerada.

Arquivos antigos são preservados por padrão. Para remover da galeria e das miniaturas os WebPs que não possuem mais um original correspondente, execute conscientemente:

```bash
python tools/converter_fotos.py --limpar-orfaos
```

O workflow `.github/workflows/otimizar-imagens.yml` permite executar esse processo pelo GitHub Actions.

## Validar e publicar

Antes de enviar alterações, execute a validação local:

```bash
python tools/validar_site.py
```

O validador confere a estrutura das páginas HTML, caminhos de arquivos locais, segurança dos links externos, referências de CSS, importações JavaScript e consistência das fotos e miniaturas da timeline. A sintaxe JavaScript também é verificada pelo workflow `.github/workflows/validar-site.yml` em branches de trabalho e pull requests para `main`.

O workflow `.github/workflows/publicar-site.yml` valida novamente o projeto e publica somente os arquivos públicos no GitHub Pages após um push na branch `main`. Ele também pode ser iniciado manualmente em **Actions → Publicar site → Run workflow**.

Na primeira publicação, selecione **GitHub Actions** em **Settings → Pages → Build and deployment → Source**. Depois dessa configuração única, novas versões da `main` serão publicadas automaticamente.

## Configurar o formulário

O fluxo de envio e as mensagens de retorno estão implementados. Para habilitar o envio, informe no atributo `data-endpoint` de `paginas/inscricao.html` o endpoint HTTPS fornecido pelo serviço de formulários escolhido.

## Documentação

- [Informações do projeto](INFORMACOES_PROJETO.md): arquitetura, páginas, fluxos e manutenção;
- [Melhorias sugeridas](MELHORIAS_SUGERIDAS.md): pontos pendentes e evolução recomendada;
- [Diretrizes para agentes](AGENTS.md): convenções que devem ser seguidas pelo Codex e outros agentes de código.

## Contato

- E-mail: [mnc.uepb@gmail.com](mailto:mnc.uepb@gmail.com)
- Instagram: [@mnc.uepb](https://www.instagram.com/mnc.uepb/)
- LinkedIn: [Mulheres na Computação — UEPB](https://br.linkedin.com/company/mulheres-na-computa%C3%A7%C3%A3o-uepb)

## Licença

Este projeto está disponível sob a [licença MIT](LICENSE).
