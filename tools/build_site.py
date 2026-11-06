"""Copia os arquivos públicos do site para _site, sem gerar HTML.

As páginas e os fragmentos compartilhados são servidos diretamente na raiz do projeto.
Este empacotamento é usado somente para publicar no GitHub Pages.
"""

from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "_site"
PAGES = (
    Path("index.html"),
    Path("paginas/programa.html"),
    Path("paginas/equipe.html"),
    Path("paginas/galeria.html"),
    Path("paginas/publicacoes.html"),
    Path("paginas/parcerias.html"),
    Path("paginas/quero-participar.html"),
)
PUBLIC_DIRECTORIES = ("css", "data", "imagens", "js", "pdfs")
SHARED_HTML = (Path("header.html"), Path("footer.html"))


def main() -> int:
    # Confira os arquivos antes de substituir o pacote anterior.
    for relative in (*PAGES, *SHARED_HTML, Path(".nojekyll")):
        if not (ROOT / relative).is_file():
            raise FileNotFoundError(f"Arquivo obrigatório não encontrado: {relative}")
    for directory in PUBLIC_DIRECTORIES:
        if not (ROOT / directory).is_dir():
            raise FileNotFoundError(f"Diretório obrigatório não encontrado: {directory}")

    if OUTPUT.is_symlink() or OUTPUT.resolve() != ROOT / "_site":
        raise RuntimeError(f"Pasta de saída inesperada: {OUTPUT}")
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()

    for relative in (*PAGES, *SHARED_HTML, Path(".nojekyll")):
        destination = OUTPUT / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / relative, destination)
    for directory in PUBLIC_DIRECTORIES:
        ignore = shutil.ignore_patterns("fotos_originais") if directory == "imagens" else None
        shutil.copytree(ROOT / directory, OUTPUT / directory, ignore=ignore)

    print(f"Site empacotado em {OUTPUT} com {len(PAGES)} páginas, sem transformação.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
