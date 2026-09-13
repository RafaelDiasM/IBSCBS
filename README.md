# 🏛️ IBS/CBS EasyAPI & Developer Hub (Reforma Tributária Brasileira)

> **Gateway Inteligente de Alta Performance, Motor de Regras Tributárias (LC 214/2025 & EC 132/2023) e Plataforma Web de Simulação e Integração do IBS, CBS e Imposto Seletivo.**

![Reforma Tributária](https://img.shields.io/badge/Reforma%20Tribut%C3%A1ria-LC%20214%2F2025%20%7C%20EC%20132%2F2023-00f2fe?style=for-the-badge)
[![CI - Tests](https://github.com/RafaelDiasM/IBSCBS/actions/workflows/ci.yml/badge.svg)](https://github.com/RafaelDiasM/IBSCBS/actions)
![License MIT](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18-cyan?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-6-purple?style=for-the-badge&logo=vite)
![OpenAPI 3.1](https://img.shields.io/badge/OpenAPI-3.1-emerald?style=for-the-badge&logo=openapiinitiative)

---

## 📌 Por que este projeto foi criado?

A API oficial do Piloto de Consumo da Receita Federal e SERPRO (`piloto-cbs.tributos.gov.br`) introduz as regras de transição do novo IVA Dual (IBS estadual/municipal e CBS federal) e do Imposto Seletivo (*Sin Tax*). No entanto, o consumo direto apresenta desafios para desenvolvedores e ERPs:
- **Alta complexidade de payloads**: Schemas do ROC com mais de 80 campos aninhados.
- **Validações rígidas que mudam por ano**: Regras estritas para 2026 (teste), 2027 (início da CBS e extinção de PIS/COFINS), 2029-2032 (transição gradual de ICMS/ISS para IBS) e 2033 (IVA pleno).
- **Falta de comparativo de carga**: Necessidade de enxergar a diferença entre o sistema cumulativo antigo e o novo modelo não-cumulativo "por fora".

A **IBS/CBS EasyAPI** resolve esses problemas atuando como um **Gateway Inteligente**, oferecendo:
1. **Endpoint One-Shot (`POST /api/v1/calcular`)**: Você passa apenas valor, NCM/NBS, destino e data; a API faz todo o enriquecimento e cálculo completo.
2. **Auto-Enriquecimento e Auto-Healing**: Sanitiza payloads antes de enviar ao governo, evitando erros 400/422.
3. **Modo Híbrido Resiliente**: Conecta-se em tempo real ao servidor governamental quando online e aciona automaticamente o **Motor Local de Regras Tributárias (LC 214/2025)** caso o servidor oficial esteja instável.
4. **Gerador de SDKs**: Snippets instantâneos em **Python**, **JavaScript**, **TypeScript**, **cURL**, **C#**, **PHP** e **Go**.
5. **DFe & NFS-e Hub**: Geração e validação de trechos XML `<IBSCBS>` e `<IS>` para NF-e v1.30, NFC-e e NFS-e nacional.
6. **Interface Portfólio Interativa**: Design moderno com Dark Mode Glassmorphism, gráficos de distribuição tributária e guia completo da Reforma.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js v18+ (recomendado v20 ou v24)
- npm v9+

### Instalação Rápida
Clone o repositório e execute na raiz do projeto:

```bash
# 1. Instalar todas as dependências (raiz, backend e frontend)
npm run install:all

# 2. Iniciar o backend e frontend simultaneamente
npm run dev
```

- **Frontend / Developer Hub**: [http://localhost:5173](http://localhost:5173)
- **Backend / EasyAPI Gateway**: [http://localhost:3001](http://localhost:3001)
- **Documentação Swagger UI**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **Especificação OpenAPI 3.1 (JSON)**: [http://localhost:3001/api/openapi.json](http://localhost:3001/api/openapi.json)

---

## ⚡ Exemplos de Uso da API

### 1. Cálculo Simplificado One-Shot

```bash
curl -X POST "http://localhost:3001/api/v1/calcular" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 1500.00,
    "ncm": "24021000",
    "ufDestino": "SP",
    "municipioDestino": 3550308,
    "data": "2027-01-01",
    "quantidade": 5,
    "unidade": "VN"
  }'
```

#### Resposta Retornada:
```json
{
  "status": "sucesso",
  "modoExecucao": "oficial_governo",
  "resumo": {
    "valorOperacao": 1500.0,
    "baseCalculoIS": 1500.0,
    "baseCalculoIBSCBS": 1801.5,
    "valorImpostoSeletivo": 301.5,
    "valorCBS": 151.33,
    "valorIBSEstadual": 0.9,
    "valorIBSMunicipal": 0.9,
    "valorIBSTotal": 1.8,
    "totalTributos": 454.63,
    "aliquotaEfetivaTotal": 30.31,
    "valorFinalTotal": 1954.63
  },
  "comparativoLegado": {
    "totalSistemaLegado": 495.0,
    "diferencaValor": -40.37,
    "impactoCarga": "reducao"
  }
}
```

### 2. Integração em Python

```python
import requests

payload = {
    "valor": 1000.00,
    "ncm": "22030000", # Cerveja (sujeita a IS)
    "ufDestino": "RJ",
    "municipioDestino": 3304557,
    "data": "2027-01-01",
    "quantidade": 20,
    "unidade": "LT"
}

response = requests.post("http://localhost:3001/api/v1/calcular", json=payload)
data = response.json()

print(f"Total Tributos: R$ {data['resumo']['totalTributos']}")
print(f"CBS Federal: R$ {data['tributos']['cbs']['valorTotal']}")
print(f"IBS Estadual ({payload['ufDestino']}): R$ {data['tributos']['ibsEstadual']['valorTotal']}")
```

---

## 🗺️ Tabela de Endpoints da EasyAPI

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/v1/calcular` | Cálculo simplificado inteligente com comparativo de carga |
| `POST` | `/api/v1/calculadora/regime-geral` | Cálculo oficial ROC com auto-healing e fallback LC 214 |
| `POST` | `/api/v1/calculadora/pedagio` | Cálculo de pedágios com múltiplos trechos |
| `GET` | `/api/v1/dados-abertos/ncm` | Consulta NCM e alíquotas de Imposto Seletivo (ad valorem e ad rem) |
| `GET` | `/api/v1/dados-abertos/ncm/imposto-seletivo` | Catálogo de produtos com incidência de *Sin Tax* |
| `GET` | `/api/v1/dados-abertos/ufs` | Lista de UFs e códigos IBGE |
| `GET` | `/api/v1/dados-abertos/ufs/municipios` | Lista e busca de municípios por Estado |
| `GET` | `/api/v1/dados-abertos/cronograma` | Cronograma oficial da transição (2026 a 2033) |
| `GET` | `/api/v1/observabilidade/health` | Status de saúde e latência do servidor do governo |
| `POST` | `/api/v1/xml/generate` | Gerador de trechos XML DFe para NF-e e NFC-e |
| `POST` | `/api/v1/sdk/snippets` | Gerador dinâmico de código SDK |

---

## 🏛️ Cronograma da Reforma Tributária (LC 214/2025)

- **2026**: Teste piloto com 0,9% CBS + 0,1% IBS compensáveis com PIS/COFINS.
- **2027**: Entrada plena da CBS (~8,4%) e Imposto Seletivo. **Extinção integral do PIS e COFINS**.
- **2028**: Manutenção da CBS e preparação dos sistemas estaduais e municipais.
- **2029 a 2032**: Redução gradual de ICMS e ISS (10% ao ano) e aumento gradativo do IBS.
- **2033+**: **Vigência Plena do IVA Dual**. ICMS, ISS e IPI totalmente extintos. Arrecadação 100% no destino.

---

## 👨‍💻 Desenvolvedor & Autor

**Rafael Dias Mazzilli**  
📍 Porto Alegre, RS - Brasil  
🔗 GitHub: [@RafaelDiasM](https://github.com/RafaelDiasM)  

*Projeto Open-Source desenvolvido para modernização fiscal, aceleração da integração com o IVA Dual brasileiro (IBS/CBS e Imposto Seletivo) e fomento ao ecossistema de desenvolvedores de ERPs e sistemas emissores.*

