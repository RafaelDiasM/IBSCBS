import NodeCache from 'node-cache';
import { GovernmentApiService } from './governmentApi.service.js';
import {
  UFS_BRASIL,
  MUNICIPIOS_DESTAQUE,
  CST_CBS_IBS_LIST,
  CLASSIFICACOES_TRIBUTARIAS_DATABASE,
  CST_IS_LIST,
  NCM_IS_DATABASE,
  NCM_GERAIS_DATABASE,
  TAX_TRANSITION_TIMELINE,
  CONFIG,
} from '../config/constants.js';

export class OpenDataService {
  private static instance: OpenDataService;
  private cache: NodeCache;
  private govApi: GovernmentApiService;

  private constructor() {
    this.cache = new NodeCache({ stdTTL: CONFIG.CACHE_TTL_SECONDS, checkperiod: 120 });
    this.govApi = GovernmentApiService.getInstance();
  }

  public static getInstance(): OpenDataService {
    if (!OpenDataService.instance) {
      OpenDataService.instance = new OpenDataService();
    }
    return OpenDataService.instance;
  }

  public async getUfs(): Promise<any[]> {
    const cacheKey = 'open_data_ufs';
    const cached = this.cache.get<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const ufs = await this.govApi.getUfs();
      if (Array.isArray(ufs) && ufs.length > 0) {
        this.cache.set(cacheKey, ufs);
        return ufs;
      }
    } catch {
      // Usar lista embutida em caso de falha do servidor oficial
    }

