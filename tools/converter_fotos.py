import os
import json
import time
from datetime import datetime
from PIL import Image

# BÚSSOLA: Descobre o caminho absoluto do projeto
DIRETORIO_SCRIPT = os.path.dirname(os.path.abspath(__file__))
RAIZ_PROJETO = os.path.dirname(DIRETORIO_SCRIPT)

# Caminhos exatos
PASTA_ORIGEM = os.path.join(RAIZ_PROJETO, "imagens", "fotos_originais")
PASTA_DESTINO = os.path.join(RAIZ_PROJETO, "imagens", "galeria")
ARQUIVO_JSON = os.path.join(RAIZ_PROJETO, "data", "timeline.json")

def processar_timeline():
    # Inicia o cronômetro
    tempo_inicio = time.time()
    
    # Contadores para o relatório final
    qtd_eventos = 0
    qtd_fotos = 0
    qtd_erros = 0

    print("\nConstruindo timeline a partir de imagens/galeria/...")
    print("-" * 40)

    # Garante diretórios necessários
    if not os.path.exists(PASTA_DESTINO):
        print(f"Pasta de galeria não encontrada: {PASTA_DESTINO}")
        return
    os.makedirs(os.path.join(RAIZ_PROJETO, "data"), exist_ok=True)

    dados_timeline = []
    eventos_coletados = []

    # Percorre cada categoria dentro de imagens/galeria/
    categorias = sorted(os.listdir(PASTA_DESTINO))
    for categoria in categorias:
        caminho_categoria = os.path.join(PASTA_DESTINO, categoria)
        if not os.path.isdir(caminho_categoria):
            continue

        print(f"\nCategoria detectada: {categoria}")

        # Percorre pastas de data dentro da categoria
        entradas_data = sorted(os.listdir(caminho_categoria), reverse=True)
        for nome_data in entradas_data:
            caminho_data = os.path.join(caminho_categoria, nome_data)
            if not os.path.isdir(caminho_data):
                continue

            # Lista arquivos .webp nessa pasta de data
            fotos = [f for f in sorted(os.listdir(caminho_data)) if f.lower().endswith('.webp')]
            if not fotos:
                print(f"  ⚠️ Nenhuma foto .webp em: {categoria}/{nome_data}")
                continue

            # Tenta interpretar o nome da pasta como data; se falhar, marca como data inválida (None)
            parsed_date = None
            try:
                parsed_date = datetime.strptime(nome_data, "%Y-%m-%d")
            except Exception:
                print(f"  ⚠️ Data inválida detectada (incluindo no JSON): {categoria}/{nome_data}")

            qtd_eventos += 1
            qtd_fotos += len(fotos)
            print(f"  ✅ {len(fotos)} foto(s) encontradas em {categoria}/{nome_data}")

            eventos_coletados.append({
                "categoria": categoria,
                "data": nome_data,
                "caminho_relativo": f"{categoria}/{nome_data}",
                "fotos": fotos,
                "_parsed_date": parsed_date
            })

    # Ordena: eventos com data válida (desc por data) primeiro, depois eventos com data inválida (ordem alfabética desc)
    eventos_validos = [e for e in eventos_coletados if e.get('_parsed_date')]
    eventos_invalidos = [e for e in eventos_coletados if not e.get('_parsed_date')]

    eventos_validos.sort(key=lambda e: e['_parsed_date'], reverse=True)
    eventos_invalidos.sort(key=lambda e: e['data'], reverse=True)

    ordenados = eventos_validos + eventos_invalidos

    # Remove campo temporário e monta dados_timeline
    for e in ordenados:
        e.pop('_parsed_date', None)
        dados_timeline.append(e)

    # Salva o JSON
    try:
        with open(ARQUIVO_JSON, 'w', encoding='utf-8') as f:
            json.dump(dados_timeline, f, indent=2, ensure_ascii=False)
        print(f"\n💾 Timeline salva em: {ARQUIVO_JSON}")
    except Exception as e:
        print(f"\n❌ Erro ao salvar o JSON: {e}")

    # Relatório Final
    tempo_total = time.time() - tempo_inicio
    print("-" * 40)
    print(f"Processamento finalizado em {tempo_total:.2f} segundos")
    print(f"Eventos lidos: {qtd_eventos}")
    print(f"Fotos encontradas: {qtd_fotos}")
    print(f"Erros: {qtd_erros}")


if __name__ == '__main__':
    processar_timeline()