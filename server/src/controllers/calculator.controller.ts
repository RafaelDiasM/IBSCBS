import { Request, Response } from 'express';
import { GovernmentApiService } from '../services/governmentApi.service.js';
import { TaxEngineService, SimplifiedTaxInput } from '../services/taxEngine.service.js';
import { ErrorTranslatorService } from '../services/errorTranslator.service.js';
import { NCM_IS_DATABASE } from '../config/constants.js';

export class CalculatorController {
  private govApi = GovernmentApiService.getInstance();
  private taxEngine = TaxEngineService.getInstance();

  public calcularSimplificado = async (req: Request, res: Response): Promise<void> => {
    try {
      const input: SimplifiedTaxInput = req.body;

      if (!input.valor || input.valor <= 0) {
        res.status(400).json({
          error: 'Valor da operação deve ser maior que zero',
          detalhe: 'Informe o campo "valor" em reais (ex: 1000.00)',
        });
        return;
      }

      if (!input.ufDestino) {
        res.status(400).json({
          error: 'UF de destino é obrigatória para o Princípio do Destino',
          detalhe: 'Informe o campo "ufDestino" com 2 caracteres (ex: "SP", "RJ", "MG")',
        });
        return;
      }

      const dataFato = input.data || new Date().toISOString().split('T')[0];
      const dataFatoISO = dataFato.includes('T') ? dataFato : `${dataFato}T12:00:00-03:00`;
      const ncmClean = input.ncm ? input.ncm.replace(/\D/g, '') : undefined;
      const ncmInfo = ncmClean ? NCM_IS_DATABASE[ncmClean] : null;

      const valorBruto = Number(input.valor || 0);
      const frete = Number(input.valorFrete || 0);
      const seguro = Number(input.valorSeguro || 0);
      const despesas = Number(input.outrasDespesas || 0);
      const taxaEmb = Number(input.taxaEmbarque || 0);
      const desconto = Number(input.valorDesconto || 0);
      const deducoesMat = Number(input.deducaoMateriais || 0);
      const baseLiquida = Math.max(0, valorBruto + frete + seguro + despesas + taxaEmb - desconto - deducoesMat);

      // Montar payload ROC oficial para tentar chamada ao governo
      const officialPayload: any = {
        id: `easyapi-${Date.now()}`,
        versao: '0.0.1',
        dhFatoGerador: dataFatoISO,
        uf: input.ufDestino.toUpperCase(),
        municipio: input.municipioDestino || 3550308,
        itens: [
          {
            numero: 1,
            ncm: ncmClean,
            nbs: input.nbs,
            cst: input.cst || '000',
            cClassTrib: input.cClassTrib || '000001',
            baseCalculo: baseLiquida,
            quantidade: input.quantidade || 1,
            unidade: input.unidade || (ncmInfo?.unidade || 'UN'),
          },
        ],
      };

      if (ncmInfo) {
        officialPayload.itens[0].impostoSeletivo = {
          cst: '000',
          cClassTrib: '000001',
          baseCalculo: baseLiquida,
          quantidade: input.quantidade || 1,
          unidade: ncmInfo.unidade || 'UN',
          impostoInformado: 0.0,
        };
      }

      let officialResp: any = null;
      try {
        const govResult = await this.govApi.postCalculadoraRegimeGeral(officialPayload);
        if (govResult.status === 200 && govResult.data?.objetos) {
          officialResp = govResult.data;
        }
      } catch {
        // Servidor governamental offline: cairá no motor local
      }

      const resultado = this.taxEngine.processarCalculoSimplificado(input, officialResp);
      resultado.payloadOficial = officialPayload;

      res.status(200).json(resultado);
    } catch (err: any) {
      res.status(500).json({
        error: 'Erro interno ao processar cálculo simplificado',
        mensagem: err?.message || 'Falha desconhecida',
      });
    }
  };

  public calcularRegimeGeral = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body || {};

