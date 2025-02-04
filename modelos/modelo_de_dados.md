# Dicionário de Dados - Sistema de Trilateração por TOA

## Tabelas e Descrição dos Campos

### 1. **Fonte**
Armazena as coordenadas das fontes sonoras que emitem os pulsos sonoros.

| Nome do Campo | Tipo de Dado | Descrição |
|--------------|-------------|------------|
| `id_fonte`   | INTEGER (PK) | Identificador único da fonte sonora |
| `coord_x`    | FLOAT       | Coordenada X da fonte sonora |
| `coord_y`    | FLOAT       | Coordenada Y da fonte sonora |
| `error_time` | TIME        | Margem de erro na medição do tempo|

---

### 2. **Som**
Registra os eventos de emissão dos pulsos sonoros pelas fontes sonoras.

| Nome do Campo      | Tipo de Dado | Descrição |
|-------------------|-------------|------------|
| `ordem_emissao`  | INTEGER (PK) | Número sequencial da emissão do pulso por uma fonte |
| `horario`        | TIME        | Horário exato em que o pulso foi emitido |
| `id_fonte`       | INTEGER (FK) | Identificador da fonte sonora que emitiu o pulso |

🔗 **Chave Estrangeira**:  
- `id_fonte` → **Fonte(id_fonte)**

---

### 3. **Sensor**
Armazena as informações sobre os sensores que captam os sinais emitidos pela fonte sonora.

| Nome do Campo | Tipo de Dado | Descrição |
|--------------|-------------|------------|
| `id_sensor`  | INTEGER (PK) | Identificador único do sensor |
| `coord_x`    | FLOAT       | Coordenada X do sensor |
| `coord_y`    | FLOAT       | Coordenada Y do sensor |
| `error_time` | TIME        | Margem de erro na medição do tempo de chegada do som |

---

### 4. **Leitura**
Registra as leituras dos sensores, associando-as a um evento de emissão sonora.

| Nome do Campo     | Tipo de Dado | Descrição |
|------------------|-------------|------------|
| `id_sensor`      | INTEGER (PK, FK) | Identificador do sensor que captou o som |
| `id_fonte`       | INTEGER (PK, FK) | Identificador da fonte sonora associada à leitura |
| `tempo_de_chegada` | TIME        | Tempo registrado pelo sensor ao detectar o som |
| `ordem`          | INTEGER      | Ordem de detecção do pulso pelo sensor |

🔗 **Chaves Estrangeiras**:  
- `id_sensor` → **Sensor(id_sensor)**  
- `id_fonte` → **Fonte(id_fonte)**  

---

## 📌 Observações Gerais
- As tabelas `Fonte`, `Sensor` e `Som` armazenam informações estáticas, enquanto `Leitura` contém os registros dinâmicos das medições.
- A combinação `ordem_emissao` e `id_fonte` define a chave primária da tabela `Som`, garantindo que cada evento seja único para uma determinada fonte.
- A tabela `Leitura` usa uma chave composta (`id_sensor`, `id_fonte`) para garantir que cada sensor registre corretamente a detecção do som.

---
📌 **Este dicionário de dados documenta a estrutura da base de dados utilizada para a trilateração via TOA (Time of Arrival) e pode ser expandido conforme novas funcionalidades forem adicionadas ao sistema.**
