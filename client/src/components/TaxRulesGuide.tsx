import React, { useState, useEffect } from 'react';
import {
  Calendar,
  BookOpen,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Percent,
  Search,
  Scale,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Tag,
  FileText,
  Filter,
} from 'lucide-react';
import { apiClient } from '../services/api';

export const TaxRulesGuide: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'cronograma' | 'csts' | 'classificacoes' | 'porfora' | 'destino'>('cronograma');
  const [cstSearch, setCstSearch] = useState<string>('');
  const [cstsList, setCstsList] = useState<any[]>([]);
  const [classTribsList, setClassTribsList] = useState<any[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todos');

  useEffect(() => {
    apiClient.getCsts().then(setCstsList).catch(console.error);
    apiClient.getClassificacoesTributarias().then(setClassTribsList).catch(console.error);
  }, []);

  const timelineData = [
    {
      ano: '2026',
      fase: 'Ano Piloto e Calibração (0,9% CBS + 0,1% IBS)',
      destaques: [
        'CBS a 0,90% e IBS Estadual a 0,10% (IBS Municipal 0,00%).',
        'Total do IVA Dual de 1,00% sobre operações.',
        'Valores recolhidos são compensáveis integralmente com PIS/COFINS.',
        'Finalidade: Testar a infraestrutura de TI dos fiscos e empresas.',
      ],
      tag: 'Teste 1%',
      tagColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30',
    },
    {
      ano: '2027',
      fase: 'Entrada Plena da CBS e Imposto Seletivo',
      destaques: [
        'CBS passa a vigorar com alíquota plena (~8,40% a 8,80%).',
        'PIS e COFINS são 100% EXTINTOS.',
        'Imposto Seletivo (IS / Sin Tax) entra em vigor para produtos nocivos (cigarros, bebidas, etc.).',
        'IPI é zerado para a grande maioria dos produtos (mantido incentivo da Zona Franca de Manaus).',
      ],
      tag: 'Fim PIS/COFINS',
      tagColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
    },
    {
      ano: '2028',
      fase: 'Consolidação e Ajustes Operacionais',
      destaques: [
        'Operação plena da CBS em âmbito federal.',
        'Preparação dos sistemas do Comitê Gestor do IBS para a partilha interestadual.',
      ],
      tag: 'Consolidação',
      tagColor: 'text-slate-300 bg-slate-900 border-slate-700',
    },
    {
      ano: '2029 a 2032',
      fase: 'Transição Gradual do IBS e Redução do ICMS/ISS',
      destaques: [
        '2029: Redução de 10% do ICMS/ISS e absorção de 10% pelo IBS.',
        '2030: Redução de 20% do ICMS/ISS e absorção de 20% pelo IBS.',
        '2031: Redução de 30% do ICMS/ISS e absorção de 30% pelo IBS.',
        '2032: Redução de 40% do ICMS/ISS e absorção de 40% pelo IBS.',
        'Coexistência controlada entre tributos antigos e novos.',
      ],
      tag: 'Redução Gradual',
      tagColor: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
    },
    {
      ano: '2033+',
      fase: 'Vigência Plena e Sistema Tributário Definitivo',
      destaques: [
        'ICMS, ISS, PIS, COFINS e IPI totalmente extintos.',
        'IVA Dual 100% ativo: CBS (~8,8%) + IBS Estadual (~9,85%) + IBS Municipal (~7,85%).',
        'Arrecadação 100% no local de consumo (Princípio do Destino).',
        'Não-cumulatividade plena com estorno automático de créditos.',
      ],
      tag: 'IVA Dual Pleno',
      tagColor: 'text-purple-400 bg-purple-950/60 border-purple-500/30',
    },
  ];

  const normalizeStr = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const searchNormalized = normalizeStr(cstSearch);

  const filteredCsts = cstsList.filter(
    (c) =>
      c.codigo.includes(searchNormalized) ||
      normalizeStr(c.nome || '').includes(searchNormalized) ||
      normalizeStr(c.descricao || '').includes(searchNormalized) ||
      normalizeStr(c.baseLegal || '').includes(searchNormalized) ||
      normalizeStr(c.categoria || '').includes(searchNormalized)
  );

  const filteredClassTribs = classTribsList.filter((cl) => {
    const matchSearch =
      cl.codigo.includes(searchNormalized) ||
      cl.cst.includes(searchNormalized) ||
      normalizeStr(cl.nome || '').includes(searchNormalized) ||
      normalizeStr(cl.descricao || '').includes(searchNormalized) ||
      normalizeStr(cl.baseLegal || '').includes(searchNormalized) ||
      normalizeStr(cl.categoria || '').includes(searchNormalized) ||
      (cl.exemplos && cl.exemplos.some((ex: string) => normalizeStr(ex).includes(searchNormalized)));

    const matchCategory = selectedCategoria === 'todos' || cl.cst === selectedCategoria;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header & Sub-Navigation */}
      <div className="app-card">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">
              Guia Completo da Reforma Tributária (LC 214/2025)
            </h2>
            <p className="text-xs text-slate-400">
              Dicionário oficial com todos os CSTs, Classificações Tributárias (cClassTrib), cronograma de transição e cálculo "por fora".
            </p>
          </div>
        </div>

        {/* Sub-Navigation Buttons */}
        <div className="flex flex-wrap gap-2.5 mt-6 pt-5 border-t border-slate-800">
          <button
            onClick={() => setActiveSubTab('cronograma')}
            className={`sub-tab-btn ${activeSubTab === 'cronograma' ? 'active' : ''}`}
          >
            <Calendar className="w-4 h-4" />
            <span>Cronograma 2026-2033</span>
          </button>

          <button
            onClick={() => setActiveSubTab('csts')}
            className={`sub-tab-btn ${activeSubTab === 'csts' ? 'active' : ''}`}
          >
            <Tag className="w-4 h-4" />
            <span>Dicionário de CSTs ({cstsList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('classificacoes')}
            className={`sub-tab-btn ${activeSubTab === 'classificacoes' ? 'active' : ''}`}
          >
            <FileText className="w-4 h-4" />
            <span>Classificações Oficiais (cClassTrib) ({classTribsList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('porfora')}
            className={`sub-tab-btn ${activeSubTab === 'porfora' ? 'active' : ''}`}
          >
            <Scale className="w-4 h-4" />
            <span>Cálculo "Por Fora" vs "Por Dentro"</span>
          </button>

          <button
            onClick={() => setActiveSubTab('destino')}
            className={`sub-tab-btn ${activeSubTab === 'destino' ? 'active' : ''}`}
          >
            <Shield className="w-4 h-4" />
            <span>Princípio do Destino & Comitê</span>
          </button>
        </div>
      </div>

      {/* SubTab 1: Cronograma */}
      {activeSubTab === 'cronograma' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timelineData.map((item, idx) => (
              <div
                key={idx}
                className="timeline-card flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black font-heading text-white">
                      {item.ano}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${item.tagColor}`}>
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-cyan-400 leading-snug">
                    {item.fase}
                  </h3>

                  <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    {item.destaques.map((d, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2.5 leading-relaxed">
                        <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 2: Dicionário Completo de CSTs */}
      {activeSubTab === 'csts' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Search Input */}
          <div className="app-card mb-0">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Buscar CST por código, nome, benefício ou base legal..."
                value={cstSearch}
                onChange={(e) => setCstSearch(e.target.value)}
                className="pl-10 text-xs"
              />
            </div>
          </div>

          {/* CST Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCsts.map((item) => (
              <div key={item.codigo} className="app-card mb-0 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-mono font-bold text-sm text-cyan-400">
                        CST {item.codigo}
                      </span>
                    </div>
                    {item.reducaoPercentual > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                        -{item.reducaoPercentual}% Redução
                      </span>
                    ) : item.fatorReducao === 0 ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-purple-950/60 text-purple-300 border border-purple-500/30">
                        Alíquota Zero / Imune
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-slate-900 text-slate-400 border border-slate-700">
                        Tributação Integral
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1">
                    {item.nome}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.descricao}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1 text-slate-500">
                  <div><strong>Base Legal:</strong> {item.baseLegal}</div>
                  <div><strong>Aplicação:</strong> {item.aplicavelA}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 3: Classificações Tributárias (cClassTrib) */}
      {activeSubTab === 'classificacoes' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Filters Bar */}
          <div className="app-card mb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Buscar por código 6 dígitos, nome, base legal, exemplos..."
                value={cstSearch}
                onChange={(e) => setCstSearch(e.target.value)}
                className="pl-10 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-1">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Filtrar CST:
              </span>
              <button
                onClick={() => setSelectedCategoria('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  selectedCategoria === 'todos' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                Todos ({classTribsList.length})
              </button>
              <button
                onClick={() => setSelectedCategoria('200')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  selectedCategoria === '200' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                CST 200 (-60%)
              </button>
              <button
                onClick={() => setSelectedCategoria('210')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  selectedCategoria === '210' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                CST 210 (Profissões -30%)
              </button>
              <button
                onClick={() => setSelectedCategoria('220')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  selectedCategoria === '220' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                CST 220 (Cesta Básica / Zero)
              </button>
              <button
                onClick={() => setSelectedCategoria('300')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  selectedCategoria === '300' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                CST 300 (Específicos / Bancos / Imóveis)
              </button>
              <button
                onClick={() => setSelectedCategoria('400')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  selectedCategoria === '400' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                CST 400 (Exportações Imunes)
              </button>
              <button
                onClick={() => setSelectedCategoria('510')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  selectedCategoria === '510' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                CST 510 (Diferimento)
              </button>
              <button
                onClick={() => setSelectedCategoria('620')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  selectedCategoria === '620' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                CST 620 (ZFM / ALC)
              </button>
            </div>
          </div>

          {/* Classificações Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredClassTribs.map((cl) => (
              <div key={cl.codigo} className="app-card mb-0 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono font-bold text-xs">
                        cClassTrib {cl.codigo}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[11px]">
                        CST {cl.cst}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {cl.reducaoPercentual > 0 ? `Redução -${cl.reducaoPercentual}%` : cl.fatorReducao === 0 ? 'Alíquota Zero / Isento' : 'Alíquota Padrão'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1.5 font-heading">
                    {cl.nome}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {cl.descricao}
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-cyan-300 leading-relaxed">
                    ⚙️ <strong>Regra Operacional:</strong> {cl.regrasOperacionais}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-800 text-[11px] space-y-1 text-slate-400">
                  <div><strong>Base Legal:</strong> {cl.baseLegal}</div>
                  <div><strong>Exemplos:</strong> {cl.exemplos.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 4: Cálculo Por Fora */}
      {activeSubTab === 'porfora' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
          
          {/* Sistema Antigo (Por Dentro) */}
          <div className="app-card space-y-4">
            <div className="app-card-header">
              <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
                <span>🔴</span> Sistema Legado: Cálculo "Por Dentro"
              </h3>
              <span className="text-xs px-2.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md font-mono">
                Efeito Cascata
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              No sistema antigo (ICMS/ISS), o imposto <strong>fazia parte da sua própria base de cálculo</strong> e incidia sobre outros impostos (PIS/COFINS incidiam sobre ICMS, que incidia sobre IPI).
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-slate-400">// Exemplo de mercadoria líquida R$ 100 com ICMS 18%:</div>
              <div className="text-slate-300">Preço com ICMS = R$ 100 / (1 - 0.18) = <strong className="text-rose-400">R$ 121,95</strong></div>
              <div className="text-slate-400">Alíquota nominal de 18% virava alíquota efetiva de <strong className="text-rose-400">21,95%</strong>!</div>
            </div>

            <div className="text-xs text-slate-400 space-y-1 pt-2">
              <div>❌ Falta de transparência para o consumidor final.</div>
              <div>❌ Cumulatividade e cumplicidade de bases de cálculo.</div>
            </div>
          </div>

          {/* Novo Sistema (Por Fora) */}
          <div className="app-card space-y-4 border-cyan-500/40">
            <div className="app-card-header">
              <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
                <span>🟢</span> Novo IVA Dual: Cálculo "Por Fora"
              </h3>
              <span className="text-xs px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md font-mono font-bold">
                LC 214/2025
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Na Reforma Tributária, <strong>o imposto não integra sua própria base de cálculo</strong>. Se o produto custa R$ 100 e a alíquota é 26,5%, o imposto é exatamente R$ 26,50.
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-slate-400">// Exemplo de mercadoria líquida R$ 100 com IVA Dual 26.5%:</div>
              <div className="text-slate-300">Base da Operação = R$ 100,00</div>
              <div className="text-slate-300">CBS (8.8%) + IBS (17.7%) = <strong className="text-cyan-400">R$ 26,50</strong></div>
              <div className="text-slate-300">Preço Final = R$ 100 + R$ 26,50 = <strong className="text-emerald-400">R$ 126,50</strong></div>
            </div>

            <div className="text-xs text-cyan-300/90 space-y-1 pt-2">
              <div>✅ 100% de transparência e discriminação na nota fiscal.</div>
              <div>✅ Regra Especial: O <strong>Imposto Seletivo integra a base da CBS/IBS</strong> (Art. 13 LC 214/2025).</div>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 5: Princípio do Destino */}
      {activeSubTab === 'destino' && (
        <div className="app-card space-y-6 animate-fade-in">
          <div className="app-card-header">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Princípio do Destino & Comitê Gestor do IBS
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="metric-box space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">1. Fim da Guerra Fiscal</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Os Estados de origem não podem mais conceder benefícios fiscais unilaterais, pois o imposto recolhido pertence exclusivamente ao Estado e Município onde a mercadoria ou serviço é consumido.
              </p>
            </div>

            <div className="metric-box space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">2. Comitê Gestor do IBS</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Entidade pública nacional compartilhada entre todos os 26 Estados, Distrito Federal e 5.570 Municípios, responsável por arrecadar, compensar créditos e distribuir a receita.
              </p>
            </div>

            <div className="metric-box space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">3. Não-Cumulatividade Plena</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Toda empresa no Regime Geral toma crédito integral do IBS e CBS pago em suas aquisições de insumos, bens e serviços, extinguindo os litígios de "crédito físico vs crédito financeiro".
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
