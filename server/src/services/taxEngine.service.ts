import {
  TAX_TRANSITION_TIMELINE,
  NCM_IS_DATABASE,
  CST_CBS_IBS_LIST,
  CLASSIFICACOES_TRIBUTARIAS_DATABASE,
  obterClassificacaoTributariaUniversal,
} from '../config/constants.js';

export type TipoDocumentoFiscal = 'nfe' | 'nfce' | 'nfse' | 'cte' | 'mdfe' | 'bpe' | 'nf3e';

export interface SimplifiedTaxInput {
  valor: number;
  tipoDocumento?: TipoDocumentoFiscal; // 'nfe' | 'nfce' | 'nfse' | 'cte' | 'mdfe' | 'bpe' | 'nf3e'
  ncm?: string;
  nbs?: string;
  cIndOp?: string; // Indicador de operação para NFS-e (6 dígitos, ex: 100301)
  ufOrigem?: string;
  ufDestino: string;
  municipioDestino: number;
  data?: string;
  cst?: string;
  cClassTrib?: string;
  quantidade?: number;
  unidade?: string;
  // Campos específicos de composição de base
  valorFrete?: number;
  valorSeguro?: number;
  outrasDespesas?: number;
  valorDesconto?: number;
  deducaoMateriais?: number; // Para NFS-e construção civil
  taxaEmbarque?: number; // Para BP-e
  isCompraGovernamental?: boolean;
  isZfm?: boolean;
}

export interface SimplifiedTaxOutput {
  status: 'sucesso' | 'simulado';
  modoExecucao: 'oficial_governo' | 'motor_local_lc214';
  documentoFiscal: {
    tipo: TipoDocumentoFiscal;
    nome: string;
    versaoNotaTecnica: string;
    finalidade: string;
    regrasEspecificas: string;
  };
  composicaoBaseCalculo: {
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
  xmlGerado: string;
  payloadOficial?: any;
  respostaOficial?: any;
}

export class TaxEngineService {
  private static instance: TaxEngineService;

  private constructor() {}

  public static getInstance(): TaxEngineService {
    if (!TaxEngineService.instance) {
      TaxEngineService.instance = new TaxEngineService();
    }
    return TaxEngineService.instance;
  }

  public getTimelineForYear(year: number) {
    const found = TAX_TRANSITION_TIMELINE.find((t) => t.ano === year);
    if (found) return found;
    if (year < 2026) return TAX_TRANSITION_TIMELINE[0];
    return TAX_TRANSITION_TIMELINE[TAX_TRANSITION_TIMELINE.length - 1];
  }

  public getDocumentMetadata(tipo: TipoDocumentoFiscal = 'nfe') {
    switch (tipo) {
      case 'nfe':
        return {
          tipo: 'nfe' as TipoDocumentoFiscal,
          nome: 'NF-e (Nota Fiscal Eletrônica - Mod 55)',
          versaoNotaTecnica: 'NT v1.30 (Reforma Tributária)',
          finalidade: 'Venda e circulação de mercadorias entre empresas ou para consumidor interestadual',
          regrasEspecificas: 'Base de cálculo inclui frete, seguro e despesas acessórias e subtrai descontos. O Imposto Seletivo (se houver) compõe a base da CBS e IBS (Art. 13 LC 214).',
        };
      case 'nfce':
        return {
          tipo: 'nfce' as TipoDocumentoFiscal,
          nome: 'NFC-e (Nota Fiscal de Consumidor Eletrônica - Mod 65)',
          versaoNotaTecnica: 'NT v1.30',
          finalidade: 'Venda a consumidor final no varejo (presencial ou delivery)',
          regrasEspecificas: 'Cálculo direto sobre os itens do PDV com destaque simplificado do IBS/CBS para o consumidor.',
        };
      case 'nfse':
        return {
          tipo: 'nfse' as TipoDocumentoFiscal,
          nome: 'NFS-e (Nota Fiscal de Serviços Eletrônica Nacional)',
          versaoNotaTecnica: 'Padrão Nacional v1.00',
          finalidade: 'Prestação de serviços tributada pela NBS',
          regrasEspecificas: 'Arrecadação de IBS Municipal e Estadual com base no domicílio do tomador (Princípio do Destino). Extinção do ISS em 2033.',
        };
      case 'cte':
        return {
          tipo: 'cte' as TipoDocumentoFiscal,
          nome: 'CT-e (Conhecimento de Transporte Eletrônico - Mod 57)',
          versaoNotaTecnica: 'NT v1.10',
          finalidade: 'Transporte interestadual e intermunicipal de cargas',
          regrasEspecificas: 'Base de cálculo é o valor do frete + pedágio + taxas. O tomador do frete no regime geral apropria crédito financeiro integral de IBS/CBS.',
        };
      case 'mdfe':
        return {
          tipo: 'mdfe' as TipoDocumentoFiscal,
          nome: 'MDF-e (Manifesto Eletrônico de Documentos Fiscais - Mod 58)',
          versaoNotaTecnica: 'NT v1.10',
          finalidade: 'Consolidação e manifesto de transporte de cargas com múltiplas NF-e/CT-e',
          regrasEspecificas: 'Documento de controle logístico e consolidação fiscal interestadual. Totaliza os valores das cargas e documentos vinculados.',
        };
      case 'bpe':
        return {
          tipo: 'bpe' as TipoDocumentoFiscal,
          nome: 'BP-e (Bilhete de Passagem Eletrônico - Mod 63)',
          versaoNotaTecnica: 'NT v1.10',
          finalidade: 'Transporte de passageiros intermunicipal, interestadual e internacional',
          regrasEspecificas: 'Base de cálculo composta pelo valor da passagem + taxa de embarque - descontos.',
        };
      case 'nf3e':
        return {
          tipo: 'nf3e' as TipoDocumentoFiscal,
          nome: 'NF3e (Nota Fiscal de Energia Elétrica Eletrônica - Mod 66)',
          versaoNotaTecnica: 'NT v1.10',
          finalidade: 'Faturamento de energia elétrica para consumidores livres ou cativos',
          regrasEspecificas: 'Base de cálculo inclui fornecimento de energia e tarifas de distribuição e transmissão (TUSD/TUST).',
        };
    }
  }

  public calcularLocal(operacaoInput: any): any {
    const dataFato = operacaoInput.dhFatoGerador || operacaoInput.dataHoraEmissao || '2026-06-01T12:00:00-03:00';
    const ano = new Date(dataFato).getFullYear() || 2026;
    const timeline = this.getTimelineForYear(ano);
    const itens = operacaoInput.itens || [];

    let totalBC = 0;
    let totalCBS = 0;
    let totalIBSUF = 0;
    let totalIBSMun = 0;
    let totalIS = 0;

    const objetos = itens.map((item: any, idx: number) => {
      const nObj = item.numero || idx + 1;
      const cst = item.cst || '000';
      const cClassTrib = item.cClassTrib || '000001';
      const baseOriginal = Number(item.baseCalculo || 0);
      const quantidade = Number(item.quantidade || 1);
      const unidade = item.unidade || 'UN';

      let isObj: any = null;
      let valorIS = 0;

      const isInfo = item.impostoSeletivo;
      const ncmInfo = item.ncm ? NCM_IS_DATABASE[item.ncm] : null;

      if ((isInfo && isInfo.cst === '000') || (timeline.impostoSeletivoAtivo && ncmInfo)) {
        const cstIS = isInfo?.cst || '000';
        const cClassTribIS = isInfo?.cClassTrib || '000001';
        const baseIS = isInfo?.baseCalculo ? Number(isInfo.baseCalculo) : baseOriginal;
        const pIS = ncmInfo?.aliquotaAdValorem || 10.0;
        const pISEspec = ncmInfo?.aliquotaAdRem || 0.0;
        const uTrib = isInfo?.unidade || ncmInfo?.unidade || unidade;
        const qTrib = isInfo?.quantidade ? String(isInfo.quantidade) : String(quantidade);

        const vISAdValorem = (baseIS * pIS) / 100;
        const vISAdRem = Number(qTrib) * pISEspec;
        valorIS = Number((vISAdValorem + vISAdRem).toFixed(2));
        totalIS += valorIS;

        isObj = {
          CSTIS: cstIS,
          cClassTribIS: cClassTribIS,
          vBCIS: baseIS.toFixed(2),
          pIS: pIS.toFixed(2),
          pISEspec: pISEspec > 0 ? pISEspec.toFixed(2) : undefined,
          uTrib: uTrib,
          qTrib: qTrib,
          vIS: valorIS.toFixed(2),
          memoriaCalculo: `Operação de consumo sujeita ao Imposto Seletivo (Art. 412 LC 214/2025). Base de cálculo: R$ ${baseIS.toFixed(2)}, Alíquota ad valorem: ${pIS.toFixed(2)}%${pISEspec > 0 ? `, Alíquota ad rem: R$ ${pISEspec.toFixed(2)}/${uTrib}` : ''}. Valor IS: R$ ${valorIS.toFixed(2)}.`,
        };
      }

      const vBCIBSCBS = Number((baseOriginal + valorIS).toFixed(2));
      totalBC += vBCIBSCBS;

      const cstInfo = CST_CBS_IBS_LIST.find((c) => c.codigo === cst);
      const classTribInfo = obterClassificacaoTributariaUniversal(cClassTrib, cst);

      let fatorReducao = classTribInfo ? classTribInfo.fatorReducao : (cstInfo ? cstInfo.fatorReducao : 1.0);
      if (cst === '200') {
        fatorReducao = 0.40;
      } else if (cst === '210') {
        fatorReducao = 0.70;
      } else if (cst === '220' || cst === '400' || cst === '410' || cst === '510' || cst === '550' || cst === '700' || cst === '850') {
        fatorReducao = 0.0;
      } else if (cst === '800') {
        fatorReducao = 0.50;
      }

      const pCBS = Number((timeline.cbsAliquotaPadrao * fatorReducao).toFixed(2));
      const pIBSUF = Number((timeline.ibsUfAliquotaPadrao * fatorReducao).toFixed(2));
      const pIBSMun = Number((timeline.ibsMunAliquotaPadrao * fatorReducao).toFixed(2));

      const vCBS = Number(((vBCIBSCBS * pCBS) / 100).toFixed(2));
      const vIBSUF = Number(((vBCIBSCBS * pIBSUF) / 100).toFixed(2));
      const vIBSMun = Number(((vBCIBSCBS * pIBSMun) / 100).toFixed(2));
      const vIBS = Number((vIBSUF + vIBSMun).toFixed(2));

      totalCBS += vCBS;
      totalIBSUF += vIBSUF;
      totalIBSMun += vIBSMun;

      const baseLegalRegra = classTribInfo?.baseLegal || cstInfo?.baseLegal || 'LC 214/2025';
      const descRegra = classTribInfo?.nome || cstInfo?.nome || `CST ${cst}`;

      // Suporte a tributação regular de referência (especialmente para CST 550 com suspensão)
      let tributacaoRegularObj: any = undefined;
      if (item.tributacaoRegular) {
        const regCst = item.tributacaoRegular.cst || '000';
        const regClassTrib = item.tributacaoRegular.cClassTrib || `${regCst}001`;
        const regClassInfo = obterClassificacaoTributariaUniversal(regClassTrib, regCst);
        const regFator = regClassInfo.fatorReducao;
        const regPCBS = Number((timeline.cbsAliquotaPadrao * regFator).toFixed(2));
        const regPIBSUF = Number((timeline.ibsUfAliquotaPadrao * regFator).toFixed(2));
        const regPIBSMun = Number((timeline.ibsMunAliquotaPadrao * regFator).toFixed(2));
        const regVCBS = Number(((vBCIBSCBS * regPCBS) / 100).toFixed(2));
        const regVIBSUF = Number(((vBCIBSCBS * regPIBSUF) / 100).toFixed(2));
        const regVIBSMun = Number(((vBCIBSCBS * regPIBSMun) / 100).toFixed(2));
        const regVIBS = Number((regVIBSUF + regVIBSMun).toFixed(2));

        tributacaoRegularObj = {
          CST: regCst,
          cClassTrib: regClassTrib,
          nome: regClassInfo.nome,
          baseLegal: regClassInfo.baseLegal,
          pCBS: regPCBS.toFixed(2),
          vCBS: regVCBS.toFixed(2),
          pIBSUF: regPIBSUF.toFixed(2),
          vIBSUF: regVIBSUF.toFixed(2),
          pIBSMun: regPIBSMun.toFixed(2),
          vIBSMun: regVIBSMun.toFixed(2),
          vIBS: regVIBS.toFixed(2),
          vTotalTributosReferencia: (regVCBS + regVIBS).toFixed(2),
          memoriaCalculo: `Tributação regular de referência sob ${regClassInfo.nome} (${regClassInfo.baseLegal}): CBS ${regPCBS.toFixed(2)}% (R$ ${regVCBS.toFixed(2)}) e IBS ${(regPIBSUF + regPIBSMun).toFixed(2)}% (R$ ${regVIBS.toFixed(2)}).`,
        };
      }

      const tribCalc: any = {
        IBSCBS: {
          CST: cst,
          cClassTrib: cClassTrib,
          gIBSCBS: {
            vBC: vBCIBSCBS.toFixed(2),
            gIBSUF: {
              pIBSUF: pIBSUF.toFixed(2),
              vIBSUF: vIBSUF.toFixed(2),
              memoriaCalculo: `Operação com enquadramento em ${descRegra} (${baseLegalRegra}). Base de cálculo: R$ ${vBCIBSCBS.toFixed(2)}, alíquota IBS Estadual: ${pIBSUF.toFixed(2)}%. Valor: R$ ${vIBSUF.toFixed(2)}.`,
            },
            gIBSMun: {
              pIBSMun: pIBSMun.toFixed(2),
              vIBSMun: vIBSMun.toFixed(2),
              memoriaCalculo: `Operação com enquadramento em ${descRegra} (${baseLegalRegra}). Base de cálculo: R$ ${vBCIBSCBS.toFixed(2)}, alíquota IBS Municipal: ${pIBSMun.toFixed(2)}%. Valor: R$ ${vIBSMun.toFixed(2)}.`,
            },
            vIBS: vIBS.toFixed(2),
            gCBS: {
              pCBS: pCBS.toFixed(2),
              vCBS: vCBS.toFixed(2),
              memoriaCalculo: `Operação com enquadramento em ${descRegra} (${baseLegalRegra}). Base de cálculo: R$ ${vBCIBSCBS.toFixed(2)}, alíquota CBS: ${pCBS.toFixed(2)}%. Valor: R$ ${vCBS.toFixed(2)}.`,
            },
            ...(tributacaoRegularObj ? { tributacaoRegular: tributacaoRegularObj } : {}),
          },
        },
      };

      if (isObj) {
        tribCalc.IS = isObj;
      }

      return {
        nObj,
        tribCalc,
      };
    });

    const totalIBS = Number((totalIBSUF + totalIBSMun).toFixed(2));

    const total: any = {
      tribCalc: {
        IBSCBSTot: {
          vBCIBSCBS: totalBC.toFixed(2),
          gIBS: {
            gIBSUF: { vDif: '0.00', vDevTrib: '0.00', vIBSUF: totalIBSUF.toFixed(2) },
            gIBSMun: { vDif: '0.00', vDevTrib: '0.00', vIBSMun: totalIBSMun.toFixed(2) },
            vIBS: totalIBS.toFixed(2),
            vCredPres: '0.00',
            vCredPresCondSus: '0.00',
          },
          gCBS: {
            vDif: '0.00',
            vDevTrib: '0.00',
            vCBS: totalCBS.toFixed(2),
            vCredPres: '0.00',
            vCredPresCondSus: '0.00',
          },
          gMono: {
            vIBSMono: '0.00',
            vCBSMono: '0.00',
            vIBSMonoReten: '0.00',
            vCBSMonoReten: '0.00',
            vIBSMonoRet: '0.00',
            vCBSMonoRet: '0.00',
          },
        },
      },
    };

    if (totalIS > 0) {
      total.tribCalc.ISTot = {
        vIS: totalIS.toFixed(2),
      };
    }

    return { objetos, total };
  }

