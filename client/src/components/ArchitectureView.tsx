import React from 'react';
import { Server, Layers, Cpu, Database, ShieldCheck, Terminal, Download, ArrowRight } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-panel p-6 border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🏛️</span>
          <h2 className="text-xl font-bold text-white font-heading">
            Arquitetura do Sistema & Especificações Técnicas
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          Visão geral da engenharia de software da EasyAPI, fluxo de dados, modelo de resiliência e endpoints disponíveis.
        </p>
      </div>

      {/* Architecture Flow Diagram (Visual) */}
      <div className="glass-panel p-6 border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Fluxo de Execução e Resiliência
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 relative">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold flex items-center justify-center text-sm border border-cyan-500/20">
              1
            </div>
            <div className="text-xs font-bold text-white">Requisição do Cliente</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ERP, E-commerce ou Desenvolvedor envia dados simplificados (Valor, NCM, Destino).
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-2 relative">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 font-bold flex items-center justify-center text-sm border border-sky-500/20">
              2
            </div>
            <div className="text-xs font-bold text-cyan-300">EasyAPI Gateway</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sanitiza campos, detecta incidência de IS, busca alíquotas no cache em memória.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 relative">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/20">
              3
            </div>
            <div className="text-xs font-bold text-white">Piloto SERPRO / Receita</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Consulta o servidor governamental. Se houver timeout ou indisponibilidade, aciona o motor local.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2 relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/20">
              4
            </div>
            <div className="text-xs font-bold text-emerald-300">Resposta Enriquecida</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Retorna valores calculados, memória jurídica (LC 214) e comparativo de carga legado.
            </p>
          </div>
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          Tabela de Endpoints da EasyAPI (/api/v1)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Método</th>
                <th className="py-2.5 px-3">Rota</th>
                <th className="py-2.5 px-3">Descrição</th>
                <th className="py-2.5 px-3">Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">POST</span></td>
                <td className="py-3 px-3 text-cyan-300 font-semibold">/api/v1/calcular</td>
                <td className="py-3 px-3 font-sans">Cálculo simplificado one-shot com enriquecimento e comparativo</td>
                <td className="py-3 px-3"><span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">EasyAPI Core</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">POST</span></td>
                <td className="py-3 px-3 text-white">/api/v1/calculadora/regime-geral</td>
                <td className="py-3 px-3 font-sans">Cálculo do ROC oficial com auto-healing de payload e fallback LC 214</td>
                <td className="py-3 px-3"><span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">Piloto SEFAZ</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">GET</span></td>
                <td className="py-3 px-3 text-white">/api/v1/dados-abertos/ncm</td>
                <td className="py-3 px-3 font-sans">Consulta de NCM com indicador de Imposto Seletivo e alíquotas</td>
                <td className="py-3 px-3"><span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">Cache / Receita</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">GET</span></td>
                <td className="py-3 px-3 text-white">/api/v1/dados-abertos/cronograma</td>
                <td className="py-3 px-3 font-sans">Tabela de fases da transição tributária (2026 a 2033)</td>
                <td className="py-3 px-3"><span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">LC 214/2025</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">GET</span></td>
                <td className="py-3 px-3 text-white">/api/v1/observabilidade/health</td>
                <td className="py-3 px-3 font-sans">Monitoramento de integridade e latência do servidor do governo</td>
                <td className="py-3 px-3"><span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">EasyAPI Monitor</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">POST</span></td>
                <td className="py-3 px-3 text-white">/api/v1/xml/generate</td>
                <td className="py-3 px-3 font-sans">Geração de tags XML &lt;IBSCBS&gt; e &lt;IS&gt; para NF-e v1.30</td>
                <td className="py-3 px-3"><span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">DFe Engine</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
