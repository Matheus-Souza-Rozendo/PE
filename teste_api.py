import requests

# Definição dos parâmetros
url = "https://192.168.1.4:3000/api" 
metodo_http = "DELETE" 
endpoint = "/reset"
#endpoint = "/som_enviado"
#dados = { "id_sensor":1, "hora_de_chegada":"2025-03-02T17:00:00.016492Z"}
dados = { "id_sensor":3, "hora_de_chegada":"2025-03-02T17:00:00.021023Z"}
#dados = { "id_sensor":3, "hora_de_chegada":"2025-03-02T17:00:00.021023Z"}
#dados = { "id_fonte":1, "hora_de_emissao":"2025-03-02T17:00:00.000000Z"}
url = url + endpoint 
# Dicionário mapeando métodos HTTP para as funções da biblioteca requests
metodos = {
    "GET": requests.get,
    "POST": requests.post,
    "PUT": requests.put,
    "DELETE": requests.delete,
    "PATCH": requests.patch
}

# Verifica se o método é válido
if metodo_http in metodos:
    # Faz a requisição HTTP usando o método correspondente
    if metodo_http in ["POST", "PUT", "PATCH"]:
        resposta = metodos[metodo_http](url, json=dados, verify=False)
    else:
        resposta = metodos[metodo_http](url, verify=False)

    # Exibe a resposta
    print(f"Status Code: {resposta.status_code}")
    print(f"Resposta: {resposta.text}")

else:
    print("Erro: Método HTTP inválido!")
