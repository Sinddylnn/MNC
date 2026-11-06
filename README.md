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

Organize os originais em `imagens/fotos_originais/<categoria>/<AAAA-MM-DD>/`. Para fotos de escolas agrupadas por ano, use `imagens/fotos_originais/escolas/<AAAA>/`.

Ao enviar novos originais ao repositório, o workflow [Otimizar Imagens para WebP](.github/workflows/otimizar-imagens.yml) usa Python e Pillow no GitHub Actions para gerar as imagens WebP, as miniaturas e `data/timeline.json`. Os originais não entram no site publicado. Também é possível executar `tools/converter_fotos.py` localmente, mas isso é opcional e exige Python com Pillow.

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
