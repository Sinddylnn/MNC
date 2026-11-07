# Mulheres na Computação — MNC

Site institucional do projeto de extensão **Mulheres na Computação (MNC)** da Universidade Estadual da Paraíba (UEPB), Campus I. O projeto promove acolhimento, formação e protagonismo de meninas e mulheres na computação e é parceiro do Programa Meninas Digitais da Sociedade Brasileira de Computação.

## Rodar o site

O site usa HTML, CSS e JavaScript nativos. Não há framework, build nem pacotes npm para instalar. Abra a pasta no VS Code com **Live Server** ou, se tiver Node.js, execute:

```bash
node tools/serve_site.js
```

Acesse <http://127.0.0.1:8000>. Para encerrar o servidor, use `Ctrl+C`. Sirva o projeto por HTTP: abrir `index.html` diretamente com `file://` impede o carregamento confiável dos módulos, do cabeçalho, do rodapé e da galeria.

**Você não precisa instalar Python para criar páginas, editar estilos ou visualizar o site.**

## Páginas e arquivos

- `index.html`: página inicial.
- `paginas/`: Programa, Equipe, Galeria, Publicações, Parcerias e Quero participar.
- `header.html` e `footer.html`: menu e rodapé compartilhados por todas as páginas.
- `css/base.css`, `css/components.css` e `css/layout.css`: temas, componentes e layout comuns.
- `css/paginas/`: estilos específicos de cada página.
- `js/main.js`, `js/core/`, `js/features/` e `js/pages/`: inicialização e comportamentos.
- `data/timeline.json`, `imagens/galeria/` e `imagens/miniaturas/`: dados e fotos da galeria.
- `imagens/logos/`: símbolo do MNC, borboleta e ícone das abas do navegador.
- `pdfs/`: publicações para download.

Para alterar o menu ou o rodapé, edite apenas `header.html` ou `footer.html`. Para adicionar uma página, crie seu HTML em `paginas/`, use os pontos de montagem `data-include` como nas outras páginas e registre o arquivo em `tools/build_site.py`. Consulte [os padrões do frontend](docs/FRONTEND.md) para botões, formulários, temas e acessibilidade.

## Testar

Com Node.js instalado:

```bash
node --test
```

Os testes de arquivos e JavaScript rodam sem servidor. Para incluir os testes HTTP, mantenha `node tools/serve_site.js` aberto em um terminal e, em outro terminal PowerShell, execute:

```powershell
$env:SITE_URL = 'http://127.0.0.1:8000'
node --test
Remove-Item Env:SITE_URL
```

Antes de publicar, confira também o tema claro e escuro, o menu, o formulário e a galeria em desktop e celular. Os testes automatizados não confirmam o envio real de e-mails.

## Atualizar fotos

### Onde colocar as fotos

Para usar o conversor, coloque as fotos em **`imagens/fotos_originais/`**, seguindo esta estrutura:

```text
imagens/fotos_originais/
├── encontros/
│   └── 2026-03-11/
│       ├── encontro-2026-03-11-01.jpg
│       └── encontro-2026-03-11-02.jpg
└── escolas/
    ├── 2024/
    │   └── escola-2024-01.jpg
    └── 2025-08-29/
        ├── escola-2025-08-29-01.jpg
        └── escola-2025-08-29-02.jpg
```

- **Formatos de entrada:** `.jpg`, `.jpeg` e `.png`. Não basta trocar a extensão de um arquivo HEIC ou WebP para JPG; exporte a foto no formato aceito.
- **Pastas:** use `encontros` ou `escolas`, depois uma data no formato `AAAA-MM-DD`. Em escolas, também é permitido usar somente o ano, como `2024`.
- **Sem pastas extras dentro da data:** o conversor lê apenas as fotos diretamente em `<categoria>/<data-ou-ano>/`. Para registrar uma visita, use `escolas/2025-08-29/`, sem uma pasta `2025/` antes da data.
- **Nomes:** prefira letras minúsculas, números e hífens, como nos exemplos. Esse padrão é uma convenção; nomes antigos com espaços e parênteses também funcionam. O conversor mantém o nome e troca a extensão para `.webp`.
- **Numeração:** use nomes diferentes para cada foto da mesma pasta. Não coloque `foto-01.jpg` e `foto-01.png` juntas: ambas gerariam `foto-01.webp` e uma seria ignorada.
- **Tamanho e proporção:** não é preciso recortar. O conversor preserva a proporção, corrige a orientação da câmera e gera miniaturas de até 640 × 640 pixels.

