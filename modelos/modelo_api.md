# Modelo de API

## **Endpoints**

---

### **PATCH - `/calcular_posicao`**
**Descrição**: Endpoint interno usado pelo servidor para calcular a posição da fonte sonora.

**Funcionamento**:
- Verifica se todas as posições no vetor `ordem` estão iguais (cada posição representa um sensor).
- Quando todas as posições estiverem iguais, o cálculo da posição será executado.
- Realiza o cálculo da posição utilizando **TOA (Time of Arrival)**.
- Salva a nova posição calculada na tabela `Fonte`.

**Status HTTP**:
- `202 Accepted`: Indica que o cálculo foi aceito e está em processamento.
- `409 Conflict`: Indica que as leituras ainda não estão sincronizadas e prontas para o cálculo.
- `500 Internal Server Error`: Indica falha no cálculo ou salvamento no banco.

---

### **POST - `/receber_leitura`**
**Descrição**: Recebe leituras dos sensores, verifica sincronização e armazena os dados.

**Funcionamento**:
- Verifica se todos os sensores estão sincronizados.
- Armazena a leitura recebida na tabela `Leitura`.
- Chama o endpoint interno `/calcular_posicao` para iniciar o cálculo da posição, caso necessário.

**Status HTTP**:
- `202 Accepted`: Leitura recebida e processamento iniciado.
- `400 Bad Request`: Dados enviados estão incompletos ou inválidos.
- `500 Internal Server Error`: Falha ao salvar a leitura ou ao acionar o cálculo.

**Exemplo de Dados Esperados**:
```json
{
    "id_sensor": 1,
    "hora_de_chegada": "10:10:01"
}

```
---

### **PATCH - `/sincronizacao`**
**Descrição**: Sincroniza os horários do sensor e da fonte com o horário do servidor (referência).

**Funcionamento**:
- recebe o erro calculado pela fonte/sensor e sua posição
- armazena na tabela especifica


**Status HTTP**:
- `202 Accepted`: Sincronização bem-sucedida.
- `400 Bad Request`: Dados enviados estão incompletos ou inválidos.
- `500 Internal Server Error`: Falha ao sincronizar ou salvar os dados.

**Exemplo de Dados Esperados**:
```json
{
    "coord_x": 10.1,
    "coord_y": 0.4,
    "erro": 100,
    "tipo":"fonte"
}
```

**Exemplo de Dados Retornados**:
```json
{
    "id":1
}
```

### **GET - `/posicao`**
**Descrição**: Retorna a posição calculada da fonte sonora.

**Funcionamento**:
- Consulta a tabela `Fonte` para obter as coordenadas mais recentes da posição calculada.
- Retorna as coordenadas no formato JSON.

**Status HTTP**:
- `200 OK`: Retorno bem-sucedido com a posição.
- `404 Not Found`: Nenhuma posição calculada encontrada.
- `500 Internal Server Error`: Falha ao consultar os dados no banco.

**Exemplo de Retorno**:
```json
{
    "coord_x": 10.1,
    "coord_y": 0.4
}
```

---

### **POST - `/som_enviado`**
**Descrição**: Recebe o horario do envio do som

**Funcionamento**:
- Armazena a informação na tabela `Som`.

**Status HTTP**:
- `202 Accepted`: Som recebido.
- `400 Bad Request`: Dados enviados estão incompletos ou inválidos.
- `500 Internal Server Error`: Falha ao salvar a leitura ou ao acionar o cálculo.

**Exemplo de Dados Esperados**:
```json
{
    "id_fonte": 1,
    "hora_de_emissao": "10:10:01"
}

```

### **DELETE - `/reset`**
**Descrição**: Reseta o sistema para um novo experimento

**Funcionamento**:
- Limpa os dados de todas as tabelas

**Status HTTP**:
- `202 Accepted`: Deletado com Sucesso.
- `500 Internal Server Error`: Falha ao deletar.

---

### **GET - `/horario_servidor`**
**Descrição**: Endpoint usado para retornar o horario do servidor, este horario é usado para calcular o erro dos relogios entre o servidor e o sensor/fonte

**Funcionamento**:
- retorna o horario atual do servidor

**Status HTTP**:
- `202 Accepted`: Indica que o processamento foi correto.
- `500 Internal Server Error`: Indica falha no servidor


**Exemplo de Retorno**:
```json
{
    "horario_atual":"10:10:00"
}
```






