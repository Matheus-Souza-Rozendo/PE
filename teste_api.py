import requests
from datetime import datetime

# 🔹 Cabeçalhos da requisição (se necessário)
headers = {
    "Content-Type": "application/json"
}

# 🔹 Capturar horário de envio da requisição
horario_envio = datetime.utcnow()  # Usar UTC para evitar problemas de fuso horário

# 🔹 Fazendo a requisição GET ao servidor
url = "http://localhost:3000/api/horario_servidor"  # Substitua pelo endpoint correto
response = requests.get(url, headers=headers)

# 🔹 Verificar se a requisição foi bem-sucedida
if response.status_code == 200:
    data = response.json()
    
    # 🔹 Convertendo a string do horário do servidor para datetime
    data_str = data.get('horario_atual')  # Exemplo: "2025-02-20T14:39:43.791000Z"
    
    if data_str:
        horario_servidor = datetime.strptime(data_str[:-1], "%Y-%m-%dT%H:%M:%S.%f")

        # 🔹 Capturar horário de recebimento da resposta
        horario_recebimento = datetime.utcnow()

        # ✅ Cálculo correto da média do envio e recebimento
        media_horario = horario_envio + (horario_recebimento - horario_envio) / 2

        # ✅ Calcular o erro em relação ao horário do servidor
        erro = media_horario - horario_servidor

        
        print(f"erro em microssegundos: {erro.total_seconds() * 1_000_000} µs")

     

        url = "http://localhost:3000/api/sincronizando"

        data = {
            "coord_x": 10.1,
            "coord_y": 0.4,
            "erro": erro.total_seconds() * 1_000_000,  # Convertendo erro para microssegundos
            "tipo": "fonte"
        }

        # ✅ Enviando JSON corretamente
        response = requests.patch(url, json=data, headers=headers)

        # 🔹 Verificando a resposta
        print("Status Code:", response.status_code)
        print("Resposta:", response.json())  # Tenta converter resposta para JSON

    else:
        print("❌ Erro: Campo 'horario_atual' não encontrado na resposta JSON.")
else:
    print(f"❌ Erro na requisição: {response.status_code}")
