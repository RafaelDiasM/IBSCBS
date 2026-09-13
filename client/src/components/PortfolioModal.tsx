import React from 'react';
import {
  X,
  Sparkles,
  Github,
  Linkedin,
  Mail,
  Download,
  Server,
  Layers,
  CheckCircle2,
  Code,
  ShieldCheck,
} from 'lucide-react';

import { HealthData } from '../services/api';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  health?: HealthData | null;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const downloadPostman = () => {
    const postmanCollection = {
      info: {
        name: 'IBS/CBS EasyAPI - Postman Collection',
        description: 'Coleção de testes para a EasyAPI da Reforma Tributária (LC 214/2025)',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: [
        {
          name: 'Cálculo Simplificado One-Shot',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: { raw: 'http://localhost:3001/api/v1/calcular', host: ['http://localhost:3001'], path: ['api', 'v1', 'calcular'] },
            body: {
              mode: 'raw',
              raw: JSON.stringify({ valor: 1000, ncm: '24021000', ufDestino: 'SP', municipioDestino: 3550308, data: '2027-01-01' }, null, 2),
            },
          },
        },
        {
          name: 'Saúde do Servidor',
          request: {
            method: 'GET',
            url: { raw: 'http://localhost:3001/api/v1/observabilidade/health', host: ['http://localhost:3001'], path: ['api', 'v1', 'observabilidade', 'health'] },
          },
        },
      ],
    };

    const blob = new Blob([JSON.stringify(postmanCollection, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ibscbs-easyapi-postman-collection.json';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative space-y-6 shadow-2xl shadow-cyan-500/10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Badge */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Destaque de Portfólio Técnico
          </div>
          <h2 className="text-2xl font-black text-white font-heading">
            IBS/CBS EasyAPI & Developer Hub
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span>Desenvolvido por <strong className="text-slate-200">Rafael Dias Mazzilli</strong></span>
            <span>•</span>
            <a
              href="https://github.com/RafaelDiasM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Github className="w-3.5 h-3.5" /> @RafaelDiasM
            </a>
          </div>
          <p className="text-xs text-slate-400">
            Projeto Fullstack de Engenharia de Software e Inteligência Fiscal para a Reforma Tributária Brasileira (LC 214/2025 e EC 132/2023).
          </p>
        </div>

        {/* Project Highlights */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Diferenciais de Engenharia
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" /> Gateway Resiliente
              </div>
              <p className="text-slate-400 text-[11px]">
                Integração transparente com a API da Receita Federal com fallback automático para motor de cálculo local LC 214.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-sky-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Auto-Enriquecimento
              </div>
              <p className="text-slate-400 text-[11px]">
                Sanitização automática de payloads, evitando os erros 400 e 422 comuns da API oficial de consumo.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Cache Acelerado
              </div>
              <p className="text-slate-400 text-[11px]">
                Cache em memória de alta performance para tabelas de NCMs, NBSs, CSTs, UFs e Municípios IBGE.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" /> SDK Generator
              </div>
              <p className="text-slate-400 text-[11px]">
                Geração dinâmica de snippets de código para integração imediata em 6 linguagens (Python, JS, TS, C#, PHP, Go).
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Tecnologias Utilizadas
          </h3>
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">TypeScript</span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">Node.js</span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">Express</span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">React 18</span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">Vite</span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">OpenAPI 3.1</span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">Swagger UI</span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">NodeCache</span>
          </div>
        </div>

        {/* Actions / Downloads */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={downloadPostman}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Baixar Postman Collection
            </button>

            <a
              href="http://localhost:3001/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700"
            >
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              Acessar Swagger API
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg shadow-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