As fotos de escolas aparecem agrupadas por ano na página, mesmo quando os arquivos estão separados por datas. As de encontros aparecem na linha do tempo.

**Copiar fotos diretamente para `imagens/galeria/` não as cadastra automaticamente.** A página carrega a lista de `data/timeline.json`; por isso, a imagem, a miniatura e seu cadastro precisam estar sincronizados. O conversor faz essa sincronização a partir dos originais.

### Opção 1: processar no computador

Este fluxo mantém os originais locais, como previsto no `.gitignore` atual. É necessário ter Python com Pillow:

```bash
python -m pip install Pillow
python tools/converter_fotos.py
```

Execute na raiz do projeto, depois de organizar as fotos. O script gera:

| Arquivo ou pasta | Conteúdo |
| --- | --- |
| `imagens/galeria/<categoria>/<data-ou-ano>/` | Fotos em WebP para abrir em tamanho maior |
| `imagens/miniaturas/<categoria>/<data-ou-ano>/` | Versões menores para carregar a grade |
| `data/timeline.json` | Lista de eventos, nomes, dimensões e caminhos das miniaturas |

**Antes de executar, tenha a coleção completa de originais.** O script recria toda a timeline com o que encontrar nessa pasta; ele não acrescenta somente as fotos novas ao JSON existente. Se houver apenas os originais de um evento, os outros eventos deixarão de aparecer. Em um clone novo, peça à responsável pelo acervo os originais completos antes de converter.

Confira a galeria pelo servidor local e envie os três resultados juntos:

```bash
git add imagens/galeria imagens/miniaturas data/timeline.json
git commit -m "Atualiza fotos da galeria"
git push
```

Use a branch de trabalho da equipe e abra um pull request para `main`, quando aplicável. Depois da integração em `main`, o workflow de publicação valida e publica o site.

### Opção 2: processar pelo GitHub Actions

O workflow [Otimizar Imagens para WebP](.github/workflows/otimizar-imagens.yml) executa o mesmo conversor no GitHub. Ele é acionado por um **push que altere `imagens/fotos_originais/`** ou manualmente em **Actions → Otimizar Imagens para WebP → Run workflow**.

**Na configuração atual, os originais são ignorados pelo Git.** Um `git add .` não os envia; portanto, só copiar as fotos para a pasta no computador e fazer push não dispara essa automação.

Se a equipe optar por armazenar os originais no repositório, a responsável pelo acervo deve primeiro enviar a coleção completa. Para incluir explicitamente essa pasta ignorada:

```bash
git add -f imagens/fotos_originais
git commit -m "Atualiza acervo de fotos originais"
git push
```

Os originais passam a ficar disponíveis para quem tem acesso ao repositório, mas continuam excluídos do pacote do site. Não execute o workflow com um acervo parcial: a mesma regra de recriação da timeline também vale no GitHub. A execução manual não envia arquivos que só existem no computador.

O processamento funciona assim:

1. O GitHub baixa os arquivos da branch selecionada e instala Python e Pillow.
2. O conversor lê os originais, gera fotos WebP, miniaturas e a timeline.
3. Se houver alterações, o workflow faz um commit com a mensagem `Automático: Fotos otimizadas para WebP` e envia os arquivos gerados para a mesma branch. A branch precisa permitir esse push.
4. Confira a execução em **Actions**. Se estiver em uma branch de trabalho, atualize sua cópia com `git pull` antes de continuar editando e inclua o commit gerado no pull request.
5. Depois que os arquivos gerados estiverem em `main`, confirme a publicação. Se o bot fez o commit diretamente em `main`, execute **Actions → Publicar site → Run workflow → main** após o processamento.

