import JSZip from 'jszip';

export async function gerarEBaixarKitErpZip(apiUrl: string = 'http://localhost:3001') {
  const zip = new JSZip();

  // 1. README.md
  const readmeContent = `# Kit Oficial de Integração ERP - IBS/CBS EasyAPI
## Reforma Tributária do Consumo (EC 132/2023 e LC 214/2025)

Este pacote contém scripts prontos e funcionais para integrar qualquer sistema ERP
com o motor de cálculo da Reforma Tributária do Consumo e o gerador de grupos XML da Nota Técnica v1.30.

---

### Estrutura de Pastas
\`\`\`
integracao-erp/
├── README.md                  # Este guia
├── requirements.txt           # Dependências Python (requests)
├── input/                     # Arquivos de entrada do ERP
│   ├── entrada-regime-geral.json
│   └── nfe-sem-rtc.xml
├── scripts/                   # Scripts de integração
│   ├── 1-regime-geral.py      # Passo 1: Calcula tributos da RTC
│   ├── 2-gerar-xml.py         # Passo 2: Gera XML dos grupos RTC (<IBSCBS>, <IS>)
│   ├── 3-validar-grupo-xml.py # Passo 3: Valida regras e schemas do XML
│   ├── 4-injetar-xml.py       # Passo 4: Injeta grupos RTC na NF-e original
│   ├── integracao-completa.js # Exemplo em Node.js (tudo em 1)
│   ├── IntegracaoCompleta.cs  # Exemplo em C# (.NET)
│   └── integracao-completa.php# Exemplo em PHP
└── run/                       # Executáveis rápidos
    ├── executar-exemplo.bat   # Windows
    └── executar-exemplo.sh    # Linux/macOS
\`\`\`

---

### Como Executar

#### Opção A: Execução Automatizada em 1 Clique
* **Windows**: Dê duplo clique em \`run/executar-exemplo.bat\`
* **Linux/Mac**: No terminal, execute \`chmod +x run/executar-exemplo.sh && ./run/executar-exemplo.sh\`

#### Opção B: Passo a Passo em Python
\`\`\`bash
# 1. Instalar dependências
pip install -r requirements.txt

# 2. Executar os 4 passos sequenciais
python scripts/1-regime-geral.py
python scripts/2-gerar-xml.py
python scripts/3-validar-grupo-xml.py
python scripts/4-injetar-xml.py
\`\`\`

O arquivo final \`output/nfe-com-rtc.xml\` conterá sua NF-e pronta com os grupos:
* \`<IBSCBS>\` e \`<IS>\` dentro de \`<det>/<imposto>\`
* \`<IBSCBSTot>\` e \`<ISTot>\` dentro de \`<total>\`

---

### Configuração da API
Por padrão, os scripts apontam para a EasyAPI:
\`\`\`python
URL_BASE = "${apiUrl}"
\`\`\`
Compatível drop-in com a especificação oficial da Calculadora da Receita Federal.
`;

  zip.file('README.md', readmeContent);
  zip.file('requirements.txt', 'requests>=2.28.0\n');

  // Pasta input/
  const inputFolder = zip.folder('input');
  
  const entradaJson = {
    id: '507f1f77bcf86cd799439011',
    versao: '1.0.0',
    dataHoraEmissao: '2027-01-01T03:00:00-03:00',
    municipio: 4314902,
    uf: 'RS',
    itens: [
      {
        numero: 1,
        ncm: '24021000',
        quantidade: 222,
        unidade: 'VN',
        cst: '550',
        baseCalculo: 1111,
        cClassTrib: '550020',
        tributacaoRegular: {
          cst: '200',
          cClassTrib: '200032',
        },
        impostoSeletivo: {
          cst: '000',
          baseCalculo: 1111,
          cClassTrib: '000001',
          unidade: 'VN',
          quantidade: 222,
          impostoInformado: 0,
        },
      },
    ],
  };
  inputFolder?.file('entrada-regime-geral.json', JSON.stringify(entradaJson, null, 2));

  const nfeSemRtc = `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe43250100000000000000550010000000011000000010" versao="4.00">
    <ide>
      <cUF>43</cUF>
      <cNF>00000001</cNF>
      <natOp>VENDA DE MERCADORIA</natOp>
      <mod>55</mod>
      <serie>1</serie>
      <nNF>1</nNF>
      <dhEmi>2027-01-01T03:00:00-03:00</dhEmi>
      <tpNF>1</tpNF>
      <idDest>1</idDest>
      <cMunFG>4314902</cMunFG>
      <tpImp>1</tpImp>
      <tpEmis>1</tpEmis>
      <cDV>0</cDV>
      <tpAmb>2</tpAmb>
      <finNFe>1</finNFe>
      <indFinal>1</indFinal>
      <indPres>1</indPres>
      <procEmi>0</procEmi>
      <verProc>1.0.0</verProc>
    </ide>
    <emit>
      <CNPJ>00000000000191</CNPJ>
      <xNome>EMPRESA EMISSORA EXEMPLO LTDA</xNome>
      <enderEmit>
        <xLgr>RUA DAS FLORES</xLgr>
        <nro>123</nro>
        <xBairro>CENTRO</xBairro>
        <cMun>4314902</cMun>
        <xMun>PORTO ALEGRE</xMun>
        <UF>RS</UF>
        <CEP>90000000</CEP>
      </enderEmit>
      <IE>1234567890</IE>
      <CRT>3</CRT>
    </emit>
    <dest>
      <CNPJ>11111111000191</CNPJ>
      <xNome>EMPRESA DESTINATARIA EXEMPLO S/A</xNome>
      <enderDest>
        <xLgr>AVENIDA PAULISTA</xLgr>
        <nro>1000</nro>
        <xBairro>BELA VISTA</xBairro>
        <cMun>3550308</cMun>
        <xMun>SAO PAULO</xMun>
        <UF>SP</UF>
        <CEP>01310100</CEP>
      </enderDest>
      <indIEDest>1</indIEDest>
      <IE>9876543210</IE>
    </dest>
    <det nItem="1">
      <prod>
        <cProd>PROD001</cProd>
        <cEAN>SEM GTIN</cEAN>
        <xProd>CHARUTOS E CIGARRILHAS DE TABACO</xProd>
        <NCM>24021000</NCM>
        <CFOP>5102</CFOP>
        <uCom>VN</uCom>
        <qCom>222.0000</qCom>
        <vUnCom>5.0045</vUnCom>
        <vProd>1111.00</vProd>
        <cEANTrib>SEM GTIN</cEANTrib>
        <uTrib>VN</uTrib>
        <qTrib>222.0000</qTrib>
        <vUnTrib>5.0045</vUnTrib>
        <indTot>1</indTot>
      </prod>
      <imposto>
        <vTotTrib>0.00</vTotTrib>
        <ICMS>
          <ICMS00>
            <orig>0</orig>
            <CST>00</CST>
            <modBC>3</modBC>
            <vBC>1111.00</vBC>
            <pICMS>18.00</pICMS>
            <vICMS>199.98</vICMS>
          </ICMS00>
        </ICMS>
        <PIS>
          <PISAliq>
            <CST>01</CST>
            <vBC>1111.00</vBC>
            <pPIS>1.65</pPIS>
            <vPIS>18.33</vPIS>
          </PISAliq>
        </PIS>
        <COFINS>
          <COFINSAliq>
            <CST>01</CST>
            <vBC>1111.00</vBC>
            <pCOFINS>7.60</pCOFINS>
            <vCOFINS>84.44</vCOFINS>
          </COFINSAliq>
        </COFINS>
      </imposto>
    </det>
    <total>
      <ICMSTot>
        <vBC>1111.00</vBC>
        <vICMS>199.98</vICMS>
        <vICMSDeson>0.00</vICMSDeson>
        <vFCP>0.00</vFCP>
        <vBCST>0.00</vBCST>
        <vST>0.00</vST>
        <vFCPST>0.00</vFCPST>
        <vFCPSTRet>0.00</vFCPSTRet>
        <vProd>1111.00</vProd>
        <vFrete>0.00</vFrete>
        <vSeg>0.00</vSeg>
        <vDesc>0.00</vDesc>
        <vII>0.00</vII>
        <vIPI>0.00</vIPI>
        <vIPIDevol>0.00</vIPIDevol>
        <vPIS>18.33</vPIS>
        <vCOFINS>84.44</vCOFINS>
        <vOutro>0.00</vOutro>
        <vNF>1111.00</vNF>
      </ICMSTot>
    </total>
    <transp>
      <modFrete>9</modFrete>
    </transp>
    <pag>
      <detPag>
        <tPag>01</tPag>
        <vPag>1111.00</vPag>
      </detPag>
    </pag>
  </infNFe>
</NFe>`;
  inputFolder?.file('nfe-sem-rtc.xml', nfeSemRtc);

  // Pasta scripts/
  const scriptsFolder = zip.folder('scripts');

  // 1-regime-geral.py
  const script1Py = `import requests
import json
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
base_dir = os.path.dirname(script_dir)
input_dir = os.path.join(base_dir, 'input')
output_dir = os.path.join(base_dir, 'output')
os.makedirs(output_dir, exist_ok=True)

url = "${apiUrl}/api/calculadora/regime-geral"

input_file = os.path.join(input_dir, 'entrada-regime-geral.json')
with open(input_file, 'r', encoding='utf-8') as file:
    body = json.load(file)

print(f"Enviando cálculo para {url}...")
response = requests.post(url, json=body, headers={'Content-Type': 'application/json'})

if response.status_code == 200:
    output_file = os.path.join(output_dir, 'saida-regime-geral.json')
    with open(output_file, 'w', encoding='utf-8') as file:
        json.dump(response.json(), file, indent=2, ensure_ascii=False)
    print("Passo 1 Concluido com Sucesso: Calculo de tributos RTC realizado!")
    print(f"Resultado salvo em: {output_file}")
else:
    print(f"Erro na requisicao: {response.status_code}")
    print(f"Resposta: {response.text}")
    exit(1)
`;
  scriptsFolder?.file('1-regime-geral.py', script1Py);

  // 2-gerar-xml.py
  const script2Py = `import requests
import json
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
base_dir = os.path.dirname(script_dir)
output_dir = os.path.join(base_dir, 'output')

url = "${apiUrl}/api/calculadora/xml/generate"

input_file = os.path.join(output_dir, 'saida-regime-geral.json')
if not os.path.exists(input_file):
    print(f"ERRO: Execute primeiro o passo 1 (1-regime-geral.py)")
    exit(1)

with open(input_file, 'r', encoding='utf-8') as file:
    json_data = json.load(file)

params = {'tipo': 'NFe'}
print(f"Gerando grupos XML RTC em {url}...")
response = requests.post(url, json=json_data, params=params, headers={'Content-Type': 'application/json', 'Accept': 'application/xml'})

if response.status_code == 200:
    output_file = os.path.join(output_dir, 'saida-gerar-xml.xml')
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(response.text)
    print("Passo 2 Concluido com Sucesso: XML dos grupos RTC gerado!")
    print(f"Arquivo gerado: {output_file}")
else:
    print(f"Erro na geracao do XML: {response.status_code}")
    print(f"Resposta: {response.text}")
    exit(1)
`;
  scriptsFolder?.file('2-gerar-xml.py', script2Py);

  // 3-validar-grupo-xml.py
  const script3Py = `import requests
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
base_dir = os.path.dirname(script_dir)
output_dir = os.path.join(base_dir, 'output')

url = "${apiUrl}/api/calculadora/xml/validate"

input_file = os.path.join(output_dir, 'saida-gerar-xml.xml')
if not os.path.exists(input_file):
    print(f"ERRO: Execute primeiro o passo 2 (2-gerar-xml.py)")
    exit(1)

with open(input_file, 'r', encoding='utf-8') as file:
    xml_content = file.read()

params = {'tipo': 'nfe', 'subtipo': 'grupo'}
print(f"Validando grupos XML em {url}...")
response = requests.post(url, data=xml_content, params=params, headers={'Content-Type': 'application/xml'})

if response.status_code == 200:
    print("Passo 3 Concluido com Sucesso: XML da RTC estruturalmente valido!")
    print(f"Diagnostico: {response.text}")
else:
    print(f"XML Invalido: {response.status_code}")
    print(f"Erros encontrados: {response.text}")
    exit(1)
`;
  scriptsFolder?.file('3-validar-grupo-xml.py', script3Py);

  // 4-injetar-xml.py
  const script4Py = `import re
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
base_dir = os.path.dirname(script_dir)
input_dir = os.path.join(base_dir, 'input')
output_dir = os.path.join(base_dir, 'output')

source_file = os.path.join(output_dir, 'saida-gerar-xml.xml')
target_file = os.path.join(input_dir, 'nfe-sem-rtc.xml')
output_file = os.path.join(output_dir, 'nfe-com-rtc.xml')

if not os.path.exists(source_file):
    print("ERRO: Execute primeiro os passos anteriores.")
    exit(1)

with open(source_file, 'r', encoding='utf-8') as f:
    source_content = f.read()

with open(target_file, 'r', encoding='utf-8') as f:
    target_content = f.read()

# Extração dos blocos <IBSCBS>, <IS>, <IBSCBSTot>, <ISTot>
ibscbs_match = re.search(r'(<IBSCBS>.*?</IBSCBS>)', source_content, re.DOTALL)
is_match = re.search(r'(<IS>.*?</IS>)', source_content, re.DOTALL)
ibscbstot_match = re.search(r'(<IBSCBSTot>.*?</IBSCBSTot>)', source_content, re.DOTALL)
istot_match = re.search(r'(<ISTot>.*?</ISTot>)', source_content, re.DOTALL)

# 1. Injeta em <imposto> do item
imposto_blocks = []
if is_match:
    imposto_blocks.append(is_match.group(1))
if ibscbs_match:
    imposto_blocks.append(ibscbs_match.group(1))

if imposto_blocks:
    bloco_imposto = "\\n        " + "\\n        ".join(imposto_blocks)
    target_content = re.sub(r'(\\s*)(</imposto>)', f"{bloco_imposto}\\1\\2", target_content, count=1)

# 2. Injeta em <total> da NFe
total_blocks = []
if istot_match:
    total_blocks.append(istot_match.group(1))
if ibscbstot_match:
    total_blocks.append(ibscbstot_match.group(1))

if total_blocks:
    bloco_total = "\\n      " + "\\n      ".join(total_blocks)
    target_content = re.sub(r'(\\s*)(</ICMSTot>)', f"\\1\\2{bloco_total}", target_content, count=1)

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(target_content)

print("Passo 4 Concluido com Sucesso: Grupos da RTC injetados na NFe!")
print(f"Arquivo gerado com RTC: {output_file}")
`;
  scriptsFolder?.file('4-injetar-xml.py', script4Py);

  // Script Node.js completo
  const scriptNode = `const fs = require('fs');
const path = require('path');

const API_URL = '${apiUrl}';

async function main() {
  console.log('🚀 Iniciando Integração Completa NFe + RTC (Node.js)...');
  const baseDir = path.dirname(__dirname);
  const inputJson = JSON.parse(fs.readFileSync(path.join(baseDir, 'input', 'entrada-regime-geral.json'), 'utf8'));

  // 1. Calcular tributos
  console.log('1. Calculando tributos...');
  const resCalc = await fetch(\`\${API_URL}/api/calculadora/regime-geral\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputJson)
  });
  const calcData = await resCalc.json();

  // 2. Gerar XML
  console.log('2. Gerando XML RTC...');
  const resXml = await fetch(\`\${API_URL}/api/calculadora/xml/generate?tipo=nfe\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/xml' },
    body: JSON.stringify(calcData)
  });
  const xmlGrupos = await resXml.text();

  // 3. Injetar na NFe
  console.log('3. Injetando grupos RTC na NFe...');
  const nfeOriginal = fs.readFileSync(path.join(baseDir, 'input', 'nfe-sem-rtc.xml'), 'utf8');
  const resInject = await fetch(\`\${API_URL}/api/v1/xml/injetar-dfe\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ xmlRtc: xmlGrupos, xmlNfeOriginal: nfeOriginal })
  });
  const injectData = await resInject.json();

  const outputDir = path.join(baseDir, 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  fs.writeFileSync(path.join(outputDir, 'nfe-com-rtc.xml'), injectData.xmlNfeComRtc, 'utf8');

  console.log('🎉 Sucesso! Arquivo gerado em output/nfe-com-rtc.xml');
}

main().catch(console.error);
`;
  scriptsFolder?.file('integracao-completa.js', scriptNode);

  // Script C# (.NET)
  const scriptCs = `using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        string apiUrl = "${apiUrl}";
        using var client = new HttpClient();

        Console.WriteLine("1. Calculando tributos RTC...");
        string jsonInput = File.ReadAllText("../input/entrada-regime-geral.json");
        var content = new StringContent(jsonInput, Encoding.UTF8, "application/json");

        var responseCalc = await client.PostAsync($"{apiUrl}/api/calculadora/regime-geral", content);
        string jsonOutput = await responseCalc.Content.ReadAsStringAsync();

        Console.WriteLine("2. Gerando XML RTC...");
        var contentCalc = new StringContent(jsonOutput, Encoding.UTF8, "application/json");
        var responseXml = await client.PostAsync($"{apiUrl}/api/calculadora/xml/generate?tipo=nfe", contentCalc);
        string xmlRtc = await responseXml.Content.ReadAsStringAsync();

        Console.WriteLine("3. Injetando grupos RTC na NF-e...");
        string nfeOriginal = File.ReadAllText("../input/nfe-sem-rtc.xml");
        string payloadInject = $"{{\\"xmlRtc\\": {System.Text.Json.JsonSerializer.Serialize(xmlRtc)}, \\"xmlNfeOriginal\\": {System.Text.Json.JsonSerializer.Serialize(nfeOriginal)}}}";
        var contentInject = new StringContent(payloadInject, Encoding.UTF8, "application/json");
        var responseInject = await client.PostAsync($"{apiUrl}/api/v1/xml/injetar-dfe", contentInject);

        Console.WriteLine("Sucesso! NF-e enriquecida com a RTC.");
    }
}
`;
  scriptsFolder?.file('IntegracaoCompleta.cs', scriptCs);

  // Script Windows batch
  const runFolder = zip.folder('run');
  const batScript = `@echo off
echo ===================================================
echo   Executando Integracao ERP da RTC (IBS/CBS)
echo ===================================================

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Python 3 nao encontrado no PATH do sistema.
    pause
    exit /b 1
)

echo [1/4] Calculando tributos...
python ..\\scripts\\1-regime-geral.py
if %errorlevel% neq 0 exit /b 1

echo [2/4] Gerando grupos XML RTC...
python ..\\scripts\\2-gerar-xml.py
if %errorlevel% neq 0 exit /b 1

echo [3/4] Validando XML RTC...
python ..\\scripts\\3-validar-grupo-xml.py
if %errorlevel% neq 0 exit /b 1

echo [4/4] Injetando RTC na NFe...
python ..\\scripts\\4-injetar-xml.py
if %errorlevel% neq 0 exit /b 1

echo.
echo ===================================================
echo   FLUXO COMPLETO EXECUTADO COM 100%% DE SUCESSO!
echo   Arquivo gerado: output\\nfe-com-rtc.xml
echo ===================================================
pause
`;
  runFolder?.file('executar-exemplo.bat', batScript);

  const shScript = `#!/usr/bin/env bash
set -e
echo "==================================================="
echo "  Executando Integracao ERP da RTC (IBS/CBS)"
echo "==================================================="

echo "[1/4] Calculando tributos..."
python3 ../scripts/1-regime-geral.py

echo "[2/4] Gerando grupos XML RTC..."
python3 ../scripts/2-gerar-xml.py

echo "[3/4] Validando XML RTC..."
python3 ../scripts/3-validar-grupo-xml.py

echo "[4/4] Injetando RTC na NFe..."
python3 ../scripts/4-injetar-xml.py

echo "==================================================="
echo "  FLUXO COMPLETO EXECUTADO COM 100% DE SUCESSO!"
echo "  Arquivo gerado: output/nfe-com-rtc.xml"
echo "==================================================="
`;
  runFolder?.file('executar-exemplo.sh', shScript);

  // Gerar o blob do arquivo ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'integracao-erp-ibscbs.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
