import { Request, Response } from 'express';
import { OpenDataService } from '../services/openData.service.js';
import { GovernmentApiService } from '../services/governmentApi.service.js';

export class OpenDataController {
  private openData = OpenDataService.getInstance();
  private govApi = GovernmentApiService.getInstance();

  public getVersao = async (_req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.govApi.checkHealth();
      res.status(200).json({
        easyApiVersao: '1.0.0',
        servidorGoverno: health,
        normasLegais: ['EC 132/2023', 'LC 214/2025'],
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao verificar versão', mensagem: err?.message });
    }
  };

  public getUfs = async (_req: Request, res: Response): Promise<void> => {
    try {
      const ufs = await this.openData.getUfs();
      res.status(200).json(ufs);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao listar UFs', mensagem: err?.message });
    }
  };

  public getMunicipios = async (req: Request, res: Response): Promise<void> => {
    try {
      const siglaUf = (req.query.siglaUf as string) || 'SP';
      const busca = req.query.busca as string;
      const municipios = await this.openData.getMunicipiosPorUf(siglaUf, busca);
      res.status(200).json(municipios);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao listar municípios', mensagem: err?.message });
    }
  };

  public getNcm = async (req: Request, res: Response): Promise<void> => {
    try {
      const ncm = (req.query.ncm as string) || (req.query.codigo as string) || '';
      const busca = (req.query.busca as string) || (req.query.q as string) || '';
      const data = (req.query.data as string) || '2027-01-01';

      // 1. Sem parâmetros: retorna a lista completa de todos os NCMs catalogados
      if (!ncm && !busca) {
        const todos = await this.openData.listarTodosNcms();
        res.status(200).json({
          total: todos.length,
          ncms: todos,
          observacao: 'Catálogo ampliado de NCMs da Reforma Tributária (LC 214/2025). Use ?busca=termo ou ?ncm=codigo para filtrar.',
        });
        return;
      }

      // 2. Busca por termo textual (ex: "cerveja", "arroz", "veiculo", "medicamento")
      if (busca) {
        const filtrados = await this.openData.listarTodosNcms(busca);
        res.status(200).json({
          termo: busca,
          total: filtrados.length,
          ncms: filtrados,
        });
        return;
      }

      // 3. Consulta de NCM específico (numérico)
      const result = await this.openData.consultarNcm(ncm, data);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao consultar NCM', mensagem: err?.message });
    }
  };

  public getNcmsImpostoSeletivo = async (_req: Request, res: Response): Promise<void> => {
    try {
      const ncms = await this.openData.listarNcmsImpostoSeletivo();
      res.status(200).json(ncms);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao listar NCMs do IS', mensagem: err?.message });
    }
  };

  public getNbs = async (req: Request, res: Response): Promise<void> => {
    try {
      const nbs = (req.query.nbs as string) || '';
      const data = (req.query.data as string) || '2027-01-01';
      try {
        const resp = await this.govApi.getNbs(nbs, data);
        res.status(200).json(resp);
      } catch {
        res.status(200).json({
          tributadoPeloImpostoSeletivo: false,
          capitulo: 'Serviços em Geral',
          posicao: 'Serviços conforme LC 214/2025',
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao consultar NBS', mensagem: err?.message });
    }
  };

  public getSituacoesTributariasCbsIbs = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = (req.query.data as string) || '2026-01-01';
      const csts = await this.openData.getSituacoesTributariasCbsIbs(data);
      res.status(200).json(csts);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao consultar CSTs IBS/CBS', mensagem: err?.message });
    }
  };

  public getSituacoesTributariasIS = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = (req.query.data as string) || '2027-01-01';
      const csts = await this.openData.getSituacoesTributariasIS(data);
      res.status(200).json(csts);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao consultar CSTs do Imposto Seletivo', mensagem: err?.message });
    }
  };

  public getCronograma = async (_req: Request, res: Response): Promise<void> => {
    try {
      const cronograma = this.openData.getCronogramaTransição();
      res.status(200).json(cronograma);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao consultar cronograma', mensagem: err?.message });
    }
  };

  public getCsts = async (_req: Request, res: Response): Promise<void> => {
    try {
      const csts = this.openData.getCsts();
      res.status(200).json(csts);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao listar CSTs', mensagem: err?.message });
    }
  };

  public getClassificacoesTributarias = async (req: Request, res: Response): Promise<void> => {
    try {
      const cstParam = req.query.cst || req.params.cst;
      const cst = typeof cstParam === 'string' ? cstParam : undefined;
      const classificacoes = this.openData.getClassificacoesTributarias(cst);
      res.status(200).json(classificacoes);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao listar classificações tributárias', mensagem: err?.message });
    }
  };

  public buscaGeral = async (req: Request, res: Response): Promise<void> => {
    try {
      const q = (req.query.q as string) || '';
      const resultados = await this.openData.buscaGeral(q);
      res.status(200).json(resultados);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro na busca geral', mensagem: err?.message });
    }
  };
}
