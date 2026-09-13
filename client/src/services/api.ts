export type TipoDocumentoFiscal = 'nfe' | 'nfce' | 'nfse' | 'cte' | 'mdfe' | 'bpe' | 'nf3e';

export interface HealthData {
  gateway: {
    status: string;
    nome: string;
    versao: string;
    uptimeSegundos: number;
    dataHora: string;
  };
  servidorGoverno: {
    online: boolean;
    latencyMs: number;
    serverUrl: string;
    versaoApp?: string;
    versaoDb?: string;
    lastChecked: string;
    error?: string;
  };
}

export interface CalculationResult {
  status: 'sucesso' | 'simulado';
  modoExecucao: 'oficial_governo' | 'motor_local_lc214';
  documentoFiscal?: {
    tipo: TipoDocumentoFiscal;
    nome: string;
    versaoNotaTecnica: string;
    finalidade: string;
    regrasEspecificas: string;
  };
  composicaoBaseCalculo?: {
    valorBruto: number;
    acrescimos: {
      frete: number;
      seguro: number;
      outrasDespesas: number;
      taxaEmbarque: number;
    };
    deducoes: {
      descontoIncondicional: number;
      materiaisDeducoes: number;
    };
    baseLiquidaOperacao: number;
    impostoSeletivoIntegrado: number;
    baseCalculoFinalIBSCBS: number;
    memoriaBaseCalculo: string;
  };
  resumo: {
    valorOperacao: number;
    baseCalculoIS: number;
    baseCalculoIBSCBS: number;
    valorImpostoSeletivo: number;
    valorCBS: number;
    valorIBSEstadual: number;
    valorIBSMunicipal: number;
    valorIBSTotal: number;
    totalTributos: number;
    aliquotaEfetivaTotal: number;
    valorFinalTotal: number;
  };
  tributos: {
    impostoSeletivo?: {
      incide: boolean;
      ncm?: string;
      cst: string;
      baseCalculo: number;
      aliquotaAdValorem?: number;
      aliquotaAdRem?: number;
      quantidade?: number;
      unidade?: string;
      valorTotal: number;
      memoriaCalculo: string;
    };
    cbs: {
      cst: string;
      cClassTrib: string;
      baseCalculo: number;
      aliquotaPercentual: number;
      valorTotal: number;
      memoriaCalculo: string;
    };
    ibsEstadual: {
      uf: string;
      cst: string;
      cClassTrib: string;
      baseCalculo: number;
      aliquotaPercentual: number;
      valorTotal: number;
      memoriaCalculo: string;
    };
    ibsMunicipal: {
      codigoMunicipio: number;
      cst: string;
      cClassTrib: string;
      baseCalculo: number;
      aliquotaPercentual: number;
      valorTotal: number;
      memoriaCalculo: string;
    };
    ibsTotal: {
      aliquotaPercentual: number;
      valorTotal: number;
    };
  };
  comparativoLegado: {
    estimativaICMSouISS: number;
    estimativaPIS: number;
    estimativaCOFINS: number;
    estimativaIPI: number;
    totalSistemaLegado: number;
    aliquotaEfetivaLegado: number;
    diferencaValor: number;
    impactoCarga: 'aumento' | 'reducao' | 'neutro';
  };
  classificacaoTributaria?: {
    codigo: string;
    cst: string;
    nome: string;
    baseLegal: string;
    fatorReducao: number;
    reducaoPercentual: number;
    regrasOperacionais: string;
  };
  regrasTributarias: {
    anoFatoGerador: number;
    faseTransição: string;
    baseLegal: string;
    regrasAplicadas: string[];
  };
  xmlGerado?: string;
  payloadOficial?: any;
  respostaOficial?: any;
}

export const apiClient = {
  async getHealth(): Promise<HealthData> {
    const res = await fetch('/api/v1/observabilidade/health');
    return res.json();
  },

  async getCsts(): Promise<any[]> {
    const res = await fetch('/api/v1/dados-abertos/csts');
    return res.json();
  },

  async getClassificacoesTributarias(cst?: string): Promise<any[]> {
    const url = cst ? `/api/v1/dados-abertos/classificacoes-tributarias?cst=${cst}` : '/api/v1/dados-abertos/classificacoes-tributarias';
    const res = await fetch(url);
    return res.json();
  },

  async calcularSimplificado(payload: any): Promise<CalculationResult> {
    const res = await fetch('/api/v1/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || err.mensagem || 'Falha no cálculo tributário');
    }
    return res.json();
  },

  async buscaGeral(termo: string): Promise<any> {
    const res = await fetch(`/api/v1/dados-abertos/busca-geral?q=${encodeURIComponent(termo)}`);
    return res.json();
  },

  async calcularRegimeGeral(payload: any): Promise<any> {
    const res = await fetch('/api/v1/calculadora/regime-geral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getUfs(): Promise<any[]> {
    const res = await fetch('/api/v1/dados-abertos/ufs');
    return res.json();
  },

  async getMunicipios(siglaUf: string, busca?: string): Promise<any[]> {
    const url = `/api/v1/dados-abertos/ufs/municipios?siglaUf=${siglaUf}${busca ? `&busca=${encodeURIComponent(busca)}` : ''}`;
    const res = await fetch(url);
    return res.json();
  },

  async getNcm(ncm: string, data?: string): Promise<any> {
    const res = await fetch(`/api/v1/dados-abertos/ncm?ncm=${ncm}${data ? `&data=${data}` : ''}`);
    return res.json();
  },

  async getNcmsImpostoSeletivo(): Promise<any[]> {
    const res = await fetch('/api/v1/dados-abertos/ncm/imposto-seletivo');
    return res.json();
  },

  async getCstsCbsIbs(): Promise<any[]> {
    const res = await fetch('/api/v1/dados-abertos/situacoes-tributarias/cbs-ibs');
    return res.json();
  },

  async getCronograma(): Promise<any[]> {
    const res = await fetch('/api/v1/dados-abertos/cronograma');
    return res.json();
  },

  async getGlossarioErros(): Promise<any[]> {
    const res = await fetch('/api/v1/observabilidade/erros');
    return res.json();
  },

  async gerarSnippetsSdk(endpoint: string, method: string, payload: any): Promise<any> {
    const res = await fetch('/api/v1/sdk/snippets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint, method, payload }),
    });
    return res.json();
  },

  async gerarXmlDfe(tipo: string, payload: any): Promise<string> {
    const res = await fetch(`/api/v1/xml/generate?tipo=${tipo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.text();
  },

  async validarXmlDfe(tipo: string, xmlString: string): Promise<any> {
    const res = await fetch(`/api/v1/xml/validate?tipo=${tipo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: xmlString,
    });
    return res.json();
  },

  async getNcms(busca?: string): Promise<{ total: number; ncms: any[] }> {
    const url = busca ? `/api/v1/dados-abertos/ncm?busca=${encodeURIComponent(busca)}` : '/api/v1/dados-abertos/ncm';
    const res = await fetch(url);
    return res.json();
  },

  async injetarXmlDfe(xmlNfeOriginal: string, xmlRtcOuCalculo?: any): Promise<{ sucesso: boolean; xmlNfeComRtc: string; mensagem: string }> {
    const res = await fetch('/api/v1/xml/inject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xmlNfe: xmlNfeOriginal, xmlRtc: xmlRtcOuCalculo }),
    });
    return res.json();
  },

  async getExemploNfe(): Promise<string> {
    const res = await fetch('/api/v1/xml/exemplo-nfe');
    return res.text();
  },
};
