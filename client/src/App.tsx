import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TaxCalculator } from './components/TaxCalculator';
import { ApiPlayground } from './components/ApiPlayground';
import { OpenDataExplorer } from './components/OpenDataExplorer';
import { TaxRulesGuide } from './components/TaxRulesGuide';
import { DfeToolkit } from './components/DfeToolkit';
import { ArchitectureView } from './components/ArchitectureView';
import { ErpIntegrationGuide } from './components/ErpIntegrationGuide';
import { PortfolioModal } from './components/PortfolioModal';
import { StatusBar } from './components/StatusBar';
import { apiClient, HealthData } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('calculator');
  const [health, setHealth] = useState<HealthData | null>(null);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState<boolean>(false);

  useEffect(() => {
    const checkHealth = () => {
      apiClient
        .getHealth()
        .then(setHealth)
        .catch((err) => console.error('Erro ao verificar saúde:', err));
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070f] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 pb-10">
      
      {/* IDE Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        onOpenPortfolio={() => setIsPortfolioOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'calculator' && <TaxCalculator />}
        {activeTab === 'erp' && <ErpIntegrationGuide />}
        {activeTab === 'playground' && <ApiPlayground />}
        {activeTab === 'search' && <OpenDataExplorer />}
        {activeTab === 'guide' && <TaxRulesGuide />}
        {activeTab === 'dfe' && <DfeToolkit />}
        {activeTab === 'architecture' && <ArchitectureView />}
      </main>

      {/* Developer Portfolio Modal */}
      <PortfolioModal
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
        health={health}
      />

      {/* VS Code Style Status Bar */}
      <StatusBar health={health} />
    </div>
  );
};

export default App;