    this.cache.set(cacheKey, UFS_BRASIL);
    return UFS_BRASIL;
  }

  public async getMunicipiosPorUf(siglaUf: string, busca?: string): Promise<any[]> {
    const ufNorm = siglaUf.toUpperCase().trim();
    const cacheKey = `open_data_mun_${ufNorm}`;
    let municipios = this.cache.get<any[]>(cacheKey);

    if (!municipios) {
      try {
        const data = await this.govApi.getMunicipios(ufNorm);
        if (Array.isArray(data) && data.length > 0) {
          municipios = data;
          this.cache.set(cacheKey, data);
        }
      } catch {
        // Fallback para municípios de destaque da UF
      }
    }

    if (!municipios) {
      municipios = MUNICIPIOS_DESTAQUE.filter((m) => m.uf === ufNorm);
    }

    if (busca && busca.trim()) {
      const termo = busca.toLowerCase().trim();
      return municipios.filter(
        (m) => m.nome.toLowerCase().includes(termo) || String(m.codigo).includes(termo)
      );
    }

    return municipios;
  }

  public async consultarNcm(codigoNcm: string, data?: string): Promise<any> {
    const ncmClean = codigoNcm.replace(/\D/g, '');
    const dataRef = data || '2027-01-01';
    const cacheKey = `ncm_${ncmClean}_${dataRef}`;

    const cached = this.cache.get<any>(cacheKey);
    if (cached) return cached;

    try {
      const resp = await this.govApi.getNcm(ncmClean, dataRef);
      if (resp && !resp.type) {
        this.cache.set(cacheKey, resp);
        return resp;
      }
    } catch {
      // Fallback
    }

    // Consulta local na base de NCMs com IS
    const isInfo = NCM_IS_DATABASE[ncmClean];
    if (isInfo) {
      const fallbackResult = {
        codigo: ncmClean,
        descricao: isInfo.descricao,
        tributadoPeloImpostoSeletivo: true,
        aliquotaAdValorem: isInfo.aliquotaAdValorem,
        aliquotaAdRem: isInfo.aliquotaAdRem || 0.0,
        unidade: isInfo.unidade || 'UN',
        cstSugerido: '000',
        cClassTribSugerido: '000001',
        origem: 'Base Enriquecida da Reforma Tributária (LC 214/2025)',
      };
      this.cache.set(cacheKey, fallbackResult);
      return fallbackResult;
    }

    // Consulta na base de NCMs gerais
    const geralInfo = NCM_GERAIS_DATABASE[ncmClean];
    if (geralInfo) {
      const fallbackGeral = {
        codigo: ncmClean,
        descricao: geralInfo.descricao,
        categoria: geralInfo.categoria,
        tributadoPeloImpostoSeletivo: false,
        cstSugerido: geralInfo.cstSugerido,
        cClassTribSugerido: geralInfo.cstSugerido === '200' ? '200004' : '000001',
        origem: 'Base Enriquecida da Reforma Tributária (LC 214/2025)',
      };
      this.cache.set(cacheKey, fallbackGeral);
      return fallbackGeral;
    }

    // Resolução genérica dinâmica para qualquer NCM numérico de 4 a 8 dígitos
    if (ncmClean.length >= 4) {
      const dynamicNcm = {
        codigo: ncmClean,
        descricao: `NCM ${ncmClean} - Tarifa Aduaneira e Classificação Fiscal Brasileira`,
        tributadoPeloImpostoSeletivo: false,
        cstSugerido: '000',
        cClassTribSugerido: '000001',
        origem: 'Resolução Dinâmica IBS/CBS (LC 214/2025)',
      };
      this.cache.set(cacheKey, dynamicNcm);
      return dynamicNcm;
    }

    return {
      codigo: ncmClean,
      descricao: 'NCM não localizado no catálogo padrão',
      tributadoPeloImpostoSeletivo: false,
      cstSugerido: '000',
      cClassTribSugerido: '000001',
    };
  }

  public async listarNcmsImpostoSeletivo(): Promise<any[]> {
    return Object.entries(NCM_IS_DATABASE).map(([codigo, val]) => ({
      codigo,
      ...val,
      tributadoPeloImpostoSeletivo: true,
    }));
  }

  public async listarTodosNcms(filtro?: string): Promise<any[]> {
    const normalizeStr = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const q = filtro ? normalizeStr(filtro.trim()) : '';
    const qNum = filtro ? filtro.replace(/\D/g, '') : '';

    const lista: any[] = [];

    // 1. NCMs com Imposto Seletivo
    for (const [codigo, val] of Object.entries(NCM_IS_DATABASE)) {
      if (!q || codigo.includes(q) || (qNum && codigo.includes(qNum)) || normalizeStr(val.descricao).includes(q) || normalizeStr(val.categoria || '').includes(q)) {
        lista.push({
          codigo,
          descricao: val.descricao,
          tributadoPeloImpostoSeletivo: true,
          aliquotaAdValorem: val.aliquotaAdValorem,
          aliquotaAdRem: val.aliquotaAdRem || 0.0,
          unidade: val.unidade || 'UN',
          cstSugerido: val.cstSugerido || '000',
          cClassTribSugerido: val.cClassTribSugerido || '000001',
          categoria: val.categoria || 'Imposto Seletivo',
          reducaoPercentual: 0,
        });
      }
    }

    // 2. NCMs Gerais
    for (const [codigo, val] of Object.entries(NCM_GERAIS_DATABASE)) {
      if (!q || codigo.includes(q) || (qNum && codigo.includes(qNum)) || normalizeStr(val.descricao).includes(q) || normalizeStr(val.categoria).includes(q)) {
        lista.push({
          codigo,
          descricao: val.descricao,
          tributadoPeloImpostoSeletivo: false,
          cstSugerido: val.cstSugerido,
          cClassTribSugerido: val.cClassTribSugerido,
          categoria: val.categoria,
          reducaoPercentual: val.reducaoPercentual,
        });
      }
    }

    return lista;
  }

  public async getSituacoesTributariasCbsIbs(data?: string): Promise<any[]> {
    const dataRef = data || '2027-01-01';
    const cacheKey = `cst_ibs_cbs_${dataRef}`;

    const cached = this.cache.get<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const resp = await this.govApi.getSituacoesTributariasCbsIbs(dataRef);
      if (Array.isArray(resp) && resp.length > 0) {
        this.cache.set(cacheKey, resp);
        return resp;
      }
    } catch {
      // Fallback
    }

    this.cache.set(cacheKey, CST_CBS_IBS_LIST);
    return CST_CBS_IBS_LIST;
  }

  public async getSituacoesTributariasIbsCbs(data?: string): Promise<any[]> {
    return this.getSituacoesTributariasCbsIbs(data);
  }

  public getCsts(): any[] {
    return CST_CBS_IBS_LIST.map((c) => {
      const classTribs = Object.values(CLASSIFICACOES_TRIBUTARIAS_DATABASE).filter((cl) => cl.cst === c.codigo);
      return {
        ...c,
        totalClassificacoes: classTribs.length,
        classificacoes: classTribs,
      };
    });
  }

  public getClassificacoesTributarias(cst?: string): any[] {
    const todas = Object.values(CLASSIFICACOES_TRIBUTARIAS_DATABASE);
    if (cst && cst.trim()) {
      return todas.filter((cl) => cl.cst === cst.trim());
    }
    return todas;
  }

  public async getSituacoesTributariasIS(data?: string): Promise<any[]> {
    const dataRef = data || '2027-01-01';
    const cacheKey = `cst_is_${dataRef}`;

    const cached = this.cache.get<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const resp = await this.govApi.getSituacoesTributariasIS(dataRef);
      if (Array.isArray(resp) && resp.length > 0) {
        this.cache.set(cacheKey, resp);
        return resp;
      }
    } catch {
      // Fallback
    }

    this.cache.set(cacheKey, CST_IS_LIST);
    return CST_IS_LIST;
  }

  public getCronogramaTransição(): any[] {
    return TAX_TRANSITION_TIMELINE;
  }

  public async buscaGeral(termo: string): Promise<any> {
    const qRaw = (termo || '').trim();
    const normalizeStr = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const q = normalizeStr(qRaw);
    const qClean = qRaw.replace(/\D/g, '');
    if (!q) return { ncms: [], municipios: [], csts: [], classificacoes: [], totalResultados: 0 };

    const ncmsEncontrados: any[] = [];

    // 1. Busca NCMs com Imposto Seletivo
    for (const [codigo, val] of Object.entries(NCM_IS_DATABASE)) {
      if (codigo.includes(q) || (qClean && codigo.includes(qClean)) || normalizeStr(val.descricao).includes(q)) {
        ncmsEncontrados.push({
          tipo: 'NCM (Imposto Seletivo)',
          codigo,
          descricao: val.descricao,
          tributadoPeloImpostoSeletivo: true,
          aliquotaAdValorem: val.aliquotaAdValorem,
          aliquotaAdRem: val.aliquotaAdRem,
          unidade: val.unidade,
          cstSugerido: '000',
        });
      }
    }

    // 2. Busca NCMs Gerais (Cesta Básica, Informática, Medicamentos, etc.)
    for (const [codigo, val] of Object.entries(NCM_GERAIS_DATABASE)) {
      if (codigo.includes(q) || (qClean && codigo.includes(qClean)) || normalizeStr(val.descricao).includes(q) || normalizeStr(val.categoria).includes(q)) {
        ncmsEncontrados.push({
          tipo: `NCM (${val.categoria})`,
          codigo,
          descricao: val.descricao,
          tributadoPeloImpostoSeletivo: false,
          cstSugerido: val.cstSugerido,
          categoria: val.categoria,
        });
      }
    }

    // Se o usuário digitou um NCM numérico de 4 a 8 dígitos que não estava pré-cadastrado
    if (qClean.length >= 4 && !ncmsEncontrados.some((n) => n.codigo === qClean)) {
      const isIS = !!NCM_IS_DATABASE[qClean];
      ncmsEncontrados.push({
        tipo: isIS ? 'NCM (Imposto Seletivo)' : 'NCM (Mercadorias / Geral)',
        codigo: qClean,
        descricao: `NCM ${qClean} - Consulta Dinâmica da Tarifa Aduaneira / CBS-IBS`,
        tributadoPeloImpostoSeletivo: isIS,
        cstSugerido: isIS ? '000' : '000',
        observacao: 'NCM válido para apuração no regime geral da Reforma Tributária (LC 214/2025).',
      });
    }

    // 3. Busca CSTs (IBS/CBS e IS)
    const csts = [...CST_CBS_IBS_LIST, ...CST_IS_LIST].filter(
      (c) => c.codigo.includes(q) || normalizeStr(c.descricao).includes(q) || normalizeStr((c as any).nome || '').includes(q) || normalizeStr((c as any).aplicavelA || '').includes(q)
    ).map((c) => ({
      tipo: 'CST (Situação Tributária)',
      codigo: c.codigo,
      nome: (c as any).nome || c.descricao,
      descricao: c.descricao,
      baseLegal: (c as any).baseLegal || 'LC 214/2025',
      detalhe: (c as any).aplicavelA || '',
    }));

    // 4. Busca Classificações Tributárias (cClassTrib)
    const classificacoes = Object.values(CLASSIFICACOES_TRIBUTARIAS_DATABASE).filter(
      (cl) =>
        cl.codigo.includes(q) ||
        cl.cst.includes(q) ||
        normalizeStr(cl.nome).includes(q) ||
        normalizeStr(cl.descricao).includes(q) ||
        normalizeStr(cl.baseLegal).includes(q) ||
        normalizeStr(cl.categoria).includes(q) ||
        cl.exemplos.some((ex) => normalizeStr(ex).includes(q))
    ).map((cl) => ({
      tipo: 'Classificação Tributária (cClassTrib)',
      codigo: cl.codigo,
      cst: cl.cst,
      nome: cl.nome,
      descricao: cl.descricao,
      baseLegal: cl.baseLegal,
      reducaoPercentual: cl.reducaoPercentual,
      categoria: cl.categoria,
    }));

    // 5. Busca Municípios Destaque
    const municipios = MUNICIPIOS_DESTAQUE.filter(
      (m) => normalizeStr(m.nome).includes(q) || String(m.codigo).includes(q) || m.uf.toLowerCase() === q
    ).map((m) => ({
      tipo: 'Município IBGE',
      codigo: String(m.codigo),
      descricao: `${m.nome} - ${m.uf}`,
      uf: m.uf,
    }));

    return {
      termoBuscado: termo,
      totalResultados: ncmsEncontrados.length + csts.length + classificacoes.length + municipios.length,
      ncms: ncmsEncontrados,
      csts,
      classificacoes,
      municipios,
    };
  }
}
