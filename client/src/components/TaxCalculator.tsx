import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Play,
  Copy,
  Check,
  FileCode,
  Sparkles,
  Layers,
  ArrowRight,
  Package,
  ShoppingCart,
  Briefcase,
  Truck,
  Ticket,
  Zap,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Info,
  Sliders,
  DollarSign,
  MapPin,
  Tag,
  Percent,
  Scale,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { apiClient, CalculationResult, TipoDocumentoFiscal } from '../services/api';

interface CurrencyFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  accent?: 'cyan' | 'rose' | 'slate';
  step?: string;
}

const CurrencyField: React.FC<CurrencyFieldProps> = ({
  label,
  value,
  onChange,
  accent = 'slate',
  step = '0.01',
}) => {
  const accentClass =
    accent === 'cyan'
      ? 'text-cyan-300 font-bold text-base'
      : accent === 'rose'
      ? 'text-rose-300 font-semibold'
      : 'text-white font-medium';

  return (
    <div className="form-group mb-4">
      <label className="form-label text-xs text-slate-400 mb-1.5 block font-semibold">
        {label}
      </label>
      <div className="flex items-center rounded-xl bg-[#080d1a] border border-slate-700/80 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 overflow-hidden transition-all shadow-inner">
        <div className="px-3.5 py-2.5 bg-slate-900/90 border-r border-slate-800 text-xs font-mono font-bold text-slate-400 select-none flex items-center justify-center shrink-0">
          R$
        </div>
        <input
          type="number"
          min="0"
          step={step}
          value={value === 0 ? '' : value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          className={`flex-1 bg-transparent border-none outline-none px-3.5 py-2 text-sm font-mono ${accentClass} placeholder:text-slate-600`}
        />
      </div>
    </div>
  );
};

export const TaxCalculator: React.FC = () => {
  // Document Type
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumentoFiscal>('nfe');

  // Base Values
  const [valor, setValor] = useState<number>(1500);
  const [valorFrete, setValorFrete] = useState<number>(50);
  const [valorSeguro, setValorSeguro] = useState<number>(10);
  const [outrasDespesas, setOutrasDespesas] = useState<number>(0);
  const [valorDesconto, setValorDesconto] = useState<number>(0);
  const [deducaoMateriais, setDeducaoMateriais] = useState<number>(0);

  // Fiscal parameters
  const [dataFato, setDataFato] = useState<string>('2027-01-01');
  const [ufDestino, setUfDestino] = useState<string>('SP');
  const [municipioDestino, setMunicipioDestino] = useState<number>(3550308);
  const [ncm, setNcm] = useState<string>('24021000');
  const [nbs, setNbs] = useState<string>('');
  const [quantidade, setQuantidade] = useState<number>(5);
  const [unidade, setUnidade] = useState<string>('VN');
  const [cst, setCst] = useState<string>('000');
  const [cClassTrib, setCClassTrib] = useState<string>('000001');

  // Sub-tab for results view
  const [resultSubTab, setResultSubTab] = useState<'resumo' | 'xml' | 'memoria' | 'json'>('resumo');

  // Dynamic Open Data State
  const [ufs, setUfs] = useState<any[]>([]);
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [cstsList, setCstsList] = useState<any[]>([]);
  const [classTribsList, setClassTribsList] = useState<any[]>([]);

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedXml, setCopiedXml] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  useEffect(() => {
    apiClient.getUfs().then(setUfs).catch(console.error);
    apiClient.getCsts().then((csts) => {
      setCstsList(csts);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    apiClient.getMunicipios(ufDestino).then((data) => {
      setMunicipios(data);
      if (data.length > 0 && !data.find((m) => m.codigo === municipioDestino)) {
        setMunicipioDestino(data[0].codigo);
      }
    }).catch(console.error);
  }, [ufDestino]);

  // Carregar e sincronizar classificações tributárias sempre que o CST mudar
  useEffect(() => {
    apiClient.getClassificacoesTributarias(cst).then((classificacoes) => {
      setClassTribsList(classificacoes);
      if (classificacoes.length > 0) {
        if (!classificacoes.some((cl) => cl.codigo === cClassTrib)) {
          setCClassTrib(classificacoes[0].codigo);
        }
      }
    }).catch(console.error);
  }, [cst]);

  const executarCalculo = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.calcularSimplificado({
        valor,
        tipoDocumento,
        valorFrete,
        valorSeguro,
        outrasDespesas,
        valorDesconto,
        deducaoMateriais,
        data: dataFato,
        ufDestino,
        municipioDestino,
        ncm: ncm || undefined,
        nbs: nbs || undefined,
        quantidade,
        unidade,
        cst,
        cClassTrib,
      });
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Erro ao calcular tributos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executarCalculo();
  }, [
    valor,
    tipoDocumento,
    valorFrete,
    valorSeguro,
    outrasDespesas,
    valorDesconto,
    deducaoMateriais,
    dataFato,
    ufDestino,
    municipioDestino,
    ncm,
    nbs,
    quantidade,
    cst,
    cClassTrib,
  ]);

  const aplicarCenarioPronto = (cenario: string) => {
    switch (cenario) {
      case 'cigarro_is':
        setTipoDocumento('nfe');
        setValor(1500);
        setValorFrete(50);
        setValorSeguro(10);
        setOutrasDespesas(0);
        setValorDesconto(0);
        setDataFato('2027-01-01');
        setUfDestino('SP');
        setMunicipioDestino(3550308);
        setNcm('24021000');
        setNbs('');
        setQuantidade(5);
        setUnidade('VN');
        setCst('000');
        setCClassTrib('000001');
        break;

      case 'educacao_60':
        setTipoDocumento('nfse');
        setValor(2500);
        setValorFrete(0);
        setValorSeguro(0);
        setOutrasDespesas(0);
        setValorDesconto(0);
        setDeducaoMateriais(0);
        setDataFato('2027-01-01');
        setUfDestino('SP');
        setMunicipioDestino(3550308);
        setNcm('');
        setNbs('101011100');
        setCst('200');
        setCClassTrib('200001');
        break;

      case 'cesta_basica_zero':
        setTipoDocumento('nfe');
        setValor(850);
        setValorFrete(0);
        setValorSeguro(0);
        setOutrasDespesas(0);
        setValorDesconto(0);
        setDataFato('2027-01-01');
        setUfDestino('MG');
        setMunicipioDestino(3106200);
        setNcm('10061092');
        setNbs('');
        setQuantidade(10);
        setUnidade('KG');
        setCst('220');
        setCClassTrib('220001');
        break;

      case 'advogado_30':
        setTipoDocumento('nfse');
        setValor(5000);
        setValorFrete(0);
        setValorSeguro(0);
        setOutrasDespesas(0);
        setValorDesconto(0);
        setDeducaoMateriais(0);
        setDataFato('2027-01-01');
        setUfDestino('RJ');
        setMunicipioDestino(3304557);
        setNcm('');
        setNbs('109011100');
        setCst('210');
        setCClassTrib('210001');
        break;

      case 'governo_cst550_suspensao':
        setTipoDocumento('nfe');
        setValor(1111);
        setValorFrete(0);
        setValorSeguro(0);
        setOutrasDespesas(0);
        setValorDesconto(0);
        setDeducaoMateriais(0);
        setDataFato('2027-01-01');
        setUfDestino('RS');
        setMunicipioDestino(4314902);
        setNcm('24021000');
        setNbs('');
        setQuantidade(222);
        setUnidade('VN');
        setCst('550');
        setCClassTrib('550020');
        break;

      case 'exportacao_imune':
        setTipoDocumento('nfe');
        setValor(80000);
        setValorFrete(3000);
        setValorSeguro(500);
        setOutrasDespesas(0);
        setValorDesconto(0);
        setDataFato('2027-01-01');
        setUfDestino('EX');
        setMunicipioDestino(9999999);
        setNcm('12019000');
        setNbs('');
        setQuantidade(100);
        setUnidade('TON');
        setCst('400');
        setCClassTrib('400001');
        break;
    }
  };

  const copiarXml = () => {
    if (result?.xmlGerado) {
      navigator.clipboard.writeText(result.xmlGerado);
      setCopiedXml(true);
      setTimeout(() => setCopiedXml(false), 2000);
    }
  };

  const copiarJson = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const docModelos: { id: TipoDocumentoFiscal; label: string; titulo: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'nfe', label: 'NF-e', titulo: 'Mercadorias (Mod 55)', icon: <Package className="w-5 h-5 text-cyan-400" />, desc: 'Base com frete/seguro + IS na base de CBS/IBS' },
    { id: 'nfce', label: 'NFC-e', titulo: 'Varejo / Consumidor (Mod 65)', icon: <ShoppingCart className="w-5 h-5 text-amber-400" />, desc: 'Destaque simplificado ao consumidor final' },
    { id: 'nfse', label: 'NFS-e', titulo: 'Serviços Nacionais (NBS)', icon: <Briefcase className="w-5 h-5 text-sky-400" />, desc: 'Tributação no destino (Tomador) e extinção ISS' },
    { id: 'cte', label: 'CT-e', titulo: 'Transporte de Carga (Mod 57)', icon: <Truck className="w-5 h-5 text-indigo-400" />, desc: 'Frete e pedágio com crédito pleno ao tomador' },
    { id: 'mdfe', label: 'MDF-e', titulo: 'Manifesto de Cargas (Mod 58)', icon: <Layers className="w-5 h-5 text-purple-400" />, desc: 'Consolidação de documentos em trânsito' },
    { id: 'bpe', label: 'BP-e', titulo: 'Passagens (Mod 63)', icon: <Ticket className="w-5 h-5 text-emerald-400" />, desc: 'Transporte de passageiros intermunicipal' },
    { id: 'nf3e', label: 'NF3e', titulo: 'Energia Elétrica (Mod 66)', icon: <Zap className="w-5 h-5 text-yellow-400" />, desc: 'Faturamento de energia + tarifas TUSD/TUST' },
  ];

  const currentCstObj = cstsList.find((c) => c.codigo === cst);
  const currentClassTribObj = classTribsList.find((cl) => cl.codigo === cClassTrib);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Top Banner: Quick Scenarios */}
      <div className="app-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Simulador Fiscal & Motor de Base de Cálculo (LC 214/2025)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure as opções lado a lado, selecione o CST e a Classificação Tributária oficial e confira a partilha tributária e o XML em tempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">Cenários Rápidos:</span>
            <button
              onClick={() => aplicarCenarioPronto('governo_cst550_suspensao')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 transition-all shadow-sm shadow-blue-500/10"
              title="Exemplo oficial do Guia de Integração ERP da Receita Federal (NCM 24021000, CST 550 Suspensão)"
            >
              🏛️ Exemplo Oficial Governo (CST 550)
            </button>
            <button
              onClick={() => aplicarCenarioPronto('cigarro_is')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all"
            >
              🚬 Cigarro (com IS)
            </button>
            <button
              onClick={() => aplicarCenarioPronto('educacao_60')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all"
            >
              🎓 Educação (-60%)
            </button>
            <button
              onClick={() => aplicarCenarioPronto('cesta_basica_zero')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all"
            >
              🛒 Cesta Básica (0%)
            </button>
            <button
              onClick={() => aplicarCenarioPronto('advogado_30')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all"
            >
              ⚖️ Profissão Liberal (-30%)
            </button>
            <button
              onClick={() => aplicarCenarioPronto('exportacao_imune')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all"
            >
              🚢 Exportação (Imune)
            </button>
          </div>
        </div>
      </div>

      {/* 1. Document Model Selection (Wide Horizontal Grid Lado a Lado) */}
      <div className="app-card">
        <div className="app-card-header">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="font-heading font-bold text-base text-white">
              Passo 1: Selecione o Modelo do Documento Fiscal (DFe)
            </h3>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 px-3 py-1 rounded-md border border-cyan-500/30 font-bold">
            MODELO: {tipoDocumento.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
          {docModelos.map((m) => {
            const isSelected = tipoDocumento === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setTipoDocumento(m.id)}
                className={`p-4 rounded-xl text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-400/50'
                    : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    {m.icon}
                  </div>
                  <span className="font-mono text-xs font-bold text-cyan-400">{m.label}</span>
                </div>
                <div className="font-heading font-bold text-xs text-white truncate">{m.titulo}</div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">{m.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Side-by-Side Configuration Options (Passo 2 & Passo 3 Lado a Lado) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Composição da Base de Cálculo */}
        <div className="app-card mb-0">
          <div className="app-card-header">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-cyan-400" />
              <h3 className="font-heading font-bold text-base text-white">
                Passo 2: Composição da Base de Cálculo
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Valores em R$</span>
          </div>

          {/* Main Operational Value */}
          <CurrencyField
            label={tipoDocumento === 'nfse' ? 'Valor do Serviço Prestado' : tipoDocumento === 'cte' ? 'Valor do Frete Contratado' : 'Valor Bruto da Mercadoria / Produto'}
            value={valor}
            onChange={setValor}
            accent="cyan"
          />

          {/* Freight, Insurance, Extra Expenses Side by Side */}
          {(tipoDocumento === 'nfe' || tipoDocumento === 'cte') && (
            <div className="grid grid-cols-3 gap-3">
              <CurrencyField
                label="(+) Frete"
                value={valorFrete}
                onChange={setValorFrete}
              />
              <CurrencyField
                label="(+) Seguro"
                value={valorSeguro}
                onChange={setValorSeguro}
              />
              <CurrencyField
                label="(+) Outras Desp."
                value={outrasDespesas}
                onChange={setOutrasDespesas}
              />
            </div>
          )}

          {/* Discounts and Deductions Side by Side */}
          <div className="grid grid-cols-2 gap-3">
            <CurrencyField
              label="(-) Desconto Incondicional"
              value={valorDesconto}
              onChange={setValorDesconto}
              accent="rose"
            />

            {tipoDocumento === 'nfse' ? (
              <CurrencyField
                label="(-) Dedução de Materiais"
                value={deducaoMateriais}
                onChange={setDeducaoMateriais}
                accent="rose"
              />
            ) : (
              <div className="form-group mb-4">
                <label className="form-label text-xs text-slate-400 mb-1.5 block font-semibold">
                  Data Fato Gerador
                </label>
                <div className="flex items-center rounded-xl bg-[#080d1a] border border-slate-700/80 focus-within:border-cyan-400 overflow-hidden">
                  <input
                    type="date"
                    value={dataFato}
                    onChange={(e) => setDataFato(e.target.value)}
                    className="w-full bg-transparent border-none outline-none px-3.5 py-2 text-sm font-mono text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Destino, NCM & Classificação Fiscal Completa */}
        <div className="app-card mb-0">
          <div className="app-card-header">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <h3 className="font-heading font-bold text-base text-white">
                Passo 3: Destino, CST & Classificação (LC 214)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Princípio do Destino</span>
          </div>

          {/* Destination UF and Municipio Side by Side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group mb-4">
              <label className="form-label text-xs text-slate-400 mb-1.5 block font-semibold">
                UF de Destino
              </label>
              <select
                value={ufDestino}
                onChange={(e) => setUfDestino(e.target.value)}
                className="w-full bg-[#080d1a] border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white font-mono"
              >
                {ufs.map((u) => (
                  <option key={u.sigla} value={u.sigla}>
                    {u.sigla} - {u.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group mb-4">
              <label className="form-label text-xs text-slate-400 mb-1.5 block font-semibold">
                Município IBGE
              </label>
              <select
                value={municipioDestino}
                onChange={(e) => setMunicipioDestino(parseInt(e.target.value, 10))}
                className="w-full bg-[#080d1a] border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white font-mono"
              >
                {municipios.map((m) => (
                  <option key={m.codigo} value={m.codigo}>
                    {m.nome} ({m.codigo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* NCM / NBS and Quantity Side by Side */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 form-group mb-4">
              <label className="form-label text-xs text-slate-400 mb-1.5 block font-semibold">
                {tipoDocumento === 'nfse' ? 'Código NBS (Serviço)' : 'Código NCM (Mercadoria)'}
              </label>
              <input
                type="text"
                value={tipoDocumento === 'nfse' ? nbs : ncm}
                onChange={(e) => (tipoDocumento === 'nfse' ? setNbs(e.target.value) : setNcm(e.target.value))}
                placeholder={tipoDocumento === 'nfse' ? '109052100' : '24021000'}
                className="w-full bg-[#080d1a] border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label text-xs text-slate-400 mb-1.5 block font-semibold">
                Qtd ({unidade})
              </label>
              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-[#080d1a] border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
            </div>
          </div>

          {/* CST (Situação Tributária Completa) */}
          <div className="form-group mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="form-label text-xs text-slate-400 font-semibold mb-0">
                Situação Tributária (CST)
              </label>
              {currentCstObj && (
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  {currentCstObj.baseLegal}
                </span>
              )}
            </div>
            <select
              value={cst}
              onChange={(e) => setCst(e.target.value)}
              className="w-full bg-[#080d1a] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono"
            >
              {cstsList.map((c) => (
                <option key={c.codigo} value={c.codigo}>
                  CST {c.codigo} - {c.nome || c.descricao} {c.reducaoPercentual > 0 ? `(-${c.reducaoPercentual}%)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Classificação Tributária Oficial (cClassTrib) */}
          <div className="form-group mb-0">
            <label className="form-label text-xs text-slate-400 mb-1.5 block font-semibold">
              Classificação Tributária Oficial (<span className="text-cyan-400 font-mono">cClassTrib</span>)
            </label>
            <select
              value={cClassTrib}
              onChange={(e) => setCClassTrib(e.target.value)}
              className="w-full bg-[#080d1a] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono"
            >
              {classTribsList.map((cl) => (
                <option key={cl.codigo} value={cl.codigo}>
                  {cl.codigo} - {cl.nome}
                </option>
              ))}
            </select>

            {currentClassTribObj && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">{currentClassTribObj.nome}</span>: {currentClassTribObj.regrasOperacionais}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 3. Full-Width Results & Tax Breakdown Card (Passo 4) */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="app-card">
          
          {/* Document Rule Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 mb-6 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-heading font-bold text-sm text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                {result.documentoFiscal?.nome}
              </span>
              <div className="flex items-center gap-2">
                {result.classificacaoTributaria && (
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                    cClassTrib {result.classificacaoTributaria.codigo}
                  </span>
                )}
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                  {result.documentoFiscal?.versaoNotaTecnica}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {result.documentoFiscal?.regrasEspecificas}
            </p>

            {result.classificacaoTributaria && (
              <div className="text-xs text-cyan-300 bg-slate-950/90 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                <Scale className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Enquadramento:</strong> {result.classificacaoTributaria.nome} ({result.classificacaoTributaria.baseLegal}) — {result.classificacaoTributaria.regrasOperacionais}
                </div>
              </div>
            )}

            {result.composicaoBaseCalculo?.memoriaBaseCalculo && (
              <div className="text-xs font-mono text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                📐 {result.composicaoBaseCalculo.memoriaBaseCalculo}
              </div>
            )}
          </div>

          {/* Sub Tabs: Resumo vs XML vs Memória vs JSON */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setResultSubTab('resumo')}
                className={`sub-tab-btn ${resultSubTab === 'resumo' ? 'active' : ''}`}
              >
                📊 Resumo dos Tributos
              </button>

              <button
                onClick={() => setResultSubTab('xml')}
                className={`sub-tab-btn ${resultSubTab === 'xml' ? 'active' : ''}`}
              >
                📄 Trecho XML da Nota
              </button>

              <button
                onClick={() => setResultSubTab('memoria')}
                className={`sub-tab-btn ${resultSubTab === 'memoria' ? 'active' : ''}`}
              >
                ⚖️ Comparativo Legado
              </button>

              <button
                onClick={() => setResultSubTab('json')}
                className={`sub-tab-btn ${resultSubTab === 'json' ? 'active' : ''}`}
              >
                ⚡ JSON da API
              </button>
            </div>

            {resultSubTab === 'xml' && (
              <button
                onClick={copiarXml}
                className="flex items-center gap-1.5 text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 font-medium"
              >
                {copiedXml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedXml ? 'Copiado!' : 'Copiar XML'}
              </button>
            )}

            {resultSubTab === 'json' && (
              <button
                onClick={copiarJson}
                className="flex items-center gap-1.5 text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 font-medium"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedJson ? 'Copiado!' : 'Copiar JSON'}
              </button>
            )}
          </div>

          {/* Sub View 1: Resumo Tributário */}
          {resultSubTab === 'resumo' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Top Total Summary Banner */}
              <div className="metric-box highlight">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Valor Total da Operação
                    </span>
                    <div className="text-3xl font-black text-white font-heading mt-1">
                      R$ {result.resumo.valorFinalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Carga Efetiva ({tipoDocumento.toUpperCase()})
                    </span>
                    <div className="text-2xl font-black text-cyan-400 font-heading mt-1">
                      {result.resumo.aliquotaEfetivaTotal}%
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      (Tributos: R$ {result.resumo.totalTributos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Tax Component Cards Lado a Lado */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* CBS */}
                <div className="metric-box">
                  <div className="flex items-center justify-between text-xs text-sky-400 font-bold mb-1">
                    <span>CBS</span>
                    <span className="font-mono">{result.tributos.cbs.aliquotaPercentual}%</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    R$ {result.tributos.cbs.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-slate-400">União (Federal)</span>
                </div>

                {/* IBS Estadual */}
                <div className="metric-box">
                  <div className="flex items-center justify-between text-xs text-indigo-400 font-bold mb-1">
                    <span>IBS UF</span>
                    <span className="font-mono">{result.tributos.ibsEstadual.aliquotaPercentual}%</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    R$ {result.tributos.ibsEstadual.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-slate-400">Estado ({ufDestino})</span>
                </div>

                {/* IBS Municipal */}
                <div className="metric-box">
                  <div className="flex items-center justify-between text-xs text-purple-400 font-bold mb-1">
                    <span>IBS Mun.</span>
                    <span className="font-mono">{result.tributos.ibsMunicipal.aliquotaPercentual}%</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    R$ {result.tributos.ibsMunicipal.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-slate-400">Município</span>
                </div>

                {/* Imposto Seletivo */}
                <div className={`metric-box ${result.tributos.impostoSeletivo?.incide ? 'border-rose-500/40 bg-rose-950/20' : ''}`}>
                  <div className="flex items-center justify-between text-xs text-rose-400 font-bold mb-1">
                    <span>IS</span>
                    <span className="font-mono">{result.tributos.impostoSeletivo?.incide ? 'Ativo' : '0%'}</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    R$ {(result.tributos.impostoSeletivo?.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-slate-400">Sin Tax</span>
                </div>
              </div>

              {/* Calculation Rules List */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Regras Aplicadas pelo Motor Tributário:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.regrasTributarias.regrasAplicadas.map((regra, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{regra}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Sub View 2: Trecho XML */}
          {resultSubTab === 'xml' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-xs text-slate-400 font-mono">
                Trecho XML gerado conforme a Nota Técnica oficial para o modelo <strong>{tipoDocumento.toUpperCase()}</strong>:
              </div>
              <div className="p-4 rounded-xl bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed shadow-inner max-h-[500px]">
                <pre>{result.xmlGerado}</pre>
              </div>
            </div>
          )}

          {/* Sub View 3: Comparativo Legado */}
          {resultSubTab === 'memoria' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-sm text-white">Impacto na Carga Tributária</h4>
                  <p className="text-xs text-slate-400">Comparação com o sistema tributário anterior (ICMS/ISS + PIS/COFINS + IPI)</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  result.comparativoLegado.impactoCarga === 'reducao'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {result.comparativoLegado.impactoCarga === 'reducao' ? (
                    <>
                      <TrendingDown className="w-4 h-4" />
                      Redução de R$ {Math.abs(result.comparativoLegado.diferencaValor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      Variação de R$ {result.comparativoLegado.diferencaValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="metric-box">
                  <span className="text-xs text-slate-400 font-semibold block mb-1">Sistema Legado (Estimado)</span>
                  <div className="text-2xl font-bold text-slate-300 font-heading">
                    R$ {result.comparativoLegado.totalSistemaLegado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 space-y-1">
                    <div>• ICMS / ISS: R$ {result.comparativoLegado.estimativaICMSouISS.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div>• PIS / COFINS: R$ {(result.comparativoLegado.estimativaPIS + result.comparativoLegado.estimativaCOFINS).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div>• IPI: R$ {result.comparativoLegado.estimativaIPI.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>

                <div className="metric-box highlight">
                  <span className="text-xs text-cyan-400 font-semibold block mb-1">Novo IVA Dual + IS (LC 214)</span>
                  <div className="text-2xl font-bold text-white font-heading">
                    R$ {result.resumo.totalTributos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-cyan-300/70 mt-2 space-y-1">
                    <div>• CBS Federal: R$ {result.tributos.cbs.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div>• IBS Estadual/Mun: R$ {result.tributos.ibsTotal.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div>• Imposto Seletivo: R$ {(result.tributos.impostoSeletivo?.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub View 4: JSON Raw */}
          {resultSubTab === 'json' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-xs text-slate-400 font-mono">
                Resposta JSON oficial retornada pelo Gateway:
              </div>
              <div className="p-4 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed shadow-inner max-h-[500px]">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
