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

### **PATCH - `/sincronizacao`**
**Descrição**: Sincroniza os horários do sensor com o horário do servidor (referência).

**Funcionamento**:
- Calcula o erro entre o horário do computador (servidor de referência) e o horário do celular.
- Como estão na mesma rede, ignora os atrasos determinísticos da internet.
- Salva as informações de sincronização na tabela correspondente.

**Status HTTP**:
- `202 Accepted`: Sincronização bem-sucedida.
- `400 Bad Request`: Dados enviados estão incompletos ou inválidos.
- `500 Internal Server Error`: Falha ao sincronizar ou salvar os dados.

**Exemplo de Dados Esperados**:
```json
{
    "coord_x": 10.1,
    "coord_y": 0.4,
    "hora_atual": "10:10:01"
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






