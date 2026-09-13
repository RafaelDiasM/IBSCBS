import React from 'react';
import { GitBranch, Radio, Terminal, Server, ShieldCheck, Check, Cpu } from 'lucide-react';
import { HealthData } from '../services/api';

interface StatusBarProps {
  health: HealthData | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ health }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-7 bg-[#060913] border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between px-4 z-40 select-none">
      {/* Left side items */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold hover:text-cyan-300 cursor-pointer">
          <GitBranch className="w-3.5 h-3.5" />
          <span>git:(main)</span>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 text-slate-400">
          <Server className="w-3.5 h-3.5 text-indigo-400" />
          <span>port:3001 (Gateway)</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className={`w-2 h-2 rounded-full ${health?.servidorGoverno.online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className={health?.servidorGoverno.online ? 'text-emerald-400' : 'text-rose-400'}>
            SERPRO Piloto: {health?.servidorGoverno.online ? `${health.servidorGoverno.latencyMs}ms` : 'Offline'}
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-1 text-slate-500">
          <span>DB: {health?.servidorGoverno.versaoDb || 'V0042'}</span>
        </div>
      </div>

      {/* Right side items */}
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-1 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>LC 214/2025</span>
        </div>

        <div className="hidden md:flex items-center space-x-1 text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>IVA Dual Core</span>
        </div>

        <div className="flex items-center space-x-2 text-slate-500">
          <span>UTF-8</span>
          <span>•</span>
          <span className="text-cyan-400 font-semibold">TypeScript</span>
        </div>
      </div>
    </footer>
  );
};
