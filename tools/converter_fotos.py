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

def converter_fotos():
    """Lê as fotos originais, converte para WebP e espelha a mesma estrutura de pastas na galeria."""
    print("\nIniciando conversão de imagens para .webp...")
    print("-" * 40)

    if not os.path.exists(PASTA_ORIGEM):
        print(f"Pasta de origem não encontrada: {PASTA_ORIGEM}")
        return

    # Garante que a pasta destino exista
    os.makedirs(PASTA_DESTINO, exist_ok=True)

    categorias = sorted(os.listdir(PASTA_ORIGEM))
    for categoria in categorias:
        caminho_categoria_origem = os.path.join(PASTA_ORIGEM, categoria)
        
        if not os.path.isdir(caminho_categoria_origem):
            continue

        # Cria a categoria no destino
        caminho_categoria_destino = os.path.join(PASTA_DESTINO, categoria)
        os.makedirs(caminho_categoria_destino, exist_ok=True)

        pastas_data = sorted(os.listdir(caminho_categoria_origem))
        for nome_pasta in pastas_data: 
            caminho_data_origem = os.path.join(caminho_categoria_origem, nome_pasta)
            
            if not os.path.isdir(caminho_data_origem):
                continue

            # Cria a pasta de data/ano EXATAMENTE com o mesmo nome no destino
            caminho_data_destino = os.path.join(caminho_categoria_destino, nome_pasta)
            os.makedirs(caminho_data_destino, exist_ok=True)

            arquivos = os.listdir(caminho_data_origem)
            for arquivo in arquivos:
                # Pula arquivos que não são imagens
                if not arquivo.lower().endswith(('.png', '.jpg', '.jpeg')):
                    continue
                
                nome_base = os.path.splitext(arquivo)[0]
                caminho_foto_origem = os.path.join(caminho_data_origem, arquivo)
                caminho_foto_destino = os.path.join(caminho_data_destino, f"{nome_base}.webp")

                # Só converte se a foto webp ainda não existir no destino
                if not os.path.exists(caminho_foto_destino):
                    try:
                        img = Image.open(caminho_foto_origem)
                        img.save(caminho_foto_destino, "webp", quality=80)
                        print(f"  📷 Convertido: {categoria}/{nome_pasta}/{nome_base}.webp")
                    except Exception as e:
                        print(f"  ❌ Erro ao converter {arquivo}: {e}")

def processar_timeline():
    """Gera o JSON lendo as pastas geradas pelo converter_fotos."""
    tempo_inicio = time.time()
    qtd_eventos, qtd_fotos, qtd_erros = 0, 0, 0

    print("\nConstruindo timeline a partir de imagens/galeria/...")
    print("-" * 40)

    if not os.path.exists(PASTA_DESTINO):
        print(f"Pasta de galeria não encontrada: {PASTA_DESTINO}")
        return
        
    os.makedirs(os.path.join(RAIZ_PROJETO, "data"), exist_ok=True)

    dados_timeline = []
    eventos_coletados = []

    categorias = sorted(os.listdir(PASTA_DESTINO))
    for categoria in categorias:
        caminho_categoria = os.path.join(PASTA_DESTINO, categoria)
        if not os.path.isdir(caminho_categoria): continue

        print(f"\nCategoria detectada: {categoria}")
        entradas_data = sorted(os.listdir(caminho_categoria), reverse=True)
        
        for nome_data in entradas_data:
            caminho_data = os.path.join(caminho_categoria, nome_data)
            if not os.path.isdir(caminho_data): continue

            fotos = [f for f in sorted(os.listdir(caminho_data)) if f.lower().endswith('.webp')]
            if not fotos:
                continue

            parsed_date = None
            try:
                # 1ª Tentativa: Data Completa (YYYY-MM-DD)
                parsed_date = datetime.strptime(nome_data, "%Y-%m-%d")
            except ValueError:
                try:
                    # 2ª Tentativa: Apenas Ano (YYYY)
                    parsed_date = datetime.strptime(nome_data, "%Y")
                except ValueError:
                    print(f"  ⚠️ Data inválida detectada: {categoria}/{nome_data}")
                    qtd_erros += 1

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

    # Ordenação
    eventos_validos = [e for e in eventos_coletados if e.get('_parsed_date')]
    eventos_invalidos = [e for e in eventos_coletados if not e.get('_parsed_date')]

    eventos_validos.sort(key=lambda e: e['_parsed_date'], reverse=True)
    eventos_invalidos.sort(key=lambda e: e['data'], reverse=True)

    ordenados = eventos_validos + eventos_invalidos

    # Limpa campo temporário e salva
    for e in ordenados:
        e.pop('_parsed_date', None)
        dados_timeline.append(e)

    try:
        with open(ARQUIVO_JSON, 'w', encoding='utf-8') as f:
            json.dump(dados_timeline, f, indent=2, ensure_ascii=False)
        print(f"\n💾 Timeline salva em: {ARQUIVO_JSON}")
    except Exception as e:
        print(f"\n❌ Erro ao salvar o JSON: {e}")

    tempo_total = time.time() - tempo_inicio
    print("-" * 40)
    print(f"Processamento finalizado em {tempo_total:.2f} segundos")

# Este bloco no final é o que faz as duas coisas acontecerem em sequência!
if __name__ == '__main__':
    converter_fotos()     
    processar_timeline()