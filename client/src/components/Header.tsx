import React from 'react';
import {
  Calculator,
  Search,
  Terminal,
  FileCode,
  BookOpen,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Radio,
  Workflow,
  Github,
} from 'lucide-react';
import { HealthData } from '../services/api';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  health: HealthData | null;
  onOpenPortfolio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  health,
  onOpenPortfolio,
}) => {
  const tabs = [
    {
      id: 'calculator',
      label: 'Calculadora & DFe',
      desc: 'Simulação & Base de Cálculo',
      icon: <Calculator className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'erp',
      label: 'Integração ERP',
      desc: 'Guia 4 Passos & Injeção',
      icon: <Workflow className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'search',
      label: 'Busca de NCM & API',
      desc: 'Tabelas & Testador Rápido',
      icon: <Search className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'playground',
      label: 'API Playground',
      desc: 'Testador de Endpoints & SDK',
      icon: <Terminal className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'dfe',
      label: 'XML Toolkit',
      desc: 'NF-e, NFC-e, NFS-e, CT-e',
      icon: <FileCode className="w-4 h-4 text-rose-400" />,
    },
    {
      id: 'guide',
      label: 'Guia LC 214/2025',
      desc: 'Cronograma 2026-2033',
      icon: <BookOpen className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'architecture',
      label: 'Arquitetura',
      desc: 'Swagger & Especificação',
      icon: <Layers className="w-4 h-4 text-sky-400" />,
    },
  ];

  return (
    <header className="bg-[#080d1a] border-b border-slate-800/80 sticky top-0 z-50">
      
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between border-b border-slate-800/50">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black font-heading text-base shadow-lg shadow-cyan-500/25">
            IB
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-black text-lg text-white tracking-tight">
                IBS<span className="text-cyan-400">CBS</span> EasyAPI
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v1.0.0 (LC 214/2025)
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Gateway Inteligente para a Reforma Tributária & Piloto Oficial SERPRO
            </p>
          </div>
        </div>

        {/* Right Status Badges & Buttons */}
        <div className="flex items-center space-x-3">
          
          {/* Government Ping Status */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className={`w-2.5 h-2.5 rounded-full ${health?.servidorGoverno.online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-slate-400 hidden md:inline">Piloto SERPRO:</span>
            <span className={health?.servidorGoverno.online ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {health?.servidorGoverno.online ? `Online (${health.servidorGoverno.latencyMs}ms)` : 'Offline'}
            </span>
          </div>

          {/* Swagger Link */}
          <a
            href="http://localhost:3001/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs font-medium text-slate-300 transition-all"
          >
            <span>Swagger UI</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/RafaelDiasM/IBSCBS"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 transition-all"
            title="Ver código-fonte no GitHub de Rafael Dias Mazzilli"
          >
            <Github className="w-3.5 h-3.5 text-white" />
            <span>GitHub</span>
          </a>

          {/* Portfolio Modal Trigger */}
          <button
            onClick={onOpenPortfolio}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-xs font-heading shadow-md shadow-cyan-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portfólio</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto no-scrollbar">
        <div className="flex space-x-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              >
                {tab.icon}
                <div className="text-left">
                  <div className="font-heading font-bold">{tab.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal hidden lg:block">{tab.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
