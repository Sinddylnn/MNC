"""Valida a estrutura e os arquivos publicados pelo site estático do MNC."""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


RAIZ = Path(__file__).resolve().parent.parent
ARQUIVOS_HTML = [RAIZ / "index.html", *sorted((RAIZ / "paginas").glob("*.html"))]
FRAGMENTOS_HTML = [RAIZ / "header.html", RAIZ / "footer.html"]
REFERENCIAS_HTML = {
    "a": "href",
    "img": "src",
    "link": "href",
    "script": "src",
    "source": "src",
    "video": "poster",
    "object": "data",
}
ELEMENTOS_VAZIOS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
    "meta", "param", "source", "track", "wbr",
}
IMPORT_JS_RE = re.compile(
    r"(?:\bfrom\s*|\bimport\s*)[\"'](?P<caminho>\.{1,2}/[^\"']+)[\"']"
)
URL_CSS_RE = re.compile(r"url\(\s*[\"']?(?P<caminho>[^\"')]+)", re.IGNORECASE)


class ColetorHTML(HTMLParser):
    def __init__(self, arquivo: Path, erros: list[str]) -> None:
        super().__init__(convert_charrefs=True)
        self.arquivo = arquivo
        self.erros = erros
        self.ids: dict[str, int] = {}
        self.contagem_tags: dict[str, int] = {}
        self.tags_abertas: list[tuple[str, int]] = []

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        self._processar_tag(tag, attrs_list)

    def handle_startendtag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        quantidade_abertas = len(self.tags_abertas)
        self._processar_tag(tag, attrs_list)
        if len(self.tags_abertas) > quantidade_abertas:
            self.tags_abertas.pop()

    def handle_endtag(self, tag: str) -> None:
        linha = self.getpos()[0]
        if not self.tags_abertas:
            self.erros.append(f"{relativo(self.arquivo)}:{linha}: fechamento </{tag}> inesperado")
            return

        tag_aberta, linha_aberta = self.tags_abertas[-1]
        if tag_aberta == tag:
            self.tags_abertas.pop()
            return

        self.erros.append(
            f"{relativo(self.arquivo)}:{linha}: fechamento </{tag}> não corresponde a "
            f"<{tag_aberta}> aberto na linha {linha_aberta}"
        )
        for indice in range(len(self.tags_abertas) - 1, -1, -1):
            if self.tags_abertas[indice][0] == tag:
                del self.tags_abertas[indice:]
                return

    def finalizar(self) -> None:
        for tag, linha in self.tags_abertas:
            self.erros.append(f"{relativo(self.arquivo)}:{linha}: elemento <{tag}> sem fechamento")
        self.tags_abertas.clear()

    def _processar_tag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        linha = self.getpos()[0]
        attrs = dict(attrs_list)
        self.contagem_tags[tag] = self.contagem_tags.get(tag, 0) + 1
        if tag not in ELEMENTOS_VAZIOS:
            self.tags_abertas.append((tag, linha))

        identificador = attrs.get("id")
        if identificador:
            if identificador in self.ids:
                self.erros.append(
                    f"{relativo(self.arquivo)}:{linha}: id duplicado '{identificador}' "
                    f"(primeiro uso na linha {self.ids[identificador]})"
                )
            else:
                self.ids[identificador] = linha

        if tag == "img" and "alt" not in attrs:
            self.erros.append(f"{relativo(self.arquivo)}:{linha}: imagem sem atributo alt")

        if attrs.get("target", "").lower() == "_blank":
            rel = set((attrs.get("rel") or "").lower().split())
            if not {"noopener", "noreferrer"}.issubset(rel):
                self.erros.append(
                    f"{relativo(self.arquivo)}:{linha}: link com target='_blank' sem "
                    "rel='noopener noreferrer'"
                )

        atributo = REFERENCIAS_HTML.get(tag)
        if atributo and attrs.get(atributo):
            validar_referencia(
                attrs[atributo] or "",
                self.arquivo,
                linha,
                self.erros,
                base=RAIZ if self.arquivo in FRAGMENTOS_HTML else self.arquivo.parent,
            )


def relativo(caminho: Path) -> str:
    try:
        return caminho.relative_to(RAIZ).as_posix()
    except ValueError:
        return str(caminho)


def caminho_local(referencia: str, base: Path) -> Path | None:
    referencia = referencia.strip()
    if not referencia or referencia.startswith(("#", "//")):
        return None

    partes = urlsplit(referencia)
    if partes.scheme:
        return None

    caminho = unquote(partes.path)
    if not caminho:
        return None
    return (RAIZ / caminho.lstrip("/")) if caminho.startswith("/") else (base / caminho)


def validar_referencia(
    referencia: str,
    origem: Path,
    linha: int,
    erros: list[str],
    *,
    base: Path,
) -> None:
    destino = caminho_local(referencia, base)
    if destino is None:
        return
    if not destino.resolve().is_relative_to(RAIZ):
        erros.append(f"{relativo(origem)}:{linha}: caminho sai do projeto: {referencia}")
    elif not destino.exists():
        erros.append(f"{relativo(origem)}:{linha}: arquivo não encontrado: {referencia}")


def validar_html(erros: list[str]) -> tuple[int, int]:
    paginas = 0
    referencias = 0

    for arquivo in [*ARQUIVOS_HTML, *FRAGMENTOS_HTML]:
        if not arquivo.is_file():
            erros.append(f"arquivo HTML obrigatório não encontrado: {relativo(arquivo)}")
            continue

        conteudo = arquivo.read_text(encoding="utf-8")
        coletor = ColetorHTML(arquivo, erros)
        try:
            coletor.feed(conteudo)
            coletor.close()
            coletor.finalizar()
        except Exception as erro:
            erros.append(f"{relativo(arquivo)}: HTML não pôde ser analisado: {erro}")
            continue

        referencias += sum(
            conteudo.count(f" {atributo}=") for atributo in set(REFERENCIAS_HTML.values())
        )

        if arquivo in ARQUIVOS_HTML:
            paginas += 1
            if not re.match(r"\s*<!doctype\s+html", conteudo, re.IGNORECASE):
                erros.append(f"{relativo(arquivo)}: declaração <!DOCTYPE html> ausente")
            for tag in ("html", "head", "title", "body", "main"):
                quantidade = coletor.contagem_tags.get(tag, 0)
                if quantidade != 1:
                    erros.append(
                        f"{relativo(arquivo)}: esperado exatamente um <{tag}>; encontrado {quantidade}"
                    )

    return paginas, referencias


def validar_css(erros: list[str]) -> int:
    referencias = 0
    for arquivo in sorted((RAIZ / "css").rglob("*.css")):
        conteudo = arquivo.read_text(encoding="utf-8")
        for numero_linha, linha in enumerate(conteudo.splitlines(), start=1):
            for correspondencia in URL_CSS_RE.finditer(linha):
                referencias += 1
                validar_referencia(
                    correspondencia.group("caminho"),
                    arquivo,
                    numero_linha,
                    erros,
                    base=arquivo.parent,
                )
    return referencias


def validar_importacoes_js(erros: list[str]) -> int:
    importacoes = 0
    for arquivo in sorted((RAIZ / "js").glob("*.js")):
        conteudo = arquivo.read_text(encoding="utf-8")
        for correspondencia in IMPORT_JS_RE.finditer(conteudo):
            importacoes += 1
            linha = conteudo.count("\n", 0, correspondencia.start()) + 1
            validar_referencia(
                correspondencia.group("caminho"),
                arquivo,
                linha,
                erros,
                base=arquivo.parent,
            )
    return importacoes


def data_valida(valor: str) -> bool:
    if re.fullmatch(r"\d{4}", valor):
        return 1900 <= int(valor) <= 2100
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", valor):
        return False
    try:
        datetime.strptime(valor, "%Y-%m-%d")
    except ValueError:
        return False
    return True


