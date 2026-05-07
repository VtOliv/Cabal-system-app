# Backend – Sistema de Personagens

## Endpoint base

```
http://localhost:8097/api/character
```

---

## Objeto `Character`

```json
{
  "id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "nome": "Serafino",
  "classe": "Mago",
  "meritoDourado": 142500,
  "meritoPlatin": 380000,
  "nivelAsa": 247
}
```

### Campos

| Campo          | Tipo     | Obrigatório | Descrição                                              |
|----------------|----------|-------------|--------------------------------------------------------|
| `id`           | `string` | Auto (DB)   | Identificador único gerado pelo banco (ObjectId/UUID) |
| `nome`         | `string` | Sim         | Nome do personagem                                     |
| `classe`       | `string` | Sim         | Classe do personagem (ex.: Mago, Guerreiro)            |
| `meritoDourado`| `number` | Sim         | Pontuação atual no mérito Dourado                      |
| `meritoPlatin` | `number` | Sim         | Pontuação atual no mérito Platina                      |
| `nivelAsa`     | `number` | Sim         | Nível atual da Asa do personagem                       |

---

## Endpoints necessários

### `GET /api/character`
Retorna a lista de todos os personagens cadastrados.

**Response `200`:**
```json
[
  {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "nome": "Serafino",
    "classe": "Mago",
    "meritoDourado": 142500,
    "meritoPlatin": 380000,
    "nivelAsa": 247
  }
]
```

---

### `GET /api/character/{nome}`
Retorna um personagem pelo nome.

**Parâmetro:** `nome` — nome exato do personagem (URL-encoded).

**Response `200`:** objeto `Character` único.

**Response `404`:** personagem não encontrado.

---

### `POST /api/character`
Cria um novo personagem.

**Body:**
```json
{
  "nome": "Serafino",
  "classe": "Mago",
  "meritoDourado": 142500,
  "meritoPlatin": 380000,
  "nivelAsa": 247
}
```

**Response `201`:** objeto `Character` criado com `id` preenchido.

---

### `PUT /api/character/{id}`
Substitui completamente um personagem existente (body completo obrigatório).

**Parâmetro:** `id` — identificador único do personagem.

**Body:**
```json
{
  "nome": "Serafino",
  "classe": "Mago",
  "meritoDourado": 150000,
  "meritoPlatin": 380000,
  "nivelAsa": 250
}
```

**Response `200`:** objeto `Character` atualizado.

---

### `DELETE /api/character/{id}`
Remove um personagem.

**Parâmetro:** `id` — identificador único do personagem.

**Response `204`:** sem corpo.

---

## Regras de negócio

- **`meritoDourado`** e **`meritoPlatin`** devem ser `>= 0` e não podem exceder o valor máximo (`ate`) da última faixa da tabela de mérito correspondente.
- **`nivelAsa`** deve ser `>= 0` e não pode exceder o nível máximo disponível na tabela de EXP da asa (ex.: 500).
- O campo `nome` não pode ser vazio.
- Não há autenticação de usuário no momento; todos os personagens são globais. No futuro, adicionar campo `userId` e filtrar por usuário logado.

---

## Sugestão de coleção no MongoDB

```
db.characters.createIndex({ nome: 1 })
```

Documento exemplo:
```bson
{
  _id: ObjectId("64f1a2b3c4d5e6f7a8b9c0d1"),
  nome: "Serafino",
  classe: "Mago",
  meritoDourado: 142500,
  meritoPlatin: 380000,
  nivelAsa: 247,
  criadoEm: ISODate("2026-05-07T00:00:00Z")
}
```
