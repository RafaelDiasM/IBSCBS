import { Request, Response } from 'express';
import { XmlService } from '../services/xml.service.js';

export class XmlController {
  private xmlService = XmlService.getInstance();

  public getDocumentosValidacao = (_req: Request, res: Response): void => {
    res.status(200).json([
      { nome: 'NF-e (Nota Fiscal Eletrônica)', mnemonico: 'nfe', versaoNotaTecnica: 'v1.30' },
      { nome: 'NFC-e (Nota Fiscal Consumidor Eletrônica)', mnemonico: 'nfce', versaoNotaTecnica: 'v1.30' },
      { nome: 'NFS-e (Nota Fiscal de Serviços Eletrônica Nacional)', mnemonico: 'nfse', versaoNotaTecnica: 'v1.00' },
      { nome: 'CT-e (Conhecimento de Transporte Eletrônico)', mnemonico: 'cte', versaoNotaTecnica: 'v1.10' },
      { nome: 'CT-e Simplificado', mnemonico: 'cte-simplificado', versaoNotaTecnica: 'v1.10' },
      { nome: 'BP-e (Bilhete de Passagem Eletrônico)', mnemonico: 'bpe', versaoNotaTecnica: 'v1.10' },
      { nome: 'NF3e (Nota Fiscal de Energia Elétrica Eletrônica)', mnemonico: 'nf3e', versaoNotaTecnica: 'v1.10' },
    ]);
  };

  /**
   * Passo 2 Oficial: Gera os grupos XML da RTC
   * Endpoint: POST /api/v1/xml/generate ou POST /api/calculadora/xml/generate
   */
  public gerarXmlDfe = (req: Request, res: Response): void => {
    try {
      const tipo = (req.query.tipo as string) || 'nfe';
      const body = req.body || {};

      const xml = this.xmlService.gerarXmlGruposRtc(body, tipo);

      res.set('Content-Type', 'application/xml; charset=utf-8');
      res.status(200).send(xml);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao gerar XML DFe', mensagem: err?.message });
    }
  };

  /**
   * Passo 3 Oficial: Valida o XML dos grupos da RTC
   * Endpoint: POST /api/v1/xml/validate ou POST /api/calculadora/xml/validate
   */
  public validarXmlDfe = (req: Request, res: Response): void => {
    try {
      const xmlBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const tipo = (req.query.tipo as string) || 'nfe';
      const subtipo = (req.query.subtipo as string) || 'grupo';

      const validacao = this.xmlService.validarXmlRtc(xmlBody, tipo, subtipo);

      res.status(validacao.valido ? 200 : 422).json({
        valido: validacao.valido,
        tipoDocumento: tipo,
        subtipo,
        tagsVerificadas: validacao.tagsVerificadas,
        status: validacao.mensagem,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Erro na validação do XML', mensagem: err?.message });
    }
  };

  /**
   * Passo 4 Oficial (Diferencial da EasyAPI): Injeta os nós da RTC na NF-e original
   * Endpoint: POST /api/v1/xml/inject ou POST /api/calculadora/xml/inject
   */
  public injetarXmlDfe = (req: Request, res: Response): void => {
    try {
      let xmlNfe: string = '';
      let xmlRtc: string | any = '';

      if (typeof req.body === 'string') {
        // Se enviou o XML puro no body
        xmlNfe = req.body;
      } else if (req.body) {
        xmlNfe = req.body.xmlNfe || req.body.nfeOriginal || req.body.xml || '';
        xmlRtc = req.body.xmlRtc || req.body.rtc || req.body.calculo || {};
      }

      if (!xmlNfe || !xmlNfe.trim()) {
        // Se não forneceu, usa o exemplo real de teste
        xmlNfe = this.xmlService.getExemploNfeSemRtc();
      }

      const resultado = this.xmlService.injetarRtcNaXmlNfe(xmlNfe, xmlRtc);

      const acceptHeader = req.headers['accept'] || '';
      if (acceptHeader.includes('application/xml') || acceptHeader.includes('text/xml')) {
        res.set('Content-Type', 'application/xml; charset=utf-8');
        res.status(resultado.sucesso ? 200 : 400).send(resultado.xmlNfeComRtc);
        return;
      }

      res.status(resultado.sucesso ? 200 : 400).json({
        sucesso: resultado.sucesso,
        mensagem: resultado.sucesso ? 'XML da RTC injetado na NF-e com sucesso!' : resultado.erro,
        xmlNfeComRtc: resultado.xmlNfeComRtc,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao injetar RTC no XML', mensagem: err?.message });
    }
  };

  /**
   * Retorna o XML modelo de teste de NF-e sem RTC
   */
  public getExemploNfe = (_req: Request, res: Response): void => {
    const xml = this.xmlService.getExemploNfeSemRtc();
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(xml);
  };
}
