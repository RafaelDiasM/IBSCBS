import { Request, Response } from 'express';
import { GovernmentApiService } from '../services/governmentApi.service.js';
import { ErrorTranslatorService } from '../services/errorTranslator.service.js';

export class ObservabilityController {
  private govApi = GovernmentApiService.getInstance();

  public getHealth = async (_req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.govApi.checkHealth();
      res.status(200).json({
        gateway: {
          status: 'online',
          nome: 'IBS/CBS EasyAPI Gateway',
          versao: '1.0.0',
          uptimeSegundos: process.uptime(),
          dataHora: new Date().toISOString(),
        },
        servidorGoverno: health,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao checar status de observabilidade', mensagem: err?.message });
    }
  };

  public getGlossarioErros = async (_req: Request, res: Response): Promise<void> => {
    try {
      const erros = ErrorTranslatorService.getFullGlossary();
      res.status(200).json(erros);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao listar glossário de erros', mensagem: err?.message });
    }
  };

  public buscarErro = async (req: Request, res: Response): Promise<void> => {
    try {
      const codigo = req.query.codigo as string;
      if (!codigo) {
        res.status(400).json({ error: 'Parâmetro codigo é obrigatório (ex: REG-020, IS-001)' });
        return;
      }

      try {
        const respGov = await this.govApi.buscarErro(codigo);
        if (respGov && !respGov.type) {
          res.status(200).json(respGov);
          return;
        }
      } catch {
        // Fallback
      }

      const traducao = ErrorTranslatorService.translate({ title: codigo, detail: `Código fiscal ${codigo}` });
      res.status(200).json(traducao);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao buscar erro fiscal', mensagem: err?.message });
    }
  };
}