Esse último passo é necessário porque um push feito pelo `GITHUB_TOKEN` do workflow não dispara outro workflow de push, conforme a [documentação do GitHub](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow). A publicação disparada pelo envio inicial dos originais pode usar uma versão anterior à conversão.

### Excluir ou substituir fotos

Para excluir uma foto do fluxo do conversor, remova seu **original** e execute a conversão com o acervo completo. Apagar somente a versão da galeria permite que o original a gere novamente. A nova timeline deixa de listar fotos sem original, mas, por padrão, os arquivos WebP antigos permanecem no disco.

Se também quiser remover os WebPs sem original correspondente, confira primeiro se o acervo está completo e execute:

```bash
python tools/converter_fotos.py --limpar-orfaos
```

Essa opção apaga WebPs da galeria e das miniaturas que não correspondem a originais processados. Ela não limpa os JPGs cadastrados anteriormente de forma manual. Revise as exclusões antes do commit.

Para substituir uma imagem, troque seu original mantendo o mesmo nome e execute o conversor. O script verifica a data de modificação para decidir o que precisa gerar novamente.

### Se alguma foto não aparecer

- Confira se o original está no formato aceito e diretamente na pasta de data ou ano.
- Confira os avisos do conversor: datas inválidas, nomes duplicados e arquivos ilegíveis são ignorados.
- Verifique se a foto está listada em `data/timeline.json` e se a imagem e a miniatura existem nos caminhos indicados, com as mesmas letras maiúsculas e minúsculas.
- Se alterou apenas a pasta local de originais, processe no computador ou envie os originais explicitamente antes de esperar o Actions.
- Confira em **Actions** se o processamento e a publicação terminaram. Depois, recarregue a galeria com `Ctrl+F5`.

## Atualizar a equipe

As fotos dos perfis ficam em `imagens/equipe/` e os textos em [paginas/equipe.html](paginas/equipe.html). Essa parte é editada manualmente e não usa o conversor da galeria.

Para cada integrante, localize seu bloco `<article class="team-member ...">`, atualize a foto e acrescente a apresentação em `<p class="member-bio">...</p>` abaixo do nome. Essa classe aplica texto justificado. Prefira uma foto com o rosto centralizado, pois o site usa um recorte circular.

Para adicionar redes sociais, use o bloco de Sonally como referência: os três quadradinhos ficam abaixo da descrição. Troque os links e os rótulos `aria-label` para os perfis da integrante e inclua somente as redes que ela enviar.

## Publicação

Um push na branch `main` aciona a [publicação no GitHub Pages](.github/workflows/publicar-site.yml). O GitHub Actions valida o projeto, monta `_site` com os arquivos públicos e publica o resultado. Esses workflows ainda usam Python internamente; ele não é necessário para o desenvolvimento local do frontend.

Na primeira publicação, configure **GitHub Actions** como origem em **Settings → Pages → Build and deployment**.

## Formulário de contato

A página [Quero participar](paginas/quero-participar.html) tem um formulário de contato com nome, telefone/WhatsApp e mensagem obrigatórios. Ele usa o FormSubmit para encaminhar mensagens a `mnc.uepb@gmail.com`. Após o primeiro envio pelo site publicado, a equipe precisa confirmar o e-mail de ativação do serviço. Veja as [instruções do FormSubmit](https://formsubmit.co/help). Para confirmar a entrega, faça um envio real e confira a caixa de entrada.

## Documentação e contato

As [diretrizes do projeto](docs/AGENTS.md) e os [padrões do frontend](docs/FRONTEND.md) orientam novas alterações.

- E-mail: [mnc.uepb@gmail.com](mailto:mnc.uepb@gmail.com)
- Instagram: [@mnc.uepb](https://www.instagram.com/mnc.uepb/)
- LinkedIn: [Mulheres na Computação — UEPB](https://br.linkedin.com/company/mulheres-na-computa%C3%A7%C3%A3o-uepb)

O projeto está disponível sob a [licença MIT](LICENSE).
