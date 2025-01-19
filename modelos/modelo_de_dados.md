# Dicionário de Dados

## Tabela: Fonte
Armazena informações sobre as fontes sonoras no sistema.

| **Atributo** | **Tipo**  | **Descrição**                           | **Restrição**         |
|--------------|-----------|-----------------------------------------|-----------------------|
| `id_fonte`   | INTEGER   | Identificador único da fonte sonora.    | Chave primária, único.|
| `coord_x`    | FLOAT     | Coordenada X da posição da fonte.       | Não nulo.             |
| `coord_y`    | FLOAT     | Coordenada Y da posição da fonte.       | Não nulo.             |

---

## Tabela: Sensor
Registra informações sobre os sensores que realizam as leituras das fontes sonoras.

| **Atributo** | **Tipo**  | **Descrição**                           | **Restrição**         |
|--------------|-----------|-----------------------------------------|-----------------------|
| `id_sensor`  | INTEGER   | Identificador único do sensor.          | Chave primária, único.|
| `coord_x`    | FLOAT     | Coordenada X da posição do sensor.      | Não nulo.             |
| `coord_y`    | FLOAT     | Coordenada Y da posição do sensor.      | Não nulo.             |
| `error_time` | FLOAT     | Erro de tempo associado ao sensor (em ms). | Pode ser nulo.      |

---

## Tabela: Leitura
Armazena as leituras realizadas pelos sensores em relação às fontes sonoras.

| **Atributo**        | **Tipo**  | **Descrição**                                     | **Restrição**                  |
|----------------------|-----------|-------------------------------------------------|--------------------------------|
| `id_sensor`          | INTEGER   | Referência ao identificador do sensor.           | Chave estrangeira para `Sensor`. |
| `id_fonte`           | INTEGER   | Referência ao identificador da fonte sonora.     | Chave estrangeira para `Fonte`. |
| `tempo_de_chegada`   | DATE      | Horário em que o som foi detectado pelo sensor.  | Não nulo.                     |
| `ordem`              | INTEGER   | Ordem da leitura na lista de sensores.           | Não nulo.                     |
| `campo`              | TEXT      | Informações adicionais relacionadas à leitura.   | Pode ser nulo.                |

# Modelo do banco de dados NoSQL

```json
{
    "ordem": [],
    "sincronizado":[]
}
```

