import { Request, Response } from 'express';
import { SdkGeneratorService } from '../services/sdkGenerator.service.js';

export class SdkController {
  public generateSnippets = (req: Request, res: Response): void => {
    try {
      const endpoint = (req.body?.endpoint as string) || '/api/v1/calcular';
      const method = (req.body?.method as string) || 'POST';
      const payload = req.body?.payload || {
        valor: 1000.0,
        ncm: '24021000',
        ufDestino: 'SP',
        municipioDestino: 3550308,
        data: '2027-01-01',
      };

      const snippets = SdkGeneratorService.generateSnippets(endpoint, method, payload);
      res.status(200).json(snippets);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao gerar snippets de SDK', mensagem: err?.message });
    }
  };
}
