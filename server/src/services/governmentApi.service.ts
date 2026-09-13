import { CONFIG } from '../config/constants.js';

export interface GovernmentApiHealth {
  online: boolean;
  latencyMs: number;
  serverUrl: string;
  versaoApp?: string;
  versaoDb?: string;
  lastChecked: string;
  error?: string;
}

export class GovernmentApiService {
  private static instance: GovernmentApiService;

  private constructor() {}

  public static getInstance(): GovernmentApiService {
    if (!GovernmentApiService.instance) {
      GovernmentApiService.instance = new GovernmentApiService();
    }
    return GovernmentApiService.instance;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'IBSCBS-EasyAPI-Gateway/1.0',
          ...(options.headers || {}),
        },
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public async checkHealth(): Promise<GovernmentApiHealth> {
    const start = Date.now();
    try {
      const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/dados-abertos/versao`;
      const res = await this.fetchWithTimeout(url);
      const latencyMs = Date.now() - start;

      if (res.ok) {
        const data = (await res.json()) as any;
        return {
          online: true,
          latencyMs,
          serverUrl: CONFIG.GOV_API_BASE_URL,
          versaoApp: data.versaoApp,
          versaoDb: data.versaoDb,
          lastChecked: new Date().toISOString(),
        };
      }

      return {
        online: false,
        latencyMs,
        serverUrl: CONFIG.GOV_API_BASE_URL,
        lastChecked: new Date().toISOString(),
        error: `HTTP ${res.status}: ${res.statusText}`,
      };
    } catch (err: any) {
      return {
        online: false,
        latencyMs: Date.now() - start,
        serverUrl: CONFIG.GOV_API_BASE_URL,
        lastChecked: new Date().toISOString(),
        error: err?.message || 'Falha de conexão com servidor governamental',
      };
    }
  }

  public async postCalculadoraRegimeGeral(payload: any): Promise<{ data: any; status: number; headers: Record<string, string> }> {
    const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/regime-geral`;
    const res = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    const data = await res.json();
    return { data, status: res.status, headers: responseHeaders };
  }

  public async postCalculadoraPedagio(payload: any): Promise<{ data: any; status: number; headers: Record<string, string> }> {
    const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/pedagio`;
    const res = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    const data = await res.json();
    return { data, status: res.status, headers: responseHeaders };
  }

  public async postBaseCalculoCibs(payload: any): Promise<{ data: any; status: number }> {
    const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/base-calculo/cbs-ibs-mercadorias`;
    const res = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { data, status: res.status };
  }

  public async postBaseCalculoIS(payload: any): Promise<{ data: any; status: number }> {
    const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/base-calculo/is-mercadorias`;
    const res = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { data, status: res.status };
  }

  public async postBaseCalculoNfse(payload: any): Promise<{ data: any; status: number }> {
    const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/nfse/base-calculo`;
    const res = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { data, status: res.status };
  }

  public async postValidarIndicadorOperacaoNfse(payload: any): Promise<{ data: any; status: number }> {
    const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/nfse/indicador-operacao/validate`;
    const res = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { data, status: res.status };
  }

  public async getUfs(): Promise<any> {
    const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/dados-abertos/ufs`;
    const res = await this.fetchWithTimeout(url);
    return res.json();
  }

  public async getMunicipios(siglaUf: string): Promise<any> {
    const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/dados-abertos/ufs/municipios?siglaUf=${encodeURIComponent(siglaUf.toUpperCase())}`;
    const res = await this.fetchWithTimeout(url);
    return res.json();
  }

  public async getNcm(ncm: string, data: string): Promise<any> {
    const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/dados-abertos/ncm?ncm=${encodeURIComponent(ncm)}&data=${encodeURIComponent(data)}`;
    const res = await this.fetchWithTimeout(url);
    return res.json();
  }

  public async getNbs(nbs: string, data: string): Promise<any> {
    const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/dados-abertos/nbs?nbs=${encodeURIComponent(nbs)}&data=${encodeURIComponent(data)}`;
    const res = await this.fetchWithTimeout(url);
    return res.json();
  }

  public async getNbsLista(data: string): Promise<any> {
    const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/dados-abertos/nbs/lista?data=${encodeURIComponent(data)}`;
    const res = await this.fetchWithTimeout(url);
    return res.json();
  }

  public async getSituacoesTributariasCbsIbs(data: string): Promise<any> {
    const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/dados-abertos/situacoes-tributarias/cbs-ibs?data=${encodeURIComponent(data)}`;
    const res = await this.fetchWithTimeout(url);
    return res.json();
  }

  public async getSituacoesTributariasIS(data: string): Promise<any> {
    const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/dados-abertos/situacoes-tributarias/imposto-seletivo?data=${encodeURIComponent(data)}`;
    const res = await this.fetchWithTimeout(url);
    return res.json();
  }

  public async getAliquotaUniao(data: string): Promise<any> {
    const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/dados-abertos/aliquota-uniao?data=${encodeURIComponent(data)}`;
    const res = await this.fetchWithTimeout(url);
    return res.json();
  }

  public async getAliquotaUf(siglaUf: string, data: string): Promise<any> {
    const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/dados-abertos/aliquota-uf?siglaUf=${encodeURIComponent(siglaUf)}&data=${encodeURIComponent(data)}`;
    const res = await this.fetchWithTimeout(url);
    return res.json();
  }

  public async getAliquotaMunicipio(codigoMunicipio: number | string, data: string): Promise<any> {
    const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/dados-abertos/aliquota-municipio?codigoMunicipio=${encodeURIComponent(codigoMunicipio)}&data=${encodeURIComponent(data)}`;
    const res = await this.fetchWithTimeout(url);
    return res.json();
  }

  public async buscarErro(codigo: string): Promise<any> {
    const url = `${CONFIG.GOV_API_BASE_URL}/calculadora/observabilidade/erros?codigo=${encodeURIComponent(codigo)}`;
    const res = await this.fetchWithTimeout(url);
    return res.json();
  }
}
