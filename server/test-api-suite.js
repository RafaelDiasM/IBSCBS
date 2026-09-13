import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = 'http://localhost:3001';

async function waitForServer(maxRetries = 25, intervalMs = 400) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/observabilidade/health`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) return true;
    } catch {
      // continua tentando
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

async function testApi() {
  let serverProcess = null;

  // Verifica se o servidor já está rodando
  let isRunning = false;
  try {
    const check = await fetch(`${BASE_URL}/api/v1/observabilidade/health`, { signal: AbortSignal.timeout(1500) });
    if (check.ok) isRunning = true;
  } catch {
    isRunning = false;
  }

  if (!isRunning) {
    console.log('⚡ Servidor offline. Inicializando instância de teste em http://localhost:3001...');
    let startupLogs = '';
    serverProcess = spawn(process.execPath, ['--import', 'tsx', 'src/server.ts'], {
      cwd: __dirname,
      stdio: 'pipe',
    });

    const appendStartupLog = (chunk) => {
      startupLogs += chunk.toString();
      if (startupLogs.length > 4000) {
        startupLogs = startupLogs.slice(-4000);
      }
    };

    serverProcess.stdout.on('data', appendStartupLog);
    serverProcess.stderr.on('data', appendStartupLog);

    serverProcess.on('error', (err) => {
      console.error('Erro ao iniciar processo do servidor de teste:', err);
    });

    const ready = await waitForServer();
    if (!ready) {
      if (startupLogs.trim()) {
        console.error('Logs de inicialização do servidor de teste:\n', startupLogs.trim());
      }
      if (serverProcess) serverProcess.kill();
      console.error('❌ Falha: Servidor de teste não respondeu a tempo.');
      process.exit(1);
    }
    console.log('✓ Servidor de teste iniciado e pronto para a bateria!\n');
  }

  console.log('========================================================================');
  console.log('🧪 INICIANDO BATERIA DE TESTES DE INTEGRAÇÃO DA API (IBS/CBS EasyAPI)');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  async function assert(name, fn) {
    process.stdout.write(`⏳ Testando: ${name}... `);
    try {
      const res = await fn();
      console.log(`\x1b[32m✓ SUCESSO\x1b[0m ${res ? `(${res})` : ''}`);
      passed++;
    } catch (err) {
      console.log(`\x1b[31m✗ FALHA:\x1b[0m ${err.message}`);
      failed++;
    }
  }

  // 1. Health & Versão
  console.log('\x1b[36m[1. Observabilidade & Versão]\x1b[0m');
  await assert('Health Check Gateway', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/observabilidade/health`).then(r => r.json());
    if (!res.gateway || res.gateway.status !== 'online') throw new Error('Gateway offline');
    return `Status: ${res.gateway.status}, Uptime: ${res.gateway.uptimeSegundos}s`;
  });

  await assert('Versão & Normas Legais', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/dados-abertos/versao`).then(r => r.json());
    if (!res.easyApiVersao) throw new Error('Versão não encontrada');
    return `Versão: ${res.easyApiVersao}, Normas: ${res.normasLegais.join(', ')}`;
  });

  // 2. Dados Abertos
  console.log('\n\x1b[36m[2. Dados Abertos & Tabelas Fiscais]\x1b[0m');
  await assert('Listagem de UFs (27 unidades)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/dados-abertos/ufs`).then(r => r.json());
    if (!Array.isArray(res) || res.length < 27) throw new Error(`Esperado 27 UFs, recebido ${res.length}`);
    return `${res.length} UFs retornadas`;
  });

  await assert('Municípios de SP', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/dados-abertos/ufs/municipios?siglaUf=SP`).then(r => r.json());
    if (!Array.isArray(res) || res.length === 0) throw new Error('Municípios não retornados');
    return `${res.length} municípios carregados (Ex: ${res[0].nome})`;
  });

  await assert('Listagem Completa de CSTs (17 Códigos)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/dados-abertos/csts`).then(r => r.json());
    if (!Array.isArray(res) || res.length < 17) throw new Error(`Esperado 17 CSTs, recebido ${res.length}`);
    return `${res.length} CSTs oficiais cadastrados`;
  });

  await assert('Listagem Completa de Classificações Tributárias (cClassTrib)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/dados-abertos/classificacoes-tributarias`).then(r => r.json());
    if (!Array.isArray(res) || res.length < 60) throw new Error(`Esperado 60+ classificações, recebido ${res.length}`);
    return `${res.length} classificações (cClassTrib) cadastradas`;
  });

  await assert('Filtro de cClassTrib por CST 200 (Educação, Saúde, Agro)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/dados-abertos/classificacoes-tributarias?cst=200`).then(r => r.json());
    if (!Array.isArray(res) || res.length === 0) throw new Error('Filtro CST 200 vazio');
    return `${res.length} regras de redução de 60% vinculadas`;
  });

  await assert('Consulta NCM de Cigarros com Imposto Seletivo (24021000)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/dados-abertos/ncm?ncm=24021000`).then(r => r.json());
    if (!res.tributadoPeloImpostoSeletivo) throw new Error('NCM deveria ter Imposto Seletivo');
    return `IS Ativo, Alíquota: ${res.aliquotaAdValorem}% + R$ ${res.aliquotaAdRem}/${res.unidade}`;
  });

  await assert('Busca Geral com Normalização Fonética (termo: "educacao")', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/dados-abertos/busca-geral?q=educacao`).then(r => r.json());
    if (res.totalResultados === 0) throw new Error('Busca não encontrou resultados');
    return `Total: ${res.totalResultados} encontrados (Top: ${res.classificacoes[0]?.nome})`;
  });

  // 3. Cálculos Tributários (One-Shot Simplificado)
  console.log('\n\x1b[36m[3. Motor de Cálculo Tributário - LC 214/2025]\x1b[0m');

  await assert('Cálculo Padrão 2027 (CST 000 / cClassTrib 000001)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/calcular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valor: 1000,
        cst: '000',
        cClassTrib: '000001',
        ufDestino: 'SP',
        municipioDestino: 3550308,
        data: '2027-01-01',
      }),
    }).then(r => r.json());

    if (res.resumo.totalTributos !== 85) {
      throw new Error(`Total esperado R$ 85,00, recebido R$ ${res.resumo.totalTributos}`);
    }
    return `Base R$ 1.000 -> CBS: R$ ${res.tributos.cbs.valorTotal} (8,4%), IBS: R$ ${res.tributos.ibsTotal.valorTotal} (0,1%), Total: R$ ${res.resumo.totalTributos}`;
  });

  await assert('Cálculo Cigarro com Imposto Seletivo Integrado na Base (Art. 13 LC 214)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/calcular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valor: 1500,
        valorFrete: 50,
        valorSeguro: 10,
        ncm: '24021000',
        quantidade: 5,
        unidade: 'VN',
        ufDestino: 'SP',
        municipioDestino: 3550308,
        data: '2027-01-01',
      }),
    }).then(r => r.json());

    if (!res.tributos.impostoSeletivo?.incide || res.tributos.impostoSeletivo.valorTotal <= 0) {
      throw new Error('Imposto seletivo não calculado');
    }
    // Base = 1560 + IS 309.30 = 1869.30 -> CBS/IBS incidem sobre 1869.30
    if (res.resumo.baseCalculoIBSCBS !== 1869.30) {
      throw new Error(`Base CBS/IBS incorreta: ${res.resumo.baseCalculoIBSCBS}`);
    }
    return `IS: R$ ${res.tributos.impostoSeletivo.valorTotal} -> Base IBS/CBS com IS: R$ ${res.resumo.baseCalculoIBSCBS} -> Total Tributos: R$ ${res.resumo.totalTributos}`;
  });

  await assert('Cálculo Educação com Redução de 60% (CST 200 / cClassTrib 200001)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/calcular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valor: 2000,
        tipoDocumento: 'nfse',
        cst: '200',
        cClassTrib: '200001',
        ufDestino: 'SP',
        municipioDestino: 3550308,
        data: '2027-01-01',
      }),
    }).then(r => r.json());

    // 2000 * 8.4% * 0.4 = 67.20 (CBS) + 2000 * 0.1% * 0.4 = 0.80 (IBS) = R$ 68.00 (3.40%)
    if (res.resumo.totalTributos !== 68) {
      throw new Error(`Total esperado R$ 68,00, recebido R$ ${res.resumo.totalTributos}`);
    }
    return `Base R$ 2.000 -> CBS -60%: R$ ${res.tributos.cbs.valorTotal} (3,36%), IBS -60%: R$ ${res.tributos.ibsTotal.valorTotal} (0,04%) -> Total: R$ ${res.resumo.totalTributos} (3,40%)`;
  });

  await assert('Cálculo Profissão Liberal com Redução de 30% (CST 210 / cClassTrib 210001)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/calcular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valor: 1000,
        tipoDocumento: 'nfse',
        cst: '210',
        cClassTrib: '210001',
        ufDestino: 'RJ',
        municipioDestino: 3304557,
        data: '2027-01-01',
      }),
    }).then(r => r.json());

    // 1000 * 8.4% * 0.7 = 58.80 + 1000 * 0.1% * 0.7 = 0.60 = R$ 59.40 (5.94%)
    if (res.resumo.totalTributos !== 59.40) {
      throw new Error(`Total esperado R$ 59,40, recebido R$ ${res.resumo.totalTributos}`);
    }
    return `Base R$ 1.000 -> Total com redução de 30%: R$ ${res.resumo.totalTributos} (5,94%)`;
  });

  await assert('Cálculo Cesta Básica Nacional Alíquota Zero (CST 220 / cClassTrib 220001)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/calcular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valor: 500,
        cst: '220',
        cClassTrib: '220001',
        ufDestino: 'MG',
        municipioDestino: 3106200,
        data: '2027-01-01',
      }),
    }).then(r => r.json());

    if (res.resumo.totalTributos !== 0) {
      throw new Error(`Total esperado R$ 0,00, recebido R$ ${res.resumo.totalTributos}`);
    }
    return `Alíquota Zero 100% Isenta -> Tributos: R$ 0,00 (0,00%)`;
  });

  await assert('Cálculo Ano Piloto 2026 (CBS 0,9% + IBS 0,1% = 1,0%)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/calcular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valor: 10000,
        cst: '000',
        ufDestino: 'SP',
        municipioDestino: 3550308,
        data: '2026-06-01',
      }),
    }).then(r => r.json());

    if (res.resumo.totalTributos !== 100) {
      throw new Error(`Total esperado R$ 100,00 (1,0%), recebido R$ ${res.resumo.totalTributos}`);
    }
    return `Base R$ 10.000 -> CBS 0,9% (R$ ${res.tributos.cbs.valorTotal}) + IBS 0,1% (R$ ${res.tributos.ibsTotal.valorTotal}) = R$ 100,00 (1,0%)`;
  });

  // 4. DFe XML Generator & Validator & Injector
  console.log('\n\x1b[36m[4. DFe & Geração / Validação / Injeção de XML da RTC]\x1b[0m');
  await assert('Geração de Trecho XML de NF-e (Modelo 55)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/xml/generate?tipo=nfe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor: 1000, cst: '000' }),
    }).then(r => r.text());

    if (!res.includes('<IBSCBS>') || !res.includes('<gCBS>')) {
      throw new Error('XML não contém as tags <IBSCBS> e <gCBS>');
    }
    return `XML gerado com ${res.length} caracteres`;
  });

  await assert('Validação de Estrutura XML de NF-e', async () => {
    const xmlMock = `<IBSCBS><CST>000</CST><cClassTrib>000001</cClassTrib><gCBS><vBC>1000.00</vBC><pCBS>8.40</pCBS><vCBS>84.00</vCBS></gCBS></IBSCBS>`;
    const res = await fetch(`${BASE_URL}/api/v1/xml/validate?tipo=nfe`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: xmlMock,
    }).then(r => r.json());

    if (!res.valido) throw new Error('Validação XML falhou');
    return `Status: ${res.status}, Tags Validadas: ${res.tagsVerificadas.length}`;
  });

  await assert('Injeção Automática de RTC na NF-e Original (Passo 4 do Guia ERP)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/xml/inject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        calculo: { valor: 1000, cst: '000', cClassTrib: '000001' },
      }),
    }).then(r => r.json());

    if (!res.sucesso || !res.xmlNfeComRtc.includes('<IBSCBS>') || !res.xmlNfeComRtc.includes('<IBSCBSTot>')) {
      throw new Error('Falha na injeção da RTC no XML da NF-e');
    }
    return `NF-e gerada com sucesso com tags <IBSCBS> em <imposto> e <IBSCBSTot> em <total>`;
  });

  await assert('Compatibilidade Drop-in com Rotas Oficiais do Governo (/api/calculadora/regime-geral)', async () => {
    const res = await fetch(`${BASE_URL}/api/calculadora/regime-geral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dhFatoGerador: '2027-01-01T03:00:00-03:00',
        uf: 'RS',
        municipio: 4314902,
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
      }),
    });
    if (res.status !== 200) throw new Error(`Status esperado 200, recebido ${res.status}`);
    return `Rota oficial do Governo respondeu HTTP 200 OK`;
  });

  // 5. SDK Snippet Generator
  console.log('\n\x1b[36m[5. Gerador de SDKs e Snippets]\x1b[0m');
  await assert('Geração de Snippets de Código (Python, Node.js, C#, PHP, cURL)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/sdk/snippets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: '/api/v1/calcular',
        method: 'POST',
        payload: { valor: 1000, ufDestino: 'SP' },
      }),
    }).then(r => r.json());

    if (!res.python || !res.javascript || !res.curl) {
      throw new Error('Snippets incompletos');
    }
    return `Snippets gerados para: ${Object.keys(res).join(', ')}`;
  });

  // Resumo Final
  console.log('\n========================================================================');
  console.log(`📊 RESULTADO FINAL: ${passed} PASSARAM | ${failed} FALHARAM`);
  if (failed === 0) {
    console.log('\x1b[32m🎉 TODOS OS TESTES DA API PASSARAM COM 100% DE SUCESSO!\x1b[0m');
  } else {
    console.log('\x1b[31m⚠️ ALGUNS TESTES APRESENTARAM FALHAS.\x1b[0m');
  }
  console.log('========================================================================\n');

  if (serverProcess) {
    if (process.platform === 'win32') {
      try {
        spawn('taskkill', ['/pid', serverProcess.pid.toString(), '/f', '/t']);
      } catch {
        serverProcess.kill();
      }
    } else {
      serverProcess.kill('SIGTERM');
    }
  }

  process.exit(failed === 0 ? 0 : 1);
}

testApi().catch((err) => {
  console.error('Erro na execução da suíte de testes:', err);
  process.exit(1);
});
