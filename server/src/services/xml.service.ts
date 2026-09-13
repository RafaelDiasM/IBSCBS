/**
 * Serviço Especializado para Geração, Validação e Injeção de Grupos XML da RTC (Reforma Tributária do Consumo)
 * Compatível com a Nota Técnica v1.30, NT 2024.002 e o Guia Oficial de Integração ERP do Governo Federal.
 */

export class XmlService {
  private static instance: XmlService;

  private constructor() {}

  public static getInstance(): XmlService {
    if (!XmlService.instance) {
      XmlService.instance = new XmlService();
    }
    return XmlService.instance;
  }

  /**
   * Gera os grupos XML da RTC (<IBSCBS>, <IS>, <IBSCBSTot>, <ISTot>)
   * a partir dos dados do cálculo tributário.
   */
  public gerarXmlGruposRtc(data: any, tipo: string = 'nfe'): string {
    const docTipo = (tipo || 'nfe').toLowerCase();
    const objeto = data?.resultado?.objetos?.[0] || data?.objetos?.[0] || data?.itens?.[0] || data;
    const tribCalc = objeto?.tribCalc || objeto;
    const ibsCbsData = tribCalc?.IBSCBS?.gIBSCBS || tribCalc?.IBSCBS || data?.ibsCbs;
    const isData = tribCalc?.IS || data?.is;

    const valorBC = Number(ibsCbsData?.vBC || data?.baseCalculo || data?.valor || 1000.0).toFixed(2);
    const cst = String(tribCalc?.IBSCBS?.CST || data?.cst || '000');
    const cClassTrib = String(tribCalc?.IBSCBS?.cClassTrib || data?.cClassTrib || '000001');

    const pCBS = Number(ibsCbsData?.gCBS?.pCBS || data?.aliquotaCBS || 8.4).toFixed(2);
    const vCBS = Number(ibsCbsData?.gCBS?.vCBS || data?.valorCBS || (Number(valorBC) * Number(pCBS)) / 100).toFixed(2);

    const pIBSUF = Number(ibsCbsData?.gIBSUF?.pIBSUF || data?.aliquotaIBSUF || 0.1).toFixed(2);
    const vIBSUF = Number(ibsCbsData?.gIBSUF?.vIBSUF || data?.valorIBSUF || (Number(valorBC) * Number(pIBSUF)) / 100).toFixed(2);

    const pIBSMun = Number(ibsCbsData?.gIBSMun?.pIBSMun || data?.aliquotaIBSMun || 0.0).toFixed(2);
    const vIBSMun = Number(ibsCbsData?.gIBSMun?.vIBSMun || data?.valorIBSMun || (Number(valorBC) * Number(pIBSMun)) / 100).toFixed(2);

    const vIBS = Number(ibsCbsData?.vIBS || Number(vIBSUF) + Number(vIBSMun)).toFixed(2);

    const hasIS = Boolean(isData || data?.valorIS > 0);
    const vBCIS = Number(isData?.vBCIS || data?.baseCalculoIS || valorBC).toFixed(2);
    const pIS = Number(isData?.pIS || data?.aliquotaIS || 13.0).toFixed(2);
    const vIS = hasIS ? Number(isData?.vIS || data?.valorIS || (Number(vBCIS) * Number(pIS)) / 100).toFixed(2) : '0.00';
    const cstIS = String(isData?.CSTIS || data?.cstIS || '000');
    const cClassTribIS = String(isData?.cClassTribIS || data?.cClassTribIS || '000001');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<gruposRTC tipo="${docTipo}" versao="1.30" xmlns="http://www.portalfiscal.inf.br/nfe">\n`;

    // Grupo de Item: <imposto>
    xml += `  <!-- Grupo a ser inserido dentro de <det>/<imposto> -->\n`;
    xml += `  <IBSCBS>\n`;
    xml += `    <CST>${cst}</CST>\n`;
    xml += `    <cClassTrib>${cClassTrib}</cClassTrib>\n`;
    xml += `    <gIBSCBS>\n`;
    xml += `      <vBC>${valorBC}</vBC>\n`;
    xml += `      <gCBS>\n`;
    xml += `        <pCBS>${pCBS}</pCBS>\n`;
    xml += `        <vCBS>${vCBS}</vCBS>\n`;
    xml += `      </gCBS>\n`;
    xml += `      <gIBSUF>\n`;
    xml += `        <pIBSUF>${pIBSUF}</pIBSUF>\n`;
    xml += `        <vIBSUF>${vIBSUF}</vIBSUF>\n`;
    xml += `      </gIBSUF>\n`;
    if (Number(pIBSMun) > 0) {
      xml += `      <gIBSMun>\n`;
      xml += `        <pIBSMun>${pIBSMun}</pIBSMun>\n`;
      xml += `        <vIBSMun>${vIBSMun}</vIBSMun>\n`;
      xml += `      </gIBSMun>\n`;
    }
    xml += `      <vIBS>${vIBS}</vIBS>\n`;
    xml += `    </gIBSCBS>\n`;
    xml += `  </IBSCBS>\n`;

    if (hasIS) {
      xml += `  <IS>\n`;
      xml += `    <CSTIS>${cstIS}</CSTIS>\n`;
      xml += `    <cClassTribIS>${cClassTribIS}</cClassTribIS>\n`;
      xml += `    <vBCIS>${vBCIS}</vBCIS>\n`;
      xml += `    <pIS>${pIS}</pIS>\n`;
      xml += `    <vIS>${vIS}</vIS>\n`;
      xml += `  </IS>\n`;
    }

    // Grupo de Totais: <total>
    xml += `  <!-- Grupo a ser inserido dentro de <total> -->\n`;
    xml += `  <total>\n`;
    xml += `    <IBSCBSTot>\n`;
    xml += `      <vBCIBSCBS>${valorBC}</vBCIBSCBS>\n`;
    xml += `      <vCBS>${vCBS}</vCBS>\n`;
    xml += `      <vIBS>${vIBS}</vIBS>\n`;
    xml += `      <vIBSUF>${vIBSUF}</vIBSUF>\n`;
    xml += `      <vIBSMun>${vIBSMun}</vIBSMun>\n`;
    xml += `    </IBSCBSTot>\n`;
    if (hasIS) {
      xml += `    <ISTot>\n`;
      xml += `      <vBCIS>${vBCIS}</vBCIS>\n`;
      xml += `      <vIS>${vIS}</vIS>\n`;
      xml += `    </ISTot>\n`;
    }
    xml += `  </total>\n`;
    xml += `</gruposRTC>`;

    return xml;
  }

  /**
   * Valida a estrutura de tags da Reforma Tributária no XML
   */
  public validarXmlRtc(xmlContent: string, tipo: string = 'nfe', subtipo: string = 'grupo'): { valido: boolean; tagsVerificadas: string[]; mensagem: string } {
    const tagsEncontradas: string[] = [];
    if (xmlContent.includes('<IBSCBS>') || xmlContent.includes('IBSCBS')) tagsEncontradas.push('IBSCBS');
    if (xmlContent.includes('<gCBS>') || xmlContent.includes('pCBS') || xmlContent.includes('vCBS')) tagsEncontradas.push('gCBS');
    if (xmlContent.includes('<gIBSUF>') || xmlContent.includes('pIBSUF') || xmlContent.includes('vIBSUF')) tagsEncontradas.push('gIBSUF');
    if (xmlContent.includes('<vBC>') || xmlContent.includes('vBCIBSCBS')) tagsEncontradas.push('vBC');
    if (xmlContent.includes('<IS>') || xmlContent.includes('vIS')) tagsEncontradas.push('IS');
    if (xmlContent.includes('<IBSCBSTot>')) tagsEncontradas.push('IBSCBSTot');

    const valido = tagsEncontradas.length >= 2;
    return {
      valido,
      tagsVerificadas: tagsEncontradas,
      mensagem: valido
        ? `XML estruturalmente válido para ${tipo.toUpperCase()} (${subtipo}) conforme Nota Técnica v1.30 da RTC`
        : 'Estrutura XML não contém os grupos mínimos obrigatórios de IBS/CBS',
    };
  }

  /**
   * Passo 4 do Guia ERP: Injeta os blocos da RTC diretamente no XML da NF-e original.
   * Insere <IS> e <IBSCBS> dentro de <imposto> e <ISTot> e <IBSCBSTot> dentro de <total>.
   */
  public injetarRtcNaXmlNfe(xmlNfeOriginal: string, xmlRtcOuCalculo: string | any): { sucesso: boolean; xmlNfeComRtc: string; erro?: string } {
    try {
      let targetContent = xmlNfeOriginal.trim();
      let rtcXml = typeof xmlRtcOuCalculo === 'string' ? xmlRtcOuCalculo : this.gerarXmlGruposRtc(xmlRtcOuCalculo);

      // Detecta indentação do XML da NFe
      const impostoMatch = targetContent.match(/^(\s*)<imposto>/m);
      const totalMatch = targetContent.match(/^(\s*)<total>/m);

      if (!impostoMatch) {
        return { sucesso: false, xmlNfeComRtc: xmlNfeOriginal, erro: 'Tag <imposto> não encontrada no XML da NF-e informada.' };
      }

      const impostoIndentSpaces = impostoMatch[1].length + 2;
      const totalIndentSpaces = totalMatch ? totalMatch[1].length + 2 : 6;

      const impostoIndent = ' '.repeat(impostoIndentSpaces);
      const totalIndent = ' '.repeat(totalIndentSpaces);

      // Extrai trecho <IBSCBS>
      const ibscbsMatch = rtcXml.match(/<IBSCBS>[\s\S]*?<\/IBSCBS>/);
      // Extrai trecho <IS>
      const isMatch = rtcXml.match(/<IS>[\s\S]*?<\/IS>/);
      // Extrai trecho <IBSCBSTot>
      const ibscbsTotMatch = rtcXml.match(/<IBSCBSTot>[\s\S]*?<\/IBSCBSTot>/);
      // Extrai trecho <ISTot>
      const isTotMatch = rtcXml.match(/<ISTot>[\s\S]*?<\/ISTot>/);

      const blocosItem: string[] = [];
      if (ibscbsMatch) {
        blocosItem.push(this.reindentarBlocoXml(ibscbsMatch[0], impostoIndent));
      }
      if (isMatch) {
        blocosItem.push(this.reindentarBlocoXml(isMatch[0], impostoIndent));
      }

      // 1. Injeta os blocos no final de <imposto> (antes de </imposto>)
      if (blocosItem.length > 0) {
        const itemInjecao = '\n' + blocosItem.join('\n') + '\n' + ' '.repeat(impostoMatch[1].length);
        targetContent = targetContent.replace(/(\s*)(<\/imposto>)/, `${itemInjecao}$2`);
      }

      // 2. Injeta os blocos de totais no final de <total>
      const blocosTotal: string[] = [];
      if (ibscbsTotMatch) {
        blocosTotal.push(this.reindentarBlocoXml(ibscbsTotMatch[0], totalIndent));
      }
      if (isTotMatch) {
        blocosTotal.push(this.reindentarBlocoXml(isTotMatch[0], totalIndent));
      }

      if (blocosTotal.length > 0 && targetContent.includes('<total>')) {
        const totalInjecao = '\n' + blocosTotal.join('\n') + '\n' + ' '.repeat(totalMatch ? totalMatch[1].length : 4);
        if (targetContent.includes('</total>')) {
          targetContent = targetContent.replace(/(\s*)(<\/total>)/, `${totalInjecao}$2`);
        }
      }

      return {
        sucesso: true,
        xmlNfeComRtc: targetContent,
      };
    } catch (err: any) {
      return {
        sucesso: false,
        xmlNfeComRtc: xmlNfeOriginal,
        erro: err?.message || 'Falha ao processar e injetar RTC no XML',
      };
    }
  }

  private reindentarBlocoXml(blocoXml: string, indentacaoBase: string): string {
    const linhas = blocoXml.split('\n').filter((l) => l.trim().length > 0);
    return linhas.map((l) => `${indentacaoBase}${l.trim()}`).join('\n');
  }

  /**
   * Fornece um XML de exemplo real de NF-e sem RTC para testes instantâneos
   */
  public getExemploNfeSemRtc(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe35240912345678000195550010000012341234567890" versao="4.00">
    <ide>
      <cUF>35</cUF>
      <cNF>12345678</cNF>
      <natOp>VENDA DE MERCADORIAS</natOp>
      <mod>55</mod>
      <serie>1</serie>
      <nNF>1234</nNF>
      <dhEmi>2027-01-10T14:30:00-03:00</dhEmi>
      <tpNF>1</tpNF>
      <idDest>1</idDest>
      <cMunFG>3550308</cMunFG>
      <tpImp>1</tpImp>
      <tpEmis>1</tpEmis>
      <cDV>0</cDV>
      <tpAmb>2</tpAmb>
      <finNFe>1</finNFe>
      <indFinal>1</indFinal>
      <indPres>1</indPres>
      <procEmi>0</procEmi>
      <verProc>1.0.0</verProc>
    </ide>
    <emit>
      <CNPJ>12345678000195</CNPJ>
      <xNome>EMPRESA MODELO DISTRIBUIDORA LTDA</xNome>
      <xFant>MODELO ERP</xFant>
      <enderEmit>
        <xLgr>AVENIDA PAULISTA</xLgr>
        <nro>1000</nro>
        <xBairro>BELA VISTA</xBairro>
        <cMun>3550308</cMun>
        <xMun>SAO PAULO</xMun>
        <UF>SP</UF>
        <CEP>01310100</CEP>
      </enderEmit>
      <IE>123456789111</IE>
      <CRT>3</CRT>
    </emit>
    <dest>
      <CNPJ>98765432000188</CNPJ>
      <xNome>COMERCIO VAREJISTA CENTRAL LTDA</xNome>
      <enderDest>
        <xLgr>RUA DAS FLORES</xLgr>
        <nro>500</nro>
        <xBairro>CENTRO</xBairro>
        <cMun>3550308</cMun>
        <xMun>SAO PAULO</xMun>
        <UF>SP</UF>
        <CEP>01001000</CEP>
      </enderDest>
      <indIEDest>1</indIEDest>
      <IE>987654321000</IE>
    </dest>
    <det nItem="1">
      <prod>
        <cProd>PROD-001</cProd>
        <cEAN>SEM GTIN</cEAN>
        <xProd>PRODUTO EXEMPLO PARA REFORMA TRIBUTARIA</xProd>
        <NCM>24021000</NCM>
        <CFOP>5102</CFOP>
        <uCom>UN</uCom>
        <qCom>10.0000</qCom>
        <vUnCom>100.0000</vUnCom>
        <vProd>1000.00</vProd>
        <cEANTrib>SEM GTIN</cEANTrib>
        <uTrib>UN</uTrib>
        <qTrib>10.0000</qTrib>
        <vUnTrib>100.0000</vUnTrib>
        <indTot>1</indTot>
      </prod>
      <imposto>
        <vTotTrib>0.00</vTotTrib>
        <ICMS>
          <ICMS00>
            <orig>0</orig>
            <CST>00</CST>
            <modBC>3</modBC>
            <vBC>1000.00</vBC>
            <pICMS>18.00</pICMS>
            <vICMS>180.00</vICMS>
          </ICMS00>
        </ICMS>
        <PIS>
          <PISAliq>
            <CST>01</CST>
            <vBC>1000.00</vBC>
            <pPIS>1.65</pPIS>
            <vPIS>16.50</vPIS>
          </PISAliq>
        </PIS>
        <COFINS>
          <COFINSAliq>
            <CST>01</CST>
            <vBC>1000.00</vBC>
            <pCOFINS>7.60</pCOFINS>
            <vCOFINS>76.00</vCOFINS>
          </COFINSAliq>
        </COFINS>
      </imposto>
    </det>
    <total>
      <ICMSTot>
        <vBC>1000.00</vBC>
        <vICMS>180.00</vICMS>
        <vICMSDeson>0.00</vICMSDeson>
        <vFCP>0.00</vFCP>
        <vBCST>0.00</vBCST>
        <vST>0.00</vST>
        <vFCPST>0.00</vFCPST>
        <vFCPSTRet>0.00</vFCPSTRet>
        <vProd>1000.00</vProd>
        <vFrete>0.00</vFrete>
        <vSeg>0.00</vSeg>
        <vDesc>0.00</vDesc>
        <vII>0.00</vII>
        <vIPI>0.00</vIPI>
        <vIPIDevol>0.00</vIPIDevol>
        <vPIS>16.50</vPIS>
        <vCOFINS>76.00</vCOFINS>
        <vOutro>0.00</vOutro>
        <vNF>1000.00</vNF>
      </ICMSTot>
    </total>
    <transp>
      <modFrete>9</modFrete>
    </transp>
    <pag>
      <detPag>
        <tPag>01</tPag>
        <vPag>1000.00</vPag>
      </detPag>
    </pag>
  </infNFe>
</NFe>`;
  }
}
