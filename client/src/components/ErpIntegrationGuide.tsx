import React, { useState } from 'react';
import {
  Workflow,
  Calculator,
  FileCode,
  CheckCircle,
  FileCheck,
  Play,
  Copy,
  Check,
  Download,
  Terminal,
  ArrowRight,
  Code2,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { apiClient } from '../services/api';
import { gerarEBaixarKitErpZip } from '../utils/erpZipGenerator';

export const ErpIntegrationGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Estados dos 4 passos
  const [step1Input, setStep1Input] = useState<string>(
    JSON.stringify(
      {
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
      },
      null,
      2
    )
  );
  const [step1Output, setStep1Output] = useState<any>(null);

  const [step2Output, setStep2Output] = useState<string>('');
  const [step3Output, setStep3Output] = useState<any>(null);

  const [xmlNfeOriginal, setXmlNfeOriginal] = useState<string>('');
  const [xmlNfeInjetada, setXmlNfeInjetada] = useState<string>('');

  const [activeCodeTab, setActiveCodeTab] = useState<string>('python');

  // Carrega exemplo da NF-e original ao abrir
  React.useEffect(() => {
    apiClient.getExemploNfe().then(setXmlNfeOriginal).catch(console.error);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Executa Passo 1
  const runPasso1 = async () => {
    setLoading(true);
    try {
      const payload = JSON.parse(step1Input);
      const res = await fetch('/api/calculadora/regime-geral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setStep1Output(data);
      setCurrentStep(2);
    } catch (err: any) {
      alert('Erro ao executar Passo 1: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Executa Passo 2
  const runPasso2 = async () => {
    setLoading(true);
    try {
      const calcData = step1Output || JSON.parse(step1Input);
      const res = await fetch('/api/calculadora/xml/generate?tipo=NFe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/xml' },
        body: JSON.stringify(calcData),
      });
      const xml = await res.text();
      setStep2Output(xml);
      setCurrentStep(3);
    } catch (err: any) {
      alert('Erro ao executar Passo 2: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Executa Passo 3
  const runPasso3 = async () => {
    setLoading(true);
    try {
      const xmlToValidate = step2Output;
      const res = await fetch('/api/calculadora/xml/validate?tipo=nfe&subtipo=grupo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: xmlToValidate,
      });
      const data = await res.json();
      setStep3Output(data);
      setCurrentStep(4);
    } catch (err: any) {
      alert('Erro ao executar Passo 3: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Executa Passo 4 (Injeção de XML)
  const runPasso4 = async () => {
    setLoading(true);
    try {
      const res = await apiClient.injetarXmlDfe(xmlNfeOriginal, step2Output || step1Output);
      if (res.sucesso) {
        setXmlNfeInjetada(res.xmlNfeComRtc);
      } else {
        alert('Erro ao injetar XML: ' + res.mensagem);
      }
    } catch (err: any) {
      alert('Erro ao executar Passo 4: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Executa os 4 passos em sequência automática
  const runFluxoCompleto = async () => {
    setLoading(true);
    try {
      // 1. Calcular
      const payload = JSON.parse(step1Input);
      const r1 = await fetch('/api/calculadora/regime-geral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d1 = await r1.json();
      setStep1Output(d1);

      // 2. Gerar XML
      const r2 = await fetch('/api/calculadora/xml/generate?tipo=NFe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/xml' },
        body: JSON.stringify(d1),
      });
      const x2 = await r2.text();
      setStep2Output(x2);

      // 3. Validar XML
      const r3 = await fetch('/api/calculadora/xml/validate?tipo=nfe&subtipo=grupo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: x2,
      });
      const d3 = await r3.json();
      setStep3Output(d3);

      // 4. Injetar na NF-e
      const baseXml = xmlNfeOriginal || (await apiClient.getExemploNfe());
      const r4 = await apiClient.injetarXmlDfe(baseXml, x2);
      if (r4.sucesso) {
        setXmlNfeInjetada(r4.xmlNfeComRtc);
      }
      setCurrentStep(4);
    } catch (err: any) {
      alert('Erro no fluxo automatizado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadKit = async () => {
    setDownloading(true);
    try {
      await gerarEBaixarKitErpZip();
    } catch (err: any) {
      alert('Erro ao gerar pacote ZIP: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 border-slate-800 space-y-3 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <Workflow className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white font-heading">
                  Guia Oficial de Integração ERP (RTC)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Drop-in Replacement
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Fluxo completo dos 4 passos para conectar qualquer ERP à Calculadora da Reforma Tributária do Consumo (LC 214/2025).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadKit}
              disabled={downloading}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/5 transition-all cursor-pointer whitespace-nowrap"
              title="Baixar pacote ZIP com scripts Python, Node.js, C#, PHP e exemplos de NFe"
            >
              {downloading ? (
                <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              ) : (
                <Download className="w-4 h-4 text-cyan-400" />
              )}
              <span>{downloading ? 'Gerando Pacote...' : 'Baixar Kit ERP (.zip)'}</span>
            </button>

            <button
              onClick={runFluxoCompleto}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              {loading ? <Sparkles className="w-4 h-4 animate-spin text-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
              <span>Executar Fluxo Completo (1 a 4)</span>
            </button>
          </div>
        </div>

        {/* Status Bar dos 4 Passos */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setCurrentStep(1)}
            className={`p-3 rounded-xl text-left border transition-all ${
              currentStep === 1
                ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-md shadow-cyan-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span>Passo 1</span>
              {step1Output ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Calculator className="w-4 h-4 text-slate-500" />}
            </div>
            <div className="text-xs font-semibold text-white">Calcular Tributos</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">POST /api/calculadora/regime-geral</div>
          </button>

          <button
            onClick={() => setCurrentStep(2)}
            className={`p-3 rounded-xl text-left border transition-all ${
              currentStep === 2
                ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-md shadow-cyan-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span>Passo 2</span>
              {step2Output ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <FileCode className="w-4 h-4 text-slate-500" />}
            </div>
            <div className="text-xs font-semibold text-white">Gerar Grupos XML</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">&lt;IBSCBS&gt; e &lt;IS&gt;</div>
          </button>

          <button
            onClick={() => setCurrentStep(3)}
            className={`p-3 rounded-xl text-left border transition-all ${
              currentStep === 3
                ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-md shadow-cyan-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span>Passo 3</span>
              {step3Output ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <CheckCircle className="w-4 h-4 text-slate-500" />}
            </div>
            <div className="text-xs font-semibold text-white">Validar XML NT v1.30</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">POST /api/calculadora/xml/validate</div>
          </button>

          <button
            onClick={() => setCurrentStep(4)}
            className={`p-3 rounded-xl text-left border transition-all ${
              currentStep === 4
                ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-md shadow-cyan-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span>Passo 4 ⭐</span>
              {xmlNfeInjetada ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <FileCheck className="w-4 h-4 text-slate-500" />}
            </div>
            <div className="text-xs font-semibold text-white">Injetar na NF-e</div>
            <div className="text-[10px] text-cyan-400 font-mono mt-0.5 truncate">POST /api/v1/xml/inject</div>
          </button>
        </div>
      </div>

      {/* Conteúdo do Passo Selecionado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lado Esquerdo: Editor / Ação do Passo (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 border-slate-800 space-y-4">
            
            {currentStep === 1 && (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400">PASSO 1: CALCULAR TRIBUTOS</span>
                    <h3 className="text-base font-bold text-white">Dados de Entrada (JSON)</h3>
                  </div>
                  <button
                    onClick={() => handleCopy(step1Input, 'step1-in')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    title="Copiar JSON de Entrada"
                  >
                    {copied === 'step1-in' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Envia os itens da operação para <code>POST /api/calculadora/regime-geral</code>.
                </p>
                <textarea
                  value={step1Input}
                  onChange={(e) => setStep1Input(e.target.value)}
                  rows={14}
                  className="w-full font-mono text-xs p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={runPasso1}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Executar Cálculo do Passo 1</span>
                </button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400">PASSO 2: GERAR GRUPOS XML</span>
                    <h3 className="text-base font-bold text-white">Conversão de Cálculo em XML</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Chama o endpoint <code>POST /api/calculadora/xml/generate?tipo=NFe</code> que converte o ROC em XML formatado com <code>&lt;IBSCBS&gt;</code>, <code>&lt;IS&gt;</code>, <code>&lt;IBSCBSTot&gt;</code> e <code>&lt;ISTot&gt;</code>.
                </p>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle className="w-4 h-4" />
                    Cálculo Pré-carregado do Passo 1
                  </div>
                  <p className="text-slate-400">
                    O resultado do cálculo com os valores da CBS, IBS e IS está pronto para ser serializado no padrão oficial da Nota Técnica v1.30.
                  </p>
                </div>
                <button
                  onClick={runPasso2}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Gerar XML da RTC (Passo 2)</span>
                </button>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400">PASSO 3: VALIDAR XML GERADO</span>
                    <h3 className="text-base font-bold text-white">Conferência Estrutural NT v1.30</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Chama <code>POST /api/calculadora/xml/validate?tipo=nfe&subtipo=grupo</code> para verificar as regras de negócio e a sintaxe exigida pelo fisco.
                </p>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Info className="w-4 h-4" />
                    Validação Automática em 1 Clique
                  </div>
                  <p className="text-slate-400">
                    Verifica a presença das tags <code>&lt;vBC&gt;</code>, <code>&lt;gCBS&gt;</code>, <code>&lt;gIBSUF&gt;</code>, <code>&lt;IBSCBSTot&gt;</code> e consistência dos grupos.
                  </p>
                </div>
                <button
                  onClick={runPasso3}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Validar XML no Gateway (Passo 3)</span>
                </button>
              </>
            )}

            {currentStep === 4 && (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400">PASSO 4: INJETAR NA NF-E</span>
                    <h3 className="text-base font-bold text-white">Fusão Inteligente no XML</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Exclusivo EasyAPI
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Injeta automaticamente <code>&lt;IS&gt;</code> e <code>&lt;IBSCBS&gt;</code> dentro de <code>&lt;imposto&gt;</code> e <code>&lt;IBSCBSTot&gt;</code> dentro de <code>&lt;total&gt;</code> da NF-e original.
                </p>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">XML da NF-e Original (Sem RTC):</label>
                  <textarea
                    value={xmlNfeOriginal}
                    onChange={(e) => setXmlNfeOriginal(e.target.value)}
                    rows={10}
                    className="w-full font-mono text-[11px] p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  onClick={runPasso4}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Injetar Grupos da RTC na NF-e (Passo 4)</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Lado Direito: Visualizador de Saída / Código (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-6 border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {currentStep === 1 && 'Resultado do Cálculo (ROC JSON)'}
                  {currentStep === 2 && 'Grupos XML da RTC Gerados'}
                  {currentStep === 3 && 'Resultado da Validação Estrutural'}
                  {currentStep === 4 && 'NF-e 2027 Final Pronta para Emissão (com RTC Injetada)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {currentStep === 4 && xmlNfeInjetada && (
                  <button
                    onClick={() => handleDownload(xmlNfeInjetada, 'nfe-com-rtc.xml')}
                    className="flex items-center gap-1 text-xs text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 px-2.5 py-1.5 rounded-lg border border-cyan-700 font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar nfe-com-rtc.xml</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    const text =
                      currentStep === 1
                        ? JSON.stringify(step1Output, null, 2)
                        : currentStep === 2
                        ? step2Output
                        : currentStep === 3
                        ? JSON.stringify(step3Output, null, 2)
                        : xmlNfeInjetada || xmlNfeOriginal;
                    handleCopy(text, 'output-copy');
                  }}
                  className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 font-medium"
                >
                  {copied === 'output-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar</span>
                </button>
              </div>
            </div>

            {/* Painel de Código */}
            <div className="min-h-[460px] max-h-[560px] rounded-xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs overflow-auto leading-relaxed shadow-inner">
              {currentStep === 1 && (
                step1Output ? (
                  <pre className="text-cyan-300">{JSON.stringify(step1Output, null, 2)}</pre>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <Calculator className="w-8 h-8 text-slate-600" />
                    <span>Execute o Passo 1 para visualizar os tributos calculados.</span>
                  </div>
                )
              )}

              {currentStep === 2 && (
                step2Output ? (
                  <pre className="text-cyan-300">{step2Output}</pre>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <FileCode className="w-8 h-8 text-slate-600" />
                    <span>Execute o Passo 2 para gerar os blocos &lt;IBSCBS&gt; e &lt;IS&gt;.</span>
                  </div>
                )
              )}

              {currentStep === 3 && (
                step3Output ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                      <div className="font-bold flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4" />
                        Status da Validação:
                      </div>
                      <p className="text-xs">{step3Output.status}</p>
                    </div>
                    <pre className="text-slate-300">{JSON.stringify(step3Output, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <CheckCircle className="w-8 h-8 text-slate-600" />
                    <span>Execute o Passo 3 para validar a conformidade com a NT v1.30.</span>
                  </div>
                )
              )}

              {currentStep === 4 && (
                xmlNfeInjetada ? (
                  <pre className="text-emerald-300">{xmlNfeInjetada}</pre>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <FileCheck className="w-8 h-8 text-slate-600" />
                    <span>Clique em <strong>"Injetar Grupos da RTC na NF-e"</strong> para gerar a NF-e final completa.</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Código dos Scripts para os Desenvolvedores do ERP */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Scripts Prontos de Integração para Sistemas ERP</h3>
              <p className="text-xs text-slate-400">Copie e cole diretamente no seu projeto para automatizar a emissão.</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['python', 'node', 'curl'].map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveCodeTab(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase ${
                  activeCodeTab === lang
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-80">
            {activeCodeTab === 'python' && `# Script de Integração com a EasyAPI / Calculadora Oficial
import requests

BASE_URL = "http://localhost:3001/api/calculadora"

# 1. Calcular Tributos da RTC
res_calc = requests.post(f"{BASE_URL}/regime-geral", json={
    "municipio": 4314902, "uf": "RS",
    "itens": [{"numero": 1, "ncm": "24021000", "baseCalculo": 1000, "cst": "000", "cClassTrib": "000001"}]
})
roc = res_calc.json()

# 2. Gerar XML da RTC
res_xml = requests.post(f"{BASE_URL}/xml/generate?tipo=NFe", json=roc, headers={"Accept": "application/xml"})
xml_rtc = res_xml.text

# 3. Validar XML
res_val = requests.post(f"{BASE_URL}/xml/validate?tipo=nfe&subtipo=grupo", data=xml_rtc, headers={"Content-Type": "application/xml"})
print("Validado:", res_val.status_code == 200)

# 4. Injetar na NF-e Original
res_inj = requests.post("http://localhost:3001/api/v1/xml/inject", json={"xmlNfe": open("nfe-sem-rtc.xml").read(), "xmlRtc": xml_rtc})
with open("nfe-com-rtc.xml", "w", encoding="utf-8") as f:
    f.write(res_inj.json()["xmlNfeComRtc"])
print("NF-e pronta para emissão!")`}

            {activeCodeTab === 'node' && `// Node.js / TypeScript - Integração Completa
import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:3001/api/calculadora';

async function emitirNfeComRtc() {
  // 1. Calcular
  const { data: roc } = await axios.post(\`\${BASE_URL}/regime-geral\`, {
    municipio: 4314902, uf: 'RS',
    itens: [{ numero: 1, ncm: '24021000', baseCalculo: 1000, cst: '000', cClassTrib: '000001' }]
  });

  // 2. Gerar XML
  const { data: xmlRtc } = await axios.post(\`\${BASE_URL}/xml/generate?tipo=NFe\`, roc, {
    headers: { Accept: 'application/xml' }
  });

  // 3. Injetar na NFe
  const nfeOriginal = fs.readFileSync('nfe-sem-rtc.xml', 'utf-8');
  const { data: nfeFinal } = await axios.post('http://localhost:3001/api/v1/xml/inject', {
    xmlNfe: nfeOriginal,
    xmlRtc: xmlRtc
  });

  fs.writeFileSync('nfe-com-rtc.xml', nfeFinal.xmlNfeComRtc, 'utf-8');
  console.log('✅ NF-e emitida com sucesso com blocos <IBSCBS> e <IS>!');
}
emitirNfeComRtc();`}

            {activeCodeTab === 'curl' && `# 1. Calcular Tributos (Passo 1)
curl -X POST http://localhost:3001/api/calculadora/regime-geral \\
  -H "Content-Type: application/json" \\
  -d '{"municipio": 4314902, "uf": "RS", "itens": [{"numero": 1, "ncm": "24021000", "baseCalculo": 1000, "cst": "000", "cClassTrib": "000001"}]}'

# 2. Injetar RTC na NF-e (Passo 4 Direto via EasyAPI)
curl -X POST http://localhost:3001/api/v1/xml/inject \\
  -H "Content-Type: application/json" \\
  -d '{"calculo": {"valor": 1000, "cst": "000", "cClassTrib": "000001"}}'`}
          </pre>
        </div>
      </div>
    </div>
  );
};
