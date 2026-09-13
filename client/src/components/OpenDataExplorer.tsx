import React, { useState, useEffect } from 'react';
import { Search, Tag, MapPin, Sparkles, Play, ArrowRight, BookOpen, AlertCircle, Database, Check } from 'lucide-react';
import { apiClient } from '../services/api';

export const OpenDataExplorer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('cigarro');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Live Test Results
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState<boolean>(false);

  const executarBusca = async (termo: string) => {
    if (!termo.trim()) return;
    setLoading(true);
    try {
      const res = await apiClient.buscaGeral(termo);
      setSearchResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executarBusca(searchTerm);
  }, []);

  const testarItemInstantaneo = async (item: any) => {
    setTestLoading(true);
    try {
      const payload: any = {
        valor: 1000,
        ufDestino: 'SP',
        municipioDestino: 3550308,
        data: '2027-01-01',
      };

      if (item.tipo.includes('NCM')) {
        payload.ncm = item.codigo;
        payload.quantidade = 10;
        payload.unidade = item.unidade || 'UN';
        payload.cst = item.cstSugerido || '000';
      } else if (item.tipo.includes('Classificação Tributária')) {
        payload.cst = item.cst;
        payload.cClassTrib = item.codigo;
      } else if (item.tipo.includes('CST')) {
        payload.cst = item.codigo;
      } else if (item.tipo.includes('Município')) {
        payload.municipioDestino = parseInt(item.codigo, 10);
        payload.ufDestino = item.uf;
      }

      const res = await apiClient.calcularSimplificado(payload);
      setTestResult({ item, resultado: res });
    } catch (err) {
      console.error(err);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header & Global Search Bar */}
      <div className="app-card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">
              Busca Global de NCMs, CSTs & Municípios da API
            </h2>
            <p className="text-xs text-slate-400">
              Consulte dados abertos da Reforma Tributária e execute testes instantâneos na API em 1 clique.
            </p>
          </div>
        </div>

        {/* Big Search Input with Action Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                executarBusca(e.target.value);
              }}
              placeholder="Digite um código ou nome (ex: cigarro, cerveja, 24021000, são paulo, cst 200, whisky)..."
              className="pl-11 pr-4"
            />
          </div>
          <button
            onClick={() => executarBusca(searchTerm)}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl font-heading transition-all shadow-md shadow-amber-500/20 shrink-0"
          >
            {loading ? 'Pesquisando...' : 'Buscar na API'}
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Sugestões rápidas:</span>
          {['cigarro', 'cerveja', 'whisky', 'refrigerante', 'são paulo', 'cst 200', 'veículo'].map((sug) => (
            <button
              key={sug}
              onClick={() => {
                setSearchTerm(sug);
                executarBusca(sug);
              }}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all font-mono text-xs"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Search Results + Live Test Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Search Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Resultados da Busca ({searchResults?.totalResultados || 0})
            </span>
          </div>

          {loading ? (
            <div className="app-card text-center text-slate-400 py-12">
              Pesquisando nas tabelas da API...
            </div>
          ) : searchResults && searchResults.totalResultados > 0 ? (
            <div className="space-y-4">
              
              {/* NCMs */}
              {searchResults.ncms?.map((ncmItem: any) => (
                <div
                  key={ncmItem.codigo}
                  className="app-card mb-0 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono text-xs font-bold">
                        NCM {ncmItem.codigo}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {ncmItem.tipo}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {ncmItem.descricao}
                    </p>
                    <div className="text-xs font-mono text-slate-400 flex flex-wrap items-center gap-4 pt-1">
                      <span>Ad Valorem: <strong className="text-amber-400">{ncmItem.aliquotaAdValorem}%</strong></span>
                      {ncmItem.aliquotaAdRem && (
                        <span>Ad Rem: <strong className="text-rose-400">R$ {ncmItem.aliquotaAdRem} / {ncmItem.unidade}</strong></span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => testarItemInstantaneo(ncmItem)}
                    disabled={testLoading}
                    className="px-4 py-2.5 text-xs font-bold bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 rounded-xl flex items-center justify-center gap-2 shrink-0 transition-all font-heading"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Testar na API
                  </button>
                </div>
              ))}

              {/* CSTs */}
              {searchResults.csts?.map((cstItem: any) => (
                <div
                  key={cstItem.codigo}
                  className="app-card mb-0 hover:border-sky-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 font-mono text-xs font-bold">
                        CST {cstItem.codigo}
                      </span>
                      <span className="text-sm font-bold text-white">{cstItem.nome || cstItem.descricao}</span>
                    </div>
                    <p className="text-xs text-slate-400">{cstItem.descricao}</p>
                  </div>

                  <button
                    onClick={() => testarItemInstantaneo(cstItem)}
                    disabled={testLoading}
                    className="px-4 py-2.5 text-xs font-bold bg-sky-500/15 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-500/30 rounded-xl flex items-center justify-center gap-2 shrink-0 transition-all font-heading"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Testar CST
                  </button>
                </div>
              ))}

              {/* Classificações Tributárias (cClassTrib) */}
              {searchResults.classificacoes?.map((clItem: any) => (
                <div
                  key={clItem.codigo}
                  className="app-card mb-0 hover:border-purple-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono text-xs font-bold">
                        cClassTrib {clItem.codigo}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        CST {clItem.cst}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white">{clItem.nome}</p>
                    <p className="text-xs text-slate-400">{clItem.descricao}</p>
                    <span className="text-[11px] font-mono text-cyan-400 block pt-0.5">
                      ⚖️ {clItem.baseLegal} {clItem.reducaoPercentual > 0 ? `(-${clItem.reducaoPercentual}%)` : ''}
                    </span>
                  </div>

                  <button
                    onClick={() => testarItemInstantaneo(clItem)}
                    disabled={testLoading}
                    className="px-4 py-2.5 text-xs font-bold bg-purple-500/15 hover:bg-purple-500 text-purple-300 hover:text-slate-950 border border-purple-500/30 rounded-xl flex items-center justify-center gap-2 shrink-0 transition-all font-heading"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Testar Regra
                  </button>
                </div>
              ))}

              {/* Municipios */}
              {searchResults.municipios?.map((munItem: any) => (
                <div
                  key={munItem.codigo}
                  className="app-card mb-0 hover:border-purple-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono text-xs font-bold">
                        IBGE {munItem.codigo}
                      </span>
                      <span className="text-sm font-bold text-white">{munItem.descricao}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => testarItemInstantaneo(munItem)}
                    disabled={testLoading}
                    className="px-4 py-2.5 text-xs font-bold bg-purple-500/15 hover:bg-purple-500 text-purple-300 hover:text-slate-950 border border-purple-500/30 rounded-xl flex items-center justify-center gap-2 shrink-0 transition-all font-heading"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Testar Destino
                  </button>
                </div>
              ))}

            </div>
          ) : (
            <div className="app-card text-center text-slate-500 py-12 text-sm">
              Nenhum resultado encontrado para "{searchTerm}". Tente buscar por cigarro, cerveja, SP ou 24021000.
            </div>
          )}
        </div>

        {/* Right Column: Live API Test Result (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Painel de Teste em Tempo Real
          </span>

          <div className="app-card space-y-4 min-h-[420px]">
            {testLoading ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Sparkles className="w-8 h-8 animate-spin text-amber-400" />
                <span className="text-xs font-mono">Calculando tributos na API...</span>
              </div>
            ) : testResult ? (
              <div className="space-y-4 text-xs animate-fade-in">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Item Selecionado:</span>
                  <div className="font-bold text-amber-300 text-sm">{testResult.item.descricao || testResult.item.codigo}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="metric-box">
                    <span className="text-slate-400 text-[10px]">Valor da Operação</span>
                    <div className="text-base font-bold text-white mt-1">
                      R$ {testResult.resultado.resumo.valorOperacao.toFixed(2)}
                    </div>
                  </div>

                  <div className="metric-box highlight">
                    <span className="text-amber-400 text-[10px]">Total Tributos</span>
                    <div className="text-base font-bold text-amber-300 mt-1">
                      R$ {testResult.resultado.resumo.totalTributos.toFixed(2)}
                    </div>
                  </div>
                </div>

                {testResult.resultado.tributos.impostoSeletivo?.incide && (
                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30">
                    <span className="text-rose-400 font-bold block mb-1">Imposto Seletivo Ativo:</span>
                    <span className="text-slate-200 text-xs">
                      R$ {testResult.resultado.tributos.impostoSeletivo.valorTotal.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-sky-400">CBS Federal:</span>
                    <strong>R$ {testResult.resultado.tributos.cbs.valorTotal.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-400">IBS Estadual:</span>
                    <strong>R$ {testResult.resultado.tributos.ibsEstadual.valorTotal.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400">IBS Municipal:</span>
                    <strong>R$ {testResult.resultado.tributos.ibsMunicipal.valorTotal.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">Trecho XML Gerado:</span>
                  <pre className="text-[10px] font-mono text-cyan-300 overflow-x-auto max-h-32">
                    {testResult.resultado.xmlGerado}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs text-center p-6 space-y-2">
                <Play className="w-10 h-10 text-slate-600 mb-2" />
                <span>Clique em <strong>"Testar na API"</strong> em qualquer item da busca para visualizar o cálculo e o XML gerado instantaneamente.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
