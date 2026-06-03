import os
import json
import time
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

    print("\nIniciando o processamento da Galeria...")
    print("-" * 40)

    # Cria pastas base se não existirem
    if not os.path.exists(PASTA_DESTINO): os.makedirs(PASTA_DESTINO)
    if not os.path.exists(os.path.join(RAIZ_PROJETO, "data")): os.makedirs(os.path.join(RAIZ_PROJETO, "data"))

    dados_timeline = []

    # Se a pasta de origem não existir, avisa e para
    if not os.path.exists(PASTA_ORIGEM):
        print(f"❌ Pasta não encontrada: {PASTA_ORIGEM}")
        return

    # Lista e ordena cronologicamente
    pastas_eventos = sorted(os.listdir(PASTA_ORIGEM), reverse=True)

    for nome_pasta in pastas_eventos:
        caminho_pasta_origem = os.path.join(PASTA_ORIGEM, nome_pasta)
        
        if not os.path.isdir(caminho_pasta_origem):
            continue

        qtd_eventos += 1
        print(f"\n📁 Lendo evento: {nome_pasta}")
        
        caminho_pasta_destino = os.path.join(PASTA_DESTINO, nome_pasta)
        if not os.path.exists(caminho_pasta_destino):
            os.makedirs(caminho_pasta_destino)

        fotos_do_evento = []
        arquivos = [f for f in os.listdir(caminho_pasta_origem) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

        if not arquivos:
            print("  ⚠️ Nenhuma foto encontrada nesta pasta.")
        else:
            print(f"  ℹ️ {len(arquivos)} arquivo(s) encontrado(s). Iniciando conversão...")

        # Processa cada arquivo de imagem na pasta do evento
        for nome_arquivo in arquivos:
            caminho_origem_arquivo = os.path.join(caminho_pasta_origem, nome_arquivo)
            nome_base, _ = os.path.splitext(nome_arquivo)
            nome_webp = f"{nome_base}.webp"
            caminho_destino_arquivo = os.path.join(caminho_pasta_destino, nome_webp)

            try:
                with Image.open(caminho_origem_arquivo) as img:
                    # Converte para RGB para garantir compatibilidade antes de salvar como WebP
                    if img.mode != 'RGB':
                        img = img.convert('RGB')

                    # Salva no formato WebP com qualidade otimizada
                    img.save(caminho_destino_arquivo, 'WEBP', quality=80, optimize=True)

                # Caminho relativo padrão (imagens/galeria/<evento>/<arquivo.webp>) com barras Unix
                caminho_relativo = os.path.join('imagens', 'galeria', nome_pasta, nome_webp).replace(os.sep, '/')
                fotos_do_evento.append(caminho_relativo)
                qtd_fotos += 1
                print(f"  ✅ Convertido: {nome_arquivo} -> {nome_webp}")

            except Exception as e:
                qtd_erros += 1
                print(f"  ❌ Erro ao processar {nome_arquivo}: {e}")

        # Mesmo que não haja fotos, adicionamos o evento (com lista vazia)
        evento = {
            'data': nome_pasta,
            'fotos': fotos_do_evento
        }
        dados_timeline.append(evento)

    # Grava o arquivo JSON com indentação legível
    try:
        with open(ARQUIVO_JSON, 'w', encoding='utf-8') as fh:
            json.dump(dados_timeline, fh, ensure_ascii=False, indent=2)
        print(f"\n💾 Timeline salva em: {ARQUIVO_JSON}")
    except Exception as e:
        print(f"❌ Erro ao gravar {ARQUIVO_JSON}: {e}")

    # Relatório final
    tempo_total = time.time() - tempo_inicio
    print("-" * 40)
    print(f"Processamento finalizado em {tempo_total:.2f} segundos")
    print(f"Eventos lidos: {qtd_eventos}")
    print(f"Fotos convertidas: {qtd_fotos}")
    print(f"Erros: {qtd_erros}")


if __name__ == '__main__':
    processar_timeline()