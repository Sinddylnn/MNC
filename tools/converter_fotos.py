"""Converte as fotos originais, gera miniaturas e atualiza a timeline."""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageOps


RAIZ_PROJETO = Path(__file__).resolve().parent.parent
PASTA_ORIGEM = RAIZ_PROJETO / "imagens" / "fotos_originais"
PASTA_GALERIA = RAIZ_PROJETO / "imagens" / "galeria"
PASTA_MINIATURAS = RAIZ_PROJETO / "imagens" / "miniaturas"
ARQUIVO_JSON = RAIZ_PROJETO / "data" / "timeline.json"
EXTENSOES_ACEITAS = {".jpg", ".jpeg", ".png"}
TAMANHO_MAXIMO_MINIATURA = (640, 640)


def argumentos() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Converte fotos para WebP e atualiza data/timeline.json."
    )
    parser.add_argument(
        "--limpar-orfaos",
        action="store_true",
        help="remove WebPs sem arquivo original correspondente",
    )
    return parser.parse_args()


def categoria_valida(nome: str) -> bool:
    return bool(nome) and all(caractere.isalnum() or caractere in "-_" for caractere in nome)


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


def precisa_atualizar(origem: Path, destino: Path) -> bool:
    return not destino.exists() or origem.stat().st_mtime > destino.stat().st_mtime


def abrir_corrigida(caminho: Path) -> Image.Image:
    with Image.open(caminho) as imagem:
        corrigida = ImageOps.exif_transpose(imagem)
        return corrigida.convert("RGBA" if "A" in corrigida.getbands() else "RGB")


def salvar_webp(imagem: Image.Image, destino: Path, *, qualidade: int) -> None:
    destino.parent.mkdir(parents=True, exist_ok=True)
    imagem.save(destino, "WEBP", quality=qualidade, method=6)


def processar_imagem(origem: Path, galeria: Path, miniatura: Path) -> tuple[int, int, bool, bool]:
    atualizar_galeria = precisa_atualizar(origem, galeria)
    atualizar_miniatura = precisa_atualizar(origem, miniatura)

    if atualizar_galeria or atualizar_miniatura:
        imagem = abrir_corrigida(origem)
        largura, altura = imagem.size

        if atualizar_galeria:
            salvar_webp(imagem, galeria, qualidade=80)

        if atualizar_miniatura:
            thumb = imagem.copy()
            thumb.thumbnail(TAMANHO_MAXIMO_MINIATURA, Image.Resampling.LANCZOS)
            salvar_webp(thumb, miniatura, qualidade=72)
    else:
        with Image.open(galeria) as imagem_existente:
            largura, altura = imagem_existente.size

    return largura, altura, atualizar_galeria, atualizar_miniatura


def remover_diretorios_vazios(raiz: Path) -> None:
    for pasta in sorted((item for item in raiz.rglob("*") if item.is_dir()), reverse=True):
        try:
            pasta.rmdir()
        except OSError:
            pass


def limpar_orfaos(esperados: set[Path]) -> int:
    removidos = 0
    for raiz in (PASTA_GALERIA, PASTA_MINIATURAS):
        esperados_na_raiz = {raiz / caminho for caminho in esperados}
        for arquivo in raiz.rglob("*.webp"):
            if arquivo not in esperados_na_raiz:
                arquivo.unlink()
                removidos += 1
        remover_diretorios_vazios(raiz)
    return removidos


def converter_fotos(*, limpar: bool = False) -> int:
    print("Iniciando processamento das imagens...")
    if not PASTA_ORIGEM.is_dir():
        print(f"Pasta de origem não encontrada: {PASTA_ORIGEM}")
        return 1

    PASTA_GALERIA.mkdir(parents=True, exist_ok=True)
    PASTA_MINIATURAS.mkdir(parents=True, exist_ok=True)

    eventos: list[dict] = []
    destinos_esperados: set[Path] = set()
    convertidas = 0
    miniaturas_geradas = 0
    ignoradas = 0

    for pasta_categoria in sorted(PASTA_ORIGEM.iterdir()):
        if not pasta_categoria.is_dir():
            continue
        categoria = pasta_categoria.name
        if not categoria_valida(categoria):
            print(f"Aviso: categoria inválida ignorada: {categoria}")
            ignoradas += 1
            continue

        for pasta_data in sorted(pasta_categoria.iterdir()):
            if not pasta_data.is_dir():
                continue
            data = pasta_data.name
            if not data_valida(data):
                print(f"Aviso: data inválida ignorada: {categoria}/{data}")
                ignoradas += 1
                continue

            fotos = []
            metadados = {}
            nomes_usados: set[str] = set()
            originais = sorted(
                arquivo for arquivo in pasta_data.iterdir()
                if arquivo.is_file() and arquivo.suffix.lower() in EXTENSOES_ACEITAS
            )

            for origem in originais:
                nome_webp = f"{origem.stem}.webp"
                if nome_webp.casefold() in nomes_usados:
                    print(f"Aviso: nome duplicado ignorado: {origem.relative_to(PASTA_ORIGEM)}")
                    ignoradas += 1
                    continue
                nomes_usados.add(nome_webp.casefold())

                caminho_relativo = Path(categoria) / data / nome_webp
                galeria = PASTA_GALERIA / caminho_relativo
                miniatura = PASTA_MINIATURAS / caminho_relativo

                try:
                    largura, altura, atualizou_galeria, atualizou_thumb = processar_imagem(
                        origem, galeria, miniatura
                    )
                except (OSError, ValueError) as erro:
                    print(f"Aviso: não foi possível processar {origem.name}: {erro}")
                    ignoradas += 1
                    continue

                destinos_esperados.add(caminho_relativo)
                convertidas += int(atualizou_galeria)
                miniaturas_geradas += int(atualizou_thumb)
                fotos.append(nome_webp)
                metadados[nome_webp] = {
                    "largura": largura,
                    "altura": altura,
                    "miniatura": caminho_relativo.as_posix(),
                }

            if fotos:
                eventos.append({
                    "categoria": categoria,
                    "data": data,
                    "caminho_relativo": f"{categoria}/{data}",
                    "fotos": fotos,
                    "metadados": metadados,
                })

    eventos.sort(key=lambda evento: evento["data"], reverse=True)
    ARQUIVO_JSON.parent.mkdir(parents=True, exist_ok=True)
    ARQUIVO_JSON.write_text(
        json.dumps(eventos, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    removidos = limpar_orfaos(destinos_esperados) if limpar else 0
    print(
        f"Concluído: {convertidas} imagens convertidas, "
        f"{miniaturas_geradas} miniaturas geradas, {ignoradas} itens ignorados."
    )
    if limpar:
        print(f"Limpeza concluída: {removidos} arquivos órfãos removidos.")
    else:
        print("Arquivos órfãos preservados. Use --limpar-orfaos para removê-los.")
    return 0


if __name__ == "__main__":
    raise SystemExit(converter_fotos(limpar=argumentos().limpar_orfaos))