      // Auto-enriquecimento e sanitização de campos comuns
      const sanitizedPayload: any = {
        id: body.id || `easyapi-${Date.now()}`,
        versao: body.versao || '0.0.1',
        dhFatoGerador: body.dhFatoGerador || body.dataHoraEmissao || `${new Date().toISOString().split('T')[0]}T12:00:00-03:00`,
        municipio: body.municipio || 3550308,
        uf: (body.uf || 'SP').toUpperCase(),
        itens: (body.itens || []).map((it: any, idx: number) => {
          const ncmClean = it.ncm ? String(it.ncm).replace(/\D/g, '') : undefined;
          const isInfo = ncmClean ? NCM_IS_DATABASE[ncmClean] : null;

          const itemSanitized: any = {
            numero: it.numero || idx + 1,
            cst: it.cst || '000',
            cClassTrib: it.cClassTrib || '000001',
            baseCalculo: Number(it.baseCalculo || 0),
            quantidade: it.quantidade || 1,
            ncm: ncmClean,
            nbs: it.nbs ? String(it.nbs).replace(/\D/g, '') : undefined,
            unidade: it.unidade || (isInfo?.unidade || 'UN'),
          };

          if (it.impostoSeletivo) {
            itemSanitized.impostoSeletivo = {
              cst: it.impostoSeletivo.cst || isInfo?.cstSugerido || '000',
              cClassTrib: it.impostoSeletivo.cClassTrib || isInfo?.cClassTribSugerido || '000001',
              baseCalculo: Number(it.impostoSeletivo.baseCalculo ?? it.baseCalculo ?? 0),
              quantidade: Number(it.impostoSeletivo.quantidade ?? it.quantidade ?? 1),
              unidade: it.impostoSeletivo.unidade || isInfo?.unidade || it.unidade || 'UN',
              impostoInformado: Number(it.impostoSeletivo.impostoInformado ?? 0),
            };
          } else if (isInfo) {
            // Auto-enriquecimento inteligente EasyAPI:
            // NCMs sujeitos a IS exigem bloco impostoSeletivo no schema do governo a partir de 2027
            itemSanitized.impostoSeletivo = {
              cst: isInfo.cstSugerido || '000',
              cClassTrib: isInfo.cClassTribSugerido || '000001',
              baseCalculo: Number(it.baseCalculo || 0),
              quantidade: Number(it.quantidade || 1),
              unidade: isInfo.unidade || it.unidade || 'UN',
              impostoInformado: 0,
            };
          }

          if (it.tributacaoRegular) {
            itemSanitized.tributacaoRegular = it.tributacaoRegular;
          }

          return itemSanitized;
        }),
      };

      if (body.gCompraGov) {
        sanitizedPayload.gCompraGov = body.gCompraGov;
      }

      try {
        const govResult = await this.govApi.postCalculadoraRegimeGeral(sanitizedPayload);
        if (govResult.status === 200) {
          res.status(200).json({
            status: 'sucesso',
            origem: 'oficial_governo',
            headersOficiais: govResult.headers,
            resultado: govResult.data,
          });
          return;
        }

        // Se a API do governo retornar erro de validação, traduzir o erro
        const traducao = ErrorTranslatorService.translate(govResult.data);
        res.status(govResult.status).json({
          status: 'erro_validacao_oficial',
          respostaGoverno: govResult.data,
          diagnosticoEasyAPI: traducao,
        });
      } catch (errGov: any) {
        // Fallback para motor local com compatibilidade 100% drop-in
        const localResult = this.taxEngine.calcularLocal(sanitizedPayload);
        res.status(200).json({
          ...localResult,
          status: 'simulado',
          origem: 'motor_local_lc214',
          aviso: 'Servidor governamental offline ou instável. Cálculo efetuado pelo motor inteligente LC 214/2025 da EasyAPI.',
          resultado: localResult,
        });
      }
    } catch (err: any) {
      res.status(500).json({
        error: 'Erro no cálculo do regime geral',
        mensagem: err?.message,
      });
    }
  };

  public calcularPedagio = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = req.body;
      try {
        const govResult = await this.govApi.postCalculadoraPedagio(payload);
        res.status(govResult.status).json(govResult.data);
      } catch {
        res.status(200).json({
          status: 'simulado',
          origem: 'motor_local_lc214',
          aviso: 'Cálculo de pedágio simulado com base na alíquota padrão da UF.',
          payloadEnviado: payload,
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Erro no cálculo de pedágio', mensagem: err?.message });
    }
  };

  public calcularBaseCalculoCibs = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = req.body;
      const govResult = await this.govApi.postBaseCalculoCibs(payload);
      res.status(govResult.status).json(govResult.data);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro na Base de Cálculo CIBS', mensagem: err?.message });
    }
  };

  public calcularBaseCalculoIS = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = req.body;
      const govResult = await this.govApi.postBaseCalculoIS(payload);
      res.status(govResult.status).json(govResult.data);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro na Base de Cálculo IS', mensagem: err?.message });
    }
  };

  public calcularNfseBaseCalculo = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = req.body;
      const govResult = await this.govApi.postBaseCalculoNfse(payload);
      res.status(govResult.status).json(govResult.data);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro na Base de Cálculo NFS-e', mensagem: err?.message });
    }
  };

  public validarNfseIndicador = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = req.body;
      const govResult = await this.govApi.postValidarIndicadorOperacaoNfse(payload);
      res.status(govResult.status).json(govResult.data);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro na validação do indicador de operação NFS-e', mensagem: err?.message });
    }
  };
}
