import concurrent.futures
import time
import requests
import json
from datetime import datetime

def tarefa(dados):
    """Função que simula um trabalho paralelo"""
    time.sleep(dados[0])
    if dados[0] == 0:
        agora = datetime.now().isoformat()
        URL = "http://localhost:3000/api/som_enviado"
        data = {"id_fonte": 1,"hora_de_emissao": agora}
        # Enviando a requisição PATCH
        response = requests.post(URL, json=data)
        # Exibindo a resposta do servidor
        print(f"Status Code: {response.status_code}")
        print("Response JSON:", response.json())
    else:
        agora = datetime.now().isoformat()
        URL = "http://localhost:3000/api/receber_leitura"
        data = {"id_sensor": dados[1],"hora_de_chegada": agora}
        # Enviando a requisição PATCH
        response = requests.post(URL, json=data)
        # Exibindo a resposta do servidor
        print(f"Status Code: {response.status_code}")
        print("Response JSON:", response.json())

    print(f"Tarefa concluída após {dados[0]} segundos!")

# Criar um pool de 4 threads para executar tarefas em paralelo
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    dados = [[0,1],[0.0076676385,1],[0.0102332362,2],[0.0102332362,3]]
    # Enviar 4 tarefas para execução
    futures = {executor.submit(tarefa, i): i for i in dados}
    
    # Aguardar a conclusão das tarefas
    for future in concurrent.futures.as_completed(futures):
        future.result()  # Garante que as exceções são propagadas

print("Todas as tarefas foram concluídas e encerradas!")