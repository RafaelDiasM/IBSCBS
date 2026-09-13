export interface TaxErrorTranslation {
  codigo: string;
  titulo: string;
  explicacao: string;
  comoCorrigir: string;
  exemploValido?: any;
}

export const ERROR_GLOSSARY: Record<string, TaxErrorTranslation> = {
  'IS-IMPOSTO-INFORMADO': {
    codigo: 'IS-001',
    titulo: 'Campo impostoInformado ausente no Imposto Seletivo',
    explicacao: 'A API oficial da Receita exige que o campo "impostoInformado" esteja presente no objeto "impostoSeletivo", mesmo que com valor 0.0, para conferência de cálculo.',
    comoCorrigir: 'Adicione "impostoInformado": 0.0 dentro do objeto impostoSeletivo do item.',
    exemploValido: {
      impostoSeletivo: {
        cst: '000',
        cClassTrib: '000001',
        baseCalculo: 1000.0,
        quantidade: 1,
        unidade: 'VN',
        impostoInformado: 0.0,
      },
    },
  },
  'IS-UNIDADE-ADREM': {
    codigo: 'IS-002',
    titulo: 'Unidade de medida obrigatória para alíquota ad rem do Imposto Seletivo',
    explicacao: 'Produtos sujeitos a Imposto Seletivo com alíquota fixa por unidade física (ad rem), como cigarros e bebidas, exigem a unidade de medida especificada (ex: VN para cigarros, LT para litros).',
    comoCorrigir: 'Informe o campo "unidade" (ex: "VN" ou "LT") tanto no item quanto no objeto impostoSeletivo.',
    exemploValido: { unidade: 'VN' },
  },
  'PIS-COFINS-TRANSICAO': {
    codigo: 'CAL-010',
    titulo: 'Campos PIS e COFINS não permitidos a partir de 2027',
    explicacao: 'Pela EC 132/2023 e LC 214/2025, o PIS e a COFINS são extintos a partir de 01/01/2027. Informar esses campos em fatos geradores de 2027 em diante resulta em erro de validação.',
    comoCorrigir: 'Remova os campos de PIS e COFINS para operações ocorridas a partir de 2027.',
  },
  'ICMS-ISS-TRANSICAO': {
    codigo: 'CAL-020',
    titulo: 'Campos ICMS e ISS não permitidos a partir de 2033',
    explicacao: 'Em 2033 o período de transição se encerra e o ICMS e ISS deixam de existir no ordenamento jurídico.',
    comoCorrigir: 'Não envie bases de ICMS/ISS para fatos geradores a partir de 2033.',
  },
  'REG-001': {
    codigo: 'REG-001',
    titulo: 'UF ou Município de destino inválido',
    explicacao: 'O código do município IBGE informado não pertence à UF indicada ou é inexistente.',
    comoCorrigir: 'Verifique a sigla da UF (2 caracteres) e o código IBGE de 7 dígitos do município (ex: 3550308 para São Paulo/SP).',
  },
  'VAL-001': {
    codigo: 'VAL-001',
    titulo: 'Data do fato gerador inválida ou fora do período',
    explicacao: 'A data do fato gerador deve estar no formato ISO 8601 (yyyy-MM-dd ou yyyy-MM-ddTHH:mm:ssZ) e ser superior a 2026-01-01.',
    comoCorrigir: 'Envie dhFatoGerador no formato "2026-06-01T12:00:00-03:00" ou "2026-06-01".',
  },
};

export class ErrorTranslatorService {
  public static translate(rawError: any): TaxErrorTranslation {
    const detail = typeof rawError === 'string' ? rawError : rawError?.detail || rawError?.message || '';

    if (detail.includes('impostoInformado')) {
      return ERROR_GLOSSARY['IS-IMPOSTO-INFORMADO'];
    }
    if (detail.includes('unidade de medida') || detail.includes('ad rem')) {
      return ERROR_GLOSSARY['IS-UNIDADE-ADREM'];
    }
    if (detail.includes('PIS') || detail.includes('COFINS')) {
      return ERROR_GLOSSARY['PIS-COFINS-TRANSICAO'];
    }
    if (detail.includes('ICMS') || detail.includes('ISS')) {
      return ERROR_GLOSSARY['ICMS-ISS-TRANSICAO'];
    }

    return {
      codigo: rawError?.title || 'ERR-GENERICO',
      titulo: rawError?.title || 'Erro na validação fiscal',
      explicacao: detail || 'Verifique se os dados da operação estão em conformidade com o schema do ROC (LC 214/2025).',
      comoCorrigir: 'Consulte o schema do endpoint ou utilize o endpoint simplificado POST /api/v1/calcular da EasyAPI.',
    };
  }

  public static getFullGlossary(): TaxErrorTranslation[] {
    return Object.values(ERROR_GLOSSARY);
  }
}