def validar_timeline(erros: list[str]) -> tuple[int, int]:
    arquivo = RAIZ / "data" / "timeline.json"
    try:
        eventos = json.loads(arquivo.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as erro:
        erros.append(f"{relativo(arquivo)}: JSON inválido ou inacessível: {erro}")
        return 0, 0

    if not isinstance(eventos, list):
        erros.append(f"{relativo(arquivo)}: a raiz deve ser uma lista")
        return 0, 0

    total_fotos = 0
    eventos_usados: set[tuple[str, str]] = set()
    for indice, evento in enumerate(eventos):
        contexto = f"{relativo(arquivo)}: evento {indice + 1}"
        if not isinstance(evento, dict):
            erros.append(f"{contexto}: deve ser um objeto")
            continue

        categoria = evento.get("categoria")
        data = evento.get("data")
        caminho_evento = evento.get("caminho_relativo")
        fotos = evento.get("fotos")
        metadados = evento.get("metadados")

        if not isinstance(categoria, str) or not categoria or not all(
            caractere.isalnum() or caractere in "-_" for caractere in categoria
        ):
            erros.append(f"{contexto}: categoria inválida")
        if not isinstance(data, str) or not data_valida(data):
            erros.append(f"{contexto}: data inválida")

        esperado_evento = f"{categoria}/{data}"
        if caminho_evento != esperado_evento:
            erros.append(
                f"{contexto}: caminho_relativo deveria ser '{esperado_evento}'"
            )

        chave_evento = (str(categoria), str(data))
        if chave_evento in eventos_usados:
            erros.append(f"{contexto}: categoria e data duplicadas")
        eventos_usados.add(chave_evento)

        if not isinstance(fotos, list) or not fotos:
            erros.append(f"{contexto}: fotos deve ser uma lista não vazia")
            continue
        if len(fotos) != len(set(fotos)):
            erros.append(f"{contexto}: há nomes de fotos duplicados")
        if not isinstance(metadados, dict):
            erros.append(f"{contexto}: metadados ausentes ou inválidos")
            continue

        for foto in fotos:
            total_fotos += 1
            if not isinstance(foto, str) or Path(foto).name != foto or not foto.endswith(".webp"):
                erros.append(f"{contexto}: nome de foto inválido: {foto!r}")
                continue

            meta = metadados.get(foto)
            if not isinstance(meta, dict):
                erros.append(f"{contexto}: metadados ausentes para '{foto}'")
                continue

            largura = meta.get("largura")
            altura = meta.get("altura")
            miniatura = meta.get("miniatura")
            if not isinstance(largura, int) or isinstance(largura, bool) or largura <= 0:
                erros.append(f"{contexto}: largura inválida para '{foto}'")
            if not isinstance(altura, int) or isinstance(altura, bool) or altura <= 0:
                erros.append(f"{contexto}: altura inválida para '{foto}'")

            esperado_foto = f"{esperado_evento}/{foto}"
            if miniatura != esperado_foto:
                erros.append(f"{contexto}: caminho de miniatura inválido para '{foto}'")

            for pasta, tipo in (("galeria", "imagem"), ("miniaturas", "miniatura")):
                destino = RAIZ / "imagens" / pasta / esperado_foto
                if not destino.is_file():
                    erros.append(f"{contexto}: {tipo} não encontrada: {relativo(destino)}")

        extras = set(metadados) - set(fotos)
        if extras:
            erros.append(f"{contexto}: metadados sem foto: {', '.join(sorted(extras))}")

    return len(eventos), total_fotos


def main() -> int:
    erros: list[str] = []
    paginas, referencias_html = validar_html(erros)
    referencias_css = validar_css(erros)
    importacoes_js = validar_importacoes_js(erros)
    eventos, fotos = validar_timeline(erros)

    if erros:
        print(f"Validação falhou com {len(erros)} erro(s):", file=sys.stderr)
        for erro in erros:
            print(f"- {erro}", file=sys.stderr)
        return 1

    print(
        "Validação concluída: "
        f"{paginas} páginas, {referencias_html} referências HTML, "
        f"{referencias_css} URLs CSS, {importacoes_js} importações JavaScript, "
        f"{eventos} eventos e {fotos} fotos."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
