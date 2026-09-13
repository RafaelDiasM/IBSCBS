import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Code2,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Maximize2,
} from 'lucide-react';
import { apiClient } from '../services/api';

export const ApiPlayground: React.FC = () => {
  const [endpoint, setEndpoint] = useState<string>('/api/v1/calcular');
  const [method, setMethod] = useState<string>('POST');
  const [payloadText, setPayloadText] = useState<string>(
    JSON.stringify(
      {
        valor: 1500,
        tipoDocumento: 'nfe',
        valorFrete: 50,
        valorSeguro: 10,
        valorDesconto: 0,
        ncm: '24021000',
        ufDestino: 'SP',
        municipioDestino: 3550308,
        data: '2027-01-01',
        quantidade: 5,
        unidade: 'VN',
      },
      null,
      2
    )
  );

  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseText, setResponseText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [sdkLanguage, setSdkLanguage] = useState<string>('python');
  const [sdkCode, setSdkCode] = useState<string>('');

  const predefinidos = [
    {
      nome: 'Cálculo NF-e com Imposto Seletivo',
      endpoint: '/api/v1/calcular',
      method: 'POST',
      payload: {
        valor: 1500,
        tipoDocumento: 'nfe',
        valorFrete: 50,
        valorSeguro: 10,
        valorDesconto: 0,
        ncm: '24021000',
        ufDestino: 'SP',
        municipioDestino: 3550308,
        data: '2027-01-01',
        quantidade: 5,
        unidade: 'VN',
      },
    },
    {
      nome: 'Cálculo NFS-e (Serviços TI / NBS)',
      endpoint: '/api/v1/calcular',
      method: 'POST',
      payload: {
        valor: 6000,
        tipoDocumento: 'nfse',
        nbs: '109052100',
        ufDestino: 'MG',
        municipioDestino: 3106200,
        data: '2027-01-01',
      },
    },
    {
      nome: 'Cálculo CT-e (Frete de Cargas)',
      endpoint: '/api/v1/calcular',
      method: 'POST',
      payload: {
        valor: 3200,
        tipoDocumento: 'cte',
        outrasDespesas: 180,
        ufDestino: 'PR',
        municipioDestino: 4106902,
        data: '2027-01-01',
      },
    },
    {
      nome: 'Health & Observabilidade Governamental',
      endpoint: '/api/v1/observabilidade/health',
      method: 'GET',
      payload: null,
    },
  ];

  const carregarPredefinido = (item: any) => {
    setEndpoint(item.endpoint);
    setMethod(item.method);
    setPayloadText(item.payload ? JSON.stringify(item.payload, null, 2) : '');
  };

  const executarRequisicao = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      let parsedPayload = undefined;
      if (method === 'POST' && payloadText) {
        parsedPayload = JSON.parse(payloadText);
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: parsedPayload ? JSON.stringify(parsedPayload) : undefined,
      });

      const end = performance.now();
      setResponseTime(Math.round(end - start));
      setResponseStatus(res.status);

      const json = await res.json();
      setResponseText(JSON.stringify(json, null, 2));

      // Gerar snippets
      apiClient.gerarSnippetsSdk(endpoint, method, parsedPayload || {}).then((snippets) => {
        setSdkCode(snippets[sdkLanguage] || '');
      }).catch(console.error);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseText(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const copiarResposta = () => {
    navigator.clipboard.writeText(responseText);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="app-card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">
              API Playground & Console Interativo
            </h2>
            <p className="text-xs text-slate-400">
              Edite o payload JSON em tamanho expandido, envie requisições em tempo real e inspecione a resposta lado a lado.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Modelos Prontos:</span>
          {predefinidos.map((p, idx) => (
            <button
              key={idx}
              onClick={() => carregarPredefinido(p)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all font-mono text-xs font-medium"
            >
              {p.nome}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Request (Left) and Response (Right) Lado a Lado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Big Expanded Request Body (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="app-card mb-0">
            <div className="app-card-header">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Configuração da Requisição HTTP
              </h3>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                JSON REQUEST
              </span>
            </div>

            {/* Method + Endpoint Input */}
            <div className="flex gap-3 mb-4">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-32 font-mono font-bold text-xs"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>

              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="flex-1 font-mono text-xs"
              />
            </div>

            {/* Big Expanded Request Body Editor */}
            {method === 'POST' && (
              <div className="form-group mb-5">
                <label className="form-label flex items-center justify-between">
                  <span>Corpo da Requisição (JSON Payload - Campo Expandido):</span>
                  <span className="text-[10px] text-slate-500 font-mono">Linhas editáveis</span>
                </label>
                <textarea
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  className="w-full font-mono text-sm text-cyan-300 p-4 min-h-[440px] h-[440px] bg-[#060a14] rounded-xl border border-slate-700 leading-relaxed resize-y focus:border-cyan-400"
                  spellCheck={false}
                />
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={executarRequisicao}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <span>Executando requisição...</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Enviar Requisição HTTP (POST / GET)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Big Expanded Response Viewer & Multilingual SDK (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Response Box Lado a Lado */}
          <div className="app-card mb-0">
            <div className="app-card-header">
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-bold text-base text-white">Resposta do Servidor</h3>
                {responseStatus && (
                  <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                    responseStatus < 300 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {responseStatus} OK ({responseTime}ms)
                  </span>
                )}
              </div>

              {responseText && (
                <button
                  onClick={copiarResposta}
                  className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 font-medium"
                >
                  {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedResponse ? 'Copiado!' : 'Copiar Resposta'}
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#060a14] font-mono text-sm text-emerald-300 overflow-auto min-h-[440px] h-[440px] border border-slate-800 leading-relaxed shadow-inner">
              {responseText ? (
                <pre>{responseText}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                  <Terminal className="w-10 h-10 text-slate-700 mb-3" />
                  <span>Clique em <strong>"Enviar Requisição HTTP"</strong> para visualizar a resposta aqui.</span>
                </div>
              )}
            </div>
          </div>

          {/* Multilingual SDK Snippets */}
          <div className="app-card">
            <div className="app-card-header">
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                Snippet do SDK para Desenvolvedores
              </h3>

              <div className="flex flex-wrap gap-1 font-mono text-xs">
                {['python', 'typescript', 'curl', 'csharp', 'php', 'go'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSdkLanguage(lang);
                      apiClient.gerarSnippetsSdk(endpoint, method, payloadText ? JSON.parse(payloadText) : {}).then((res) => {
                        setSdkCode(res[lang] || '');
                      });
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      sdkLanguage === lang ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 overflow-auto h-48 border border-slate-800 leading-relaxed shadow-inner">
              {sdkCode ? (
                <pre>{sdkCode}</pre>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  <span>Selecione uma linguagem acima para gerar o código correspondente.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