  public gerarXmlDfeString(
    tipo: TipoDocumentoFiscal,
    cst: string,
    cClassTrib: string,
    baseCalculoIBSCBS: number,
    cbs: { aliquota: number; valor: number },
    ibsUF: { aliquota: number; valor: number },
    ibsMun: { aliquota: number; valor: number },
    ibsTotal: number,
    isData?: { cst: string; cClassTrib: string; base: number; pIS?: number; pISEspec?: number; uTrib?: string; qTrib?: number; vIS: number }
  ): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<tribDFe tipoDocumento="${tipo}" versaoNotaTecnica="1.30" xmlns="http://www.portalfiscal.inf.br/${tipo}">\n`;
    
    xml += `  <IBSCBS>\n`;
    xml += `    <CST>${cst || '000'}</CST>\n`;
    xml += `    <cClassTrib>${cClassTrib || '000001'}</cClassTrib>\n`;
    xml += `    <gIBSCBS>\n`;
    xml += `      <vBC>${baseCalculoIBSCBS.toFixed(2)}</vBC>\n`;
    xml += `      <gCBS>\n`;
    xml += `        <pCBS>${cbs.aliquota.toFixed(2)}</pCBS>\n`;
    xml += `        <vCBS>${cbs.valor.toFixed(2)}</vCBS>\n`;
    xml += `      </gCBS>\n`;
    xml += `      <gIBSUF>\n`;
    xml += `        <pIBSUF>${ibsUF.aliquota.toFixed(2)}</pIBSUF>\n`;
    xml += `        <vIBSUF>${ibsUF.valor.toFixed(2)}</vIBSUF>\n`;
    xml += `      </gIBSUF>\n`;
    xml += `      <gIBSMun>\n`;
    xml += `        <pIBSMun>${ibsMun.aliquota.toFixed(2)}</pIBSMun>\n`;
    xml += `        <vIBSMun>${ibsMun.valor.toFixed(2)}</vIBSMun>\n`;
    xml += `      </gIBSMun>\n`;
    xml += `      <vIBS>${ibsTotal.toFixed(2)}</vIBS>\n`;
    xml += `    </gIBSCBS>\n`;
    xml += `  </IBSCBS>\n`;

    if (isData && isData.vIS > 0) {
      xml += `  <IS>\n`;
      xml += `    <CSTIS>${isData.cst || '000'}</CSTIS>\n`;
      xml += `    <cClassTribIS>${isData.cClassTrib || '000001'}</cClassTribIS>\n`;
      xml += `    <vBCIS>${isData.base.toFixed(2)}</vBCIS>\n`;
      if (isData.pIS) xml += `    <pIS>${isData.pIS.toFixed(2)}</pIS>\n`;
      if (isData.pISEspec) xml += `    <pISEspec>${isData.pISEspec.toFixed(2)}</pISEspec>\n`;
      if (isData.uTrib) xml += `    <uTrib>${isData.uTrib}</uTrib>\n`;
      if (isData.qTrib) xml += `    <qTrib>${isData.qTrib}</qTrib>\n`;
      xml += `    <vIS>${isData.vIS.toFixed(2)}</vIS>\n`;
      xml += `  </IS>\n`;
    }

    xml += `</tribDFe>`;
    return xml;
  }

  public processarCalculoSimplificado(input: SimplifiedTaxInput, officialResponse?: any): SimplifiedTaxOutput {
    const tipoDoc: TipoDocumentoFiscal = input.tipoDocumento || (input.nbs ? 'nfse' : 'nfe');
    const docMeta = this.getDocumentMetadata(tipoDoc);

    const dataFato = input.data || new Date().toISOString().split('T')[0];
    const dataFatoISO = dataFato.includes('T') ? dataFato : `${dataFato}T12:00:00-03:00`;
    const ano = new Date(dataFatoISO).getFullYear() || 2026;
    const timeline = this.getTimelineForYear(ano);

    // 1. Composição detalhada da Base de Cálculo por modelo de documento fiscal
    const valorBruto = Number(input.valor || 0);
    const frete = Number(input.valorFrete || 0);
    const seguro = Number(input.valorSeguro || 0);
    const despesas = Number(input.outrasDespesas || 0);
    const taxaEmb = Number(input.taxaEmbarque || 0);
    const desconto = Number(input.valorDesconto || 0);
    const deducoesMat = Number(input.deducaoMateriais || 0);

    // Base líquida operacional antes do IS
    let baseLiquida = valorBruto + frete + seguro + despesas + taxaEmb - desconto - deducoesMat;
    if (baseLiquida < 0) baseLiquida = 0;

    const ncmClean = input.ncm ? input.ncm.replace(/\D/g, '') : undefined;
    const ncmInfo = ncmClean ? NCM_IS_DATABASE[ncmClean] : null;

    let resGov = officialResponse;
    let modoExecucao: 'oficial_governo' | 'motor_local_lc214' = 'oficial_governo';

    if (!resGov) {
      modoExecucao = 'motor_local_lc214';
      const mockPayload = {
        id: `easyapi-${Date.now()}`,
        versao: '0.0.1',
        dhFatoGerador: dataFatoISO,
        uf: input.ufDestino || 'SP',
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
            ...(ncmInfo
              ? {
                  impostoSeletivo: {
                    cst: '000',
                    cClassTrib: '000001',
                    baseCalculo: baseLiquida,
                    quantidade: input.quantidade || 1,
                    unidade: ncmInfo.unidade || 'UN',
                    impostoInformado: 0.0,
                  },
                }
              : {}),
          },
        ],
      };
      resGov = this.calcularLocal(mockPayload);
    }

    const primeiroObj = resGov.objetos?.[0]?.tribCalc;
    const isData = primeiroObj?.IS;
    const ibsCbsData = primeiroObj?.IBSCBS?.gIBSCBS;

    const valorIS = isData ? parseFloat(isData.vIS) : 0;
    const baseCalculoIBSCBS = ibsCbsData ? parseFloat(ibsCbsData.vBC) : Number((baseLiquida + valorIS).toFixed(2));
    const cstInformado = input.cst || '000';
    const cstObj = CST_CBS_IBS_LIST.find((c) => c.codigo === cstInformado);
    const cClassTribInformado = input.cClassTrib || cstObj?.cClassTribDefault || '000001';
    const classTribInfo = obterClassificacaoTributariaUniversal(cClassTribInformado, cstInformado);

    let fatorReducao = classTribInfo ? classTribInfo.fatorReducao : (cstObj ? cstObj.fatorReducao : 1.0);
    if (cstInformado === '200') {
      fatorReducao = 0.40;
    } else if (cstInformado === '210') {
      fatorReducao = 0.70;
    } else if (cstInformado === '220' || cstInformado === '400' || cstInformado === '410' || cstInformado === '510' || cstInformado === '550' || cstInformado === '700' || cstInformado === '850') {
      fatorReducao = 0.0;
    } else if (cstInformado === '800') {
      fatorReducao = 0.50;
    }

    let valorCBS = ibsCbsData?.gCBS ? parseFloat(ibsCbsData.gCBS.vCBS) : 0;
    let aliquotaCBS = ibsCbsData?.gCBS ? parseFloat(ibsCbsData.gCBS.pCBS) : timeline.cbsAliquotaPadrao;

    let valorIBSUF = ibsCbsData?.gIBSUF ? parseFloat(ibsCbsData.gIBSUF.vIBSUF) : 0;
    let aliquotaIBSUF = ibsCbsData?.gIBSUF ? parseFloat(ibsCbsData.gIBSUF.pIBSUF) : timeline.ibsUfAliquotaPadrao;

    let valorIBSMun = ibsCbsData?.gIBSMun ? parseFloat(ibsCbsData.gIBSMun.vIBSMun) : 0;
    let aliquotaIBSMun = ibsCbsData?.gIBSMun ? parseFloat(ibsCbsData.gIBSMun.pIBSMun) : timeline.ibsMunAliquotaPadrao;

    if (fatorReducao < 1.0 && modoExecucao === 'oficial_governo') {
      aliquotaCBS = parseFloat((aliquotaCBS * fatorReducao).toFixed(2));
      aliquotaIBSUF = parseFloat((aliquotaIBSUF * fatorReducao).toFixed(2));
      aliquotaIBSMun = parseFloat((aliquotaIBSMun * fatorReducao).toFixed(2));
      valorCBS = parseFloat(((baseCalculoIBSCBS * aliquotaCBS) / 100).toFixed(2));
      valorIBSUF = parseFloat(((baseCalculoIBSCBS * aliquotaIBSUF) / 100).toFixed(2));
      valorIBSMun = parseFloat(((baseCalculoIBSCBS * aliquotaIBSMun) / 100).toFixed(2));
    }

    const valorIBSTotal = parseFloat((valorIBSUF + valorIBSMun).toFixed(2));
    const aliquotaIBSTotal = parseFloat((aliquotaIBSUF + aliquotaIBSMun).toFixed(2));

    const totalTributos = parseFloat((valorIS + valorCBS + valorIBSTotal).toFixed(2));
    const aliquotaEfetivaTotal = baseLiquida > 0 ? parseFloat(((totalTributos / baseLiquida) * 100).toFixed(2)) : 0;
    const valorFinalTotal = parseFloat((baseLiquida + totalTributos).toFixed(2));

    // Comparativo Legado
    let icmsEstimado = 0;
    let issEstimado = 0;
    let pisEstimado = 0;
    let cofinsEstimado = 0;
    let ipiEstimado = 0;

    if (!timeline.extincaoIcmsIss) {
      if (tipoDoc === 'nfse' || input.nbs) {
        issEstimado = parseFloat((baseLiquida * 0.05).toFixed(2));
      } else if (tipoDoc === 'cte') {
        icmsEstimado = parseFloat((baseLiquida * 0.12).toFixed(2)); // ICMS frete 12%
      } else {
        icmsEstimado = parseFloat((baseLiquida * 0.18).toFixed(2)); // ICMS mercadoria 18%
      }
    }

    if (!timeline.extincaoPisCofins) {
      pisEstimado = parseFloat((baseLiquida * 0.0165).toFixed(2));
      cofinsEstimado = parseFloat((baseLiquida * 0.076).toFixed(2));
    }

    if (ncmInfo && tipoDoc === 'nfe') {
      ipiEstimado = parseFloat((baseLiquida * 0.15).toFixed(2));
    }

    const totalLegadoEstimado = parseFloat((icmsEstimado + issEstimado + pisEstimado + cofinsEstimado + ipiEstimado).toFixed(2));
    const aliquotaEfetivaLegado = baseLiquida > 0 ? parseFloat(((totalLegadoEstimado / baseLiquida) * 100).toFixed(2)) : 0;
    const diferencaValor = parseFloat((totalTributos - totalLegadoEstimado).toFixed(2));
    const impactoCarga = diferencaValor > 0.01 ? 'aumento' : diferencaValor < -0.01 ? 'reducao' : 'neutro';

    const regrasAplicadas: string[] = [
      `Documento Fiscal: ${docMeta.nome}`,
      `Fase da Reforma: ${timeline.fase} (${timeline.ano})`,
      `Situação Tributária: CST ${cstInformado} - ${cstObj?.nome || 'Operação Tributada'}`,
      `Classificação Tributária: cClassTrib ${cClassTribInformado} - ${classTribInfo?.nome || 'Padrão'} (${classTribInfo?.baseLegal || cstObj?.baseLegal || 'LC 214/2025'})`,
      `Alíquota CBS: ${aliquotaCBS}% (Padrão: ${timeline.cbsAliquotaPadrao}%) | IBS: ${aliquotaIBSTotal}% (Padrão: ${timeline.ibsTotalPadrao}%)`,
      'Base de Cálculo "Por Fora" (não incide tributo sobre tributo)',
    ];

    if (classTribInfo?.regrasOperacionais) {
      regrasAplicadas.push(`Regra Operacional: ${classTribInfo.regrasOperacionais}`);
    }

    if (fatorReducao < 1.0) {
      const percReducao = ((1.0 - fatorReducao) * 100).toFixed(0);
      regrasAplicadas.push(`Benefício Fiscal: Redução de ${percReducao}% na alíquota de CBS e IBS (${classTribInfo?.baseLegal || cstObj?.baseLegal || 'LC 214/2025'})`);
    }

    if (valorIS > 0) {
      regrasAplicadas.push('Imposto Seletivo integrado à Base de Cálculo da CBS e IBS conforme Art. 13 da LC 214/2025');
    }
    if (timeline.extincaoPisCofins) {
      regrasAplicadas.push('PIS e COFINS extintos integralmente');
    }
    if (timeline.extincaoIcmsIss) {
      regrasAplicadas.push('ICMS, ISS e IPI totalmente extintos (sistema 100% IVA Dual)');
    }

    // Gerar trecho XML DFe embutido na resposta da API
    const xmlGerado = this.gerarXmlDfeString(
      tipoDoc,
      primeiroObj?.IBSCBS?.CST || input.cst || '000',
      primeiroObj?.IBSCBS?.cClassTrib || input.cClassTrib || '000001',
      baseCalculoIBSCBS,
      { aliquota: aliquotaCBS, valor: valorCBS },
      { aliquota: aliquotaIBSUF, valor: valorIBSUF },
      { aliquota: aliquotaIBSMun, valor: valorIBSMun },
      valorIBSTotal,
      valorIS > 0
        ? {
            cst: isData?.CSTIS || '000',
            cClassTrib: isData?.cClassTribIS || '000001',
            base: baseLiquida,
            pIS: isData?.pIS ? parseFloat(isData.pIS) : ncmInfo?.aliquotaAdValorem,
            pISEspec: isData?.pISEspec ? parseFloat(isData.pISEspec) : ncmInfo?.aliquotaAdRem,
            uTrib: isData?.uTrib || ncmInfo?.unidade || 'UN',
            qTrib: input.quantidade || 1,
            vIS: valorIS,
          }
        : undefined
    );

    let memoriaBase = `Base Líquida: R$ ${valorBruto.toFixed(2)}`;
    if (frete > 0) memoriaBase += ` + Frete R$ ${frete.toFixed(2)}`;
    if (seguro > 0) memoriaBase += ` + Seguro R$ ${seguro.toFixed(2)}`;
    if (despesas > 0) memoriaBase += ` + Despesas R$ ${despesas.toFixed(2)}`;
    if (taxaEmb > 0) memoriaBase += ` + Tx. Embarque R$ ${taxaEmb.toFixed(2)}`;
    if (desconto > 0) memoriaBase += ` - Desconto R$ ${desconto.toFixed(2)}`;
    if (deducoesMat > 0) memoriaBase += ` - Materiais R$ ${deducoesMat.toFixed(2)}`;
    if (valorIS > 0) memoriaBase += ` + Imposto Seletivo R$ ${valorIS.toFixed(2)} (Art. 13 LC 214)`;
    memoriaBase += ` = Base Final R$ ${baseCalculoIBSCBS.toFixed(2)}.`;

    return {
      status: 'sucesso',
      modoExecucao,
      documentoFiscal: docMeta,
      composicaoBaseCalculo: {
        valorBruto,
        acrescimos: {
          frete,
          seguro,
          outrasDespesas: despesas,
          taxaEmbarque: taxaEmb,
        },
        deducoes: {
          descontoIncondicional: desconto,
          materiaisDeducoes: deducoesMat,
        },
        baseLiquidaOperacao: baseLiquida,
        impostoSeletivoIntegrado: valorIS,
        baseCalculoFinalIBSCBS: baseCalculoIBSCBS,
        memoriaBaseCalculo: memoriaBase,
      },
      resumo: {
        valorOperacao: baseLiquida,
        baseCalculoIS: baseLiquida,
        baseCalculoIBSCBS,
        valorImpostoSeletivo: valorIS,
        valorCBS,
        valorIBSEstadual: valorIBSUF,
        valorIBSMunicipal: valorIBSMun,
        valorIBSTotal,
        totalTributos,
        aliquotaEfetivaTotal,
        valorFinalTotal,
      },
      tributos: {
        ...(isData || valorIS > 0
          ? {
              impostoSeletivo: {
                incide: true,
                ncm: ncmClean,
                cst: isData?.CSTIS || '000',
                baseCalculo: baseLiquida,
                aliquotaAdValorem: isData?.pIS ? parseFloat(isData.pIS) : ncmInfo?.aliquotaAdValorem,
                aliquotaAdRem: isData?.pISEspec ? parseFloat(isData.pISEspec) : ncmInfo?.aliquotaAdRem,
                quantidade: input.quantidade || 1,
                unidade: isData?.uTrib || ncmInfo?.unidade || 'UN',
                valorTotal: valorIS,
                memoriaCalculo: isData?.memoriaCalculo || `Imposto Seletivo aplicado sobre NCM ${ncmClean}. Valor: R$ ${valorIS.toFixed(2)}.`,
              },
            }
          : {
              impostoSeletivo: {
                incide: false,
                cst: '200',
                baseCalculo: 0,
                valorTotal: 0,
                memoriaCalculo: 'Produto ou serviço não sujeito à incidência do Imposto Seletivo.',
              },
            }),
        cbs: {
          cst: primeiroObj?.IBSCBS?.CST || input.cst || '000',
          cClassTrib: primeiroObj?.IBSCBS?.cClassTrib || input.cClassTrib || '000001',
          baseCalculo: baseCalculoIBSCBS,
          aliquotaPercentual: aliquotaCBS,
          valorTotal: valorCBS,
          memoriaCalculo: ibsCbsData?.gCBS?.memoriaCalculo || `CBS calculada à alíquota de ${aliquotaCBS}% sobre R$ ${baseCalculoIBSCBS.toFixed(2)}.`,
        },
        ibsEstadual: {
          uf: input.ufDestino,
          cst: primeiroObj?.IBSCBS?.CST || input.cst || '000',
          cClassTrib: primeiroObj?.IBSCBS?.cClassTrib || input.cClassTrib || '000001',
          baseCalculo: baseCalculoIBSCBS,
          aliquotaPercentual: aliquotaIBSUF,
          valorTotal: valorIBSUF,
          memoriaCalculo: ibsCbsData?.gIBSUF?.memoriaCalculo || `IBS Estadual para ${input.ufDestino} à alíquota de ${aliquotaIBSUF}%.`,
        },
        ibsMunicipal: {
          codigoMunicipio: input.municipioDestino,
          cst: primeiroObj?.IBSCBS?.CST || input.cst || '000',
          cClassTrib: primeiroObj?.IBSCBS?.cClassTrib || input.cClassTrib || '000001',
          baseCalculo: baseCalculoIBSCBS,
          aliquotaPercentual: aliquotaIBSMun,
          valorTotal: valorIBSMun,
          memoriaCalculo: ibsCbsData?.gIBSMun?.memoriaCalculo || `IBS Municipal para código ${input.municipioDestino} à alíquota de ${aliquotaIBSMun}%.`,
        },
        ibsTotal: {
          aliquotaPercentual: aliquotaIBSTotal,
          valorTotal: valorIBSTotal,
        },
      },
      comparativoLegado: {
        estimativaICMSouISS: icmsEstimado || issEstimado,
        estimativaPIS: pisEstimado,
        estimativaCOFINS: cofinsEstimado,
        estimativaIPI: ipiEstimado,
        totalSistemaLegado: totalLegadoEstimado,
        aliquotaEfetivaLegado,
        diferencaValor,
        impactoCarga,
      },
      classificacaoTributaria: {
        codigo: cClassTribInformado,
        cst: cstInformado,
        nome: classTribInfo?.nome || cstObj?.nome || 'Operação Padrão',
        baseLegal: classTribInfo?.baseLegal || cstObj?.baseLegal || 'Art. 12 da LC 214/2025',
        fatorReducao,
        reducaoPercentual: classTribInfo?.reducaoPercentual ?? (cstObj?.reducaoPercentual ?? Math.round((1.0 - fatorReducao) * 100)),
        regrasOperacionais: classTribInfo?.regrasOperacionais || cstObj?.descricao || 'Tributação conforme LC 214/2025.',
      },
      regrasTributarias: {
        anoFatoGerador: ano,
        faseTransição: timeline.fase,
        baseLegal: 'Lei Complementar nº 214/2025 e Emenda Constitucional nº 132/2023',
        regrasAplicadas,
      },
      xmlGerado,
      respostaOficial: resGov,
    };
  }
}
