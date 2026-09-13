import React, { useState } from 'react';
import {
  FileCode,
  CheckCircle,
  Copy,
  Check,
  Play,
  Package,
  ShoppingCart,
  Briefcase,
  Truck,
  Layers,
  Ticket,
  Zap,
  Sparkles,
  Info,
} from 'lucide-react';
import { apiClient, TipoDocumentoFiscal } from '../services/api';

export const DfeToolkit: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<TipoDocumentoFiscal>('nfe');
  const [valor, setValor] = useState<number>(1500);
  const [xmlOutput, setXmlOutput] = useState<string>('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const docTypesInfo: Record<TipoDocumentoFiscal, { nome: string; mod: string; icone: React.ReactNode; descricao: string; regras: string[] }> = {
    nfe: {
      nome: 'NF-e (Nota Fiscal Eletrônica)',
      mod: 'Modelo 55',
      icone: <Package className="w-5 h-5 text-cyan-400" />,
      descricao: 'Utilizada para circulação de mercadorias em geral (B2B e B2C interestadual).',
      regras: [
        'Base de Cálculo = Valor dos Produtos + Frete + Seguro + Outras Despesas - Descontos.',
        'O Imposto Seletivo (se incidir) compõe a base da CBS e do IBS (Art. 13 LC 214).',
        'Contém grupos <IBSCBS> com CST/cClassTrib e <IS> no detalhamento do item.',
      ],
    },
    nfce: {
      nome: 'NFC-e (Nota Fiscal de Consumidor Eletrônica)',
      mod: 'Modelo 65',
      icone: <ShoppingCart className="w-5 h-5 text-amber-400" />,
      descricao: 'Utilizada no varejo para venda direta ao consumidor final presencial ou delivery.',
      regras: [
        'Destaque simplificado do IBS e da CBS para conferência no cupom fiscal.',
        'Base de cálculo direta sobre o valor dos produtos vendidos.',
      ],
    },
    nfse: {
      nome: 'NFS-e (Nota Fiscal de Serviços Nacional)',
      mod: 'Padrão Nacional',
      icone: <Briefcase className="w-5 h-5 text-sky-400" />,
      descricao: 'Utilizada para prestação de serviços tributados pela NBS (Nomenclatura Brasileira de Serviços).',
      regras: [
        'Tributação transferida para o domicílio do tomador (Princípio do Destino).',
        'Extinção gradual do ISS até 2032 e extinção total do PIS/COFINS em 2027.',
        'Exige código cIndOp (Indicador de Operação) compatível com a NBS.',
      ],
    },
    cte: {
      nome: 'CT-e (Conhecimento de Transporte Eletrônico)',
      mod: 'Modelo 57',
      icone: <Truck className="w-5 h-5 text-indigo-400" />,
      descricao: 'Utilizado para prestação de serviços de transporte de cargas rodoviário, aéreo, ferroviário e aquaviário.',
      regras: [
        'Base de cálculo = Valor do frete + pedágio cobrado + taxas de despacho.',
        'O tomador do serviço no regime geral apropria crédito integral do IBS e CBS destacado no CT-e.',
      ],
    },
    mdfe: {
      nome: 'MDF-e (Manifesto Eletrônico de Documentos Fiscais)',
      mod: 'Modelo 58',
      icone: <Layers className="w-5 h-5 text-purple-400" />,
      descricao: 'Utilizado para consolidação de cargas e transporte multimodal interestadual.',
      regras: [
        'Não calcula imposto diretamente, mas consolida as chaves e valores totais de mercadorias e tributos.',
        'Utilizado para controle de trânsito e barreiras fiscais interestaduais.',
      ],
    },
    bpe: {
      nome: 'BP-e (Bilhete de Passagem Eletrônico)',
      mod: 'Modelo 63',
      icone: <Ticket className="w-5 h-5 text-emerald-400" />,
      descricao: 'Utilizado no transporte de passageiros rodoviário, ferroviário e aquaviário.',
      regras: [
        'Base de cálculo composta pela tarifa da passagem + taxa de embarque - descontos.',
        'Incidência do IBS Estadual e Municipal no local de início da viagem.',
      ],
    },
    nf3e: {
      nome: 'NF3e (Nota Fiscal de Energia Elétrica Eletrônica)',
      mod: 'Modelo 66',
      icone: <Zap className="w-5 h-5 text-yellow-400" />,
      descricao: 'Utilizada no faturamento de energia elétrica para o mercado livre e regulado.',
      regras: [
        'Base de cálculo inclui fornecimento de energia e tarifas de distribuição/transmissão (TUSD/TUST).',
        'Tributação no destino onde a energia é consumida.',
      ],
    },
  };

  const gerarXmlDfe = async () => {
    setLoading(true);
    try {
      const calcData = await apiClient.calcularSimplificado({
        valor,
        tipoDocumento: selectedDoc,
        ufDestino: 'SP',
        municipioDestino: 3550308,
        data: '2027-01-01',
        ncm: selectedDoc === 'nfe' ? '24021000' : undefined,
        nbs: selectedDoc === 'nfse' ? '109052100' : undefined,
      });

      setXmlOutput(calcData.xmlGerado || '');
      const val = await apiClient.validarXmlDfe(selectedDoc, calcData.xmlGerado || '');
      setValidationResult(val);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copiarXml = () => {
    navigator.clipboard.writeText(xmlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 border-slate-800 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-heading">
              DFe & NFS-e Hub (Diferenciação por Tipo de Documento)
            </h2>
            <p className="text-xs text-slate-400">
              Gere e valide a estrutura XML com tags <code>&lt;IBSCBS&gt;</code> e <code>&lt;IS&gt;</code> conforme as Notas Técnicas da Reforma Tributária.
            </p>
          </div>
        </div>
      </div>

      {/* Document Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {(Object.keys(docTypesInfo) as TipoDocumentoFiscal[]).map((tipo) => {
          const doc = docTypesInfo[tipo];
          const isSelected = selectedDoc === tipo;
          return (
            <button
              key={tipo}
              onClick={() => setSelectedDoc(tipo)}
              className={`p-3.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-500/20 to-sky-500/10 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                {doc.icone}
                <span className="text-[10px] font-mono font-bold uppercase">{doc.mod}</span>
              </div>
              <span className="font-bold text-xs block text-white truncate">{doc.nome.split(' ')[0]}</span>
              <span className="text-[10px] text-slate-400 block truncate">{doc.nome}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Document Rules & Config (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-cyan-400 uppercase font-mono">
                {docTypesInfo[selectedDoc].mod}
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {docTypesInfo[selectedDoc].nome}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {docTypesInfo[selectedDoc].descricao}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Regras de Base de Cálculo & Tributação:</label>
              <ul className="space-y-2 text-xs text-slate-300">
                {docTypesInfo[selectedDoc].regras.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Valor da Operação para Teste (R$)
              </label>
              <input
                type="number"
                value={valor}
                onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
                className="w-full font-bold text-base"
              />
            </div>

            <button
              onClick={gerarXmlDfe}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20"
            >
              {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
              {loading ? 'Processando XML...' : `Gerar e Validar XML (${selectedDoc.toUpperCase()})`}
            </button>
          </div>

          {validationResult && (
            <div className="glass-panel p-5 border-emerald-500/30 bg-emerald-950/20 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle className="w-4 h-4" />
                Validação DFe Concluída
              </div>
              <p className="text-xs text-slate-300">
                {validationResult.status}
              </p>
            </div>
          )}
        </div>

        {/* Right: XML Viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-6 border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Estrutura XML Formatada ({selectedDoc.toUpperCase()})
              </span>
              {xmlOutput && (
                <button
                  onClick={copiarXml}
                  className="flex items-center gap-1.5 text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'XML Copiado!' : 'Copiar XML'}
                </button>
              )}
            </div>

            <div className="min-h-[420px] rounded-xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-cyan-300 overflow-auto leading-relaxed shadow-inner max-h-[550px]">
              {xmlOutput ? (
                <pre>{xmlOutput}</pre>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <FileCode className="w-8 h-8 text-slate-600" />
                  <span>Clique em <strong>"Gerar e Validar XML"</strong> para inspecionar o código formatado.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
