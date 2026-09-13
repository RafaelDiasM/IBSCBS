/**
 * Catálogo Amplo de NCMs (Nomenclatura Comum do Mercosul)
 * Inclui NCMs sujeitos a Imposto Seletivo (Sin Tax - Art. 393 a 411 da LC 214/2025),
 * Cesta Básica Nacional (Alíquota Zero), Medicamentos, Agropecuária, Tecnologia e Indústria Geral.
 */

export interface NcmItem {
  codigo: string;
  descricao: string;
  tributadoPeloImpostoSeletivo: boolean;
  aliquotaAdValorem?: number;
  aliquotaAdRem?: number;
  unidade?: string;
  cstSugerido: string;
  cClassTribSugerido: string;
  categoria: string;
  reducaoPercentual?: number;
}

export const NCM_IS_DATABASE: Record<
  string,
  { descricao: string; aliquotaAdValorem: number; aliquotaAdRem?: number; unidade?: string; cstSugerido?: string; cClassTribSugerido?: string; categoria?: string }
> = {
  // Tabaco e Derivados (Art. 394 da LC 214/2025)
  '24021000': { descricao: 'Charutos e cigarrilhas contendo tabaco', aliquotaAdValorem: 13.0, aliquotaAdRem: 21.30, unidade: 'VN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Tabacaria / IS' },
  '24022000': { descricao: 'Cigarros contendo tabaco', aliquotaAdValorem: 13.0, aliquotaAdRem: 25.00, unidade: 'VN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Tabacaria / IS' },
  '24029000': { descricao: 'Outros cigarros e charutos (eletrônicos, pods e sucedâneos)', aliquotaAdValorem: 13.0, aliquotaAdRem: 25.00, unidade: 'VN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Tabacaria / IS' },
  '24031900': { descricao: 'Fumo para cachimbo e tabaco desfiado para enrolar', aliquotaAdValorem: 13.0, aliquotaAdRem: 18.00, unidade: 'KG', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Tabacaria / IS' },
  '24041200': { descricao: 'Dispositivos eletrônicos para fumar com nicotina (Vapes)', aliquotaAdValorem: 15.0, aliquotaAdRem: 30.00, unidade: 'VN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Tabacaria / IS' },

  // Bebidas Alcoólicas (Art. 396 da LC 214/2025)
  '22030000': { descricao: 'Cervejas de malte', aliquotaAdValorem: 10.0, aliquotaAdRem: 0.85, unidade: 'LT', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Bebidas Alcoólicas / IS' },
  '22041010': { descricao: 'Vinhos espumantes e champanhes tipo Champagne', aliquotaAdValorem: 15.0, aliquotaAdRem: 2.80, unidade: 'LT', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Bebidas Alcoólicas / IS' },
  '22042100': { descricao: 'Vinhos de mesa finos e comuns em recipientes <= 2L', aliquotaAdValorem: 12.0, aliquotaAdRem: 1.90, unidade: 'LT', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Bebidas Alcoólicas / IS' },
  '22083000': { descricao: 'Uísques (Whisky)', aliquotaAdValorem: 25.0, aliquotaAdRem: 5.20, unidade: 'LT', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Bebidas Alcoólicas / IS' },
  '22084000': { descricao: 'Cachaça e aguardente de cana', aliquotaAdValorem: 18.0, aliquotaAdRem: 2.10, unidade: 'LT', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Bebidas Alcoólicas / IS' },
  '22082000': { descricao: 'Aguardentes de vinho ou de bagaço de uvas (Conhaque / Brandy)', aliquotaAdValorem: 20.0, aliquotaAdRem: 3.50, unidade: 'LT', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Bebidas Alcoólicas / IS' },
  '22086000': { descricao: 'Vodca', aliquotaAdValorem: 20.0, aliquotaAdRem: 3.80, unidade: 'LT', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Bebidas Alcoólicas / IS' },
  '22087000': { descricao: 'Licores e bebidas espirituosas aromatizadas', aliquotaAdValorem: 18.0, aliquotaAdRem: 2.50, unidade: 'LT', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Bebidas Alcoólicas / IS' },
  '22085000': { descricao: 'Gim (Gin) e Genebra', aliquotaAdValorem: 20.0, aliquotaAdRem: 3.20, unidade: 'LT', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Bebidas Alcoólicas / IS' },
  '22089000': { descricao: 'Outras bebidas alcoólicas destiladas (Tequila, Rum, etc.)', aliquotaAdValorem: 20.0, aliquotaAdRem: 3.00, unidade: 'LT', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Bebidas Alcoólicas / IS' },

  // Bebidas Açucaradas (Art. 398 da LC 214/2025)
  '22021000': { descricao: 'Águas e refrigerantes com adição de açúcar ou edulcorantes', aliquotaAdValorem: 6.0, aliquotaAdRem: 0.35, unidade: 'LT', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Bebidas Açucaradas / IS' },
  '22029900': { descricao: 'Bebidas energéticas, isotônicos e compostos líquidos açucarados', aliquotaAdValorem: 6.0, aliquotaAdRem: 0.40, unidade: 'LT', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Bebidas Açucaradas / IS' },
  '22029000': { descricao: 'Néctares e preparados líquidos com aditivos açucarados', aliquotaAdValorem: 4.0, aliquotaAdRem: 0.25, unidade: 'LT', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Bebidas Açucaradas / IS' },

  // Veículos Automotores e Embarcações (Art. 400 da LC 214/2025)
  '87032100': { descricao: 'Automóveis de passageiros até 1000cc (veículos populares a combustão)', aliquotaAdValorem: 4.5, unidade: 'UN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Veículos / IS' },
  '87032210': { descricao: 'Automóveis de passageiros de 1000cc a 1500cc', aliquotaAdValorem: 6.5, unidade: 'UN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Veículos / IS' },
  '87032310': { descricao: 'Automóveis de passageiros a combustão (>1500cc a 3000cc)', aliquotaAdValorem: 8.5, unidade: 'UN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Veículos / IS' },
  '87032410': { descricao: 'Automóveis de luxo de alta cilindrada (>3000cc)', aliquotaAdValorem: 12.0, unidade: 'UN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Veículos / IS' },
  '87034000': { descricao: 'Veículos híbridos (gasolina/álcool e motor elétrico)', aliquotaAdValorem: 3.5, unidade: 'UN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Veículos / IS' },
  '87038000': { descricao: 'Veículos exclusivamente elétricos (IS mínimo de incentivo verde)', aliquotaAdValorem: 1.0, unidade: 'UN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Veículos / IS' },
  '87112010': { descricao: 'Motocicletas de 50cc a 125cc', aliquotaAdValorem: 2.0, unidade: 'UN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Motos / IS' },
  '87112020': { descricao: 'Motocicletas de 125cc a 250cc', aliquotaAdValorem: 4.0, unidade: 'UN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Motos / IS' },
  '87113000': { descricao: 'Motocicletas de 250cc a 500cc', aliquotaAdValorem: 7.0, unidade: 'UN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Motos / IS' },
  '87114000': { descricao: 'Motocicletas acima de 500cc (alta cilindrada esportivas)', aliquotaAdValorem: 10.0, unidade: 'UN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Motos / IS' },
  '89039200': { descricao: 'Iates, lanchas de luxo e outras embarcações de recreio ou esporte', aliquotaAdValorem: 15.0, unidade: 'UN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Embarcações / IS' },
  '89031100': { descricao: 'Motos aquáticas (Jet Ski)', aliquotaAdValorem: 15.0, unidade: 'UN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Embarcações / IS' },
  '88022010': { descricao: 'Aviões monomotores e bimotores de uso executivo/recreio', aliquotaAdValorem: 12.0, unidade: 'UN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Aeronaves / IS' },
  '88021100': { descricao: 'Helicópteros executivos particulares', aliquotaAdValorem: 12.0, unidade: 'UN', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Aeronaves / IS' },

  // Recursos Minerais e Petróleo (Art. 408 a 411 da LC 214/2025 - Máximo 0,25%)
  '27090010': { descricao: 'Petróleo bruto de poços (extração mineral)', aliquotaAdValorem: 0.25, unidade: 'KG', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Mineração e Petróleo / IS' },
  '26011100': { descricao: 'Minérios de ferro e seus concentrados não aglomerados', aliquotaAdValorem: 0.25, unidade: 'KG', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Mineração e Petróleo / IS' },
  '26030010': { descricao: 'Minérios de cobre e seus concentrados', aliquotaAdValorem: 0.25, unidade: 'KG', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Mineração e Petróleo / IS' },
  '26040011': { descricao: 'Minérios de níquel e seus concentrados', aliquotaAdValorem: 0.25, unidade: 'KG', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Mineração e Petróleo / IS' },
  '26060011': { descricao: 'Minérios de alumínio (bauxita bruta)', aliquotaAdValorem: 0.25, unidade: 'KG', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Mineração e Petróleo / IS' },
  '27011200': { descricao: 'Hulha betuminosa e carvão mineral para energia', aliquotaAdValorem: 0.25, unidade: 'KG', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Mineração e Petróleo / IS' },
};

export const NCM_GERAIS_DATABASE: Record<
  string,
  { descricao: string; cstSugerido: string; cClassTribSugerido: string; categoria: string; reducaoPercentual: number }
> = {
  // -------------------------------------------------------------
  // ALIMENTOS & CESTA BÁSICA NACIONAL (Alíquota Zero CST 220)
  // -------------------------------------------------------------
  '10061092': { descricao: 'Arroz em casca não parboilizado (Cesta Básica Nacional)', cstSugerido: '220', cClassTribSugerido: '220001', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '10063021': { descricao: 'Arroz polido ou brunido longo fino Tipo 1', cstSugerido: '220', cClassTribSugerido: '220001', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '10063011': { descricao: 'Arroz parboilizado polido Tipo 1', cstSugerido: '220', cClassTribSugerido: '220001', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '07133319': { descricao: 'Feijão preto comum seco', cstSugerido: '220', cClassTribSugerido: '220002', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '07133399': { descricao: 'Feijão carioca, fradinho e outros feijões', cstSugerido: '220', cClassTribSugerido: '220002', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '04012010': { descricao: 'Leite UHT integral longa vida pasteurizado', cstSugerido: '220', cClassTribSugerido: '220003', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '04011010': { descricao: 'Leite fluido desnatado pasteurizado', cstSugerido: '220', cClassTribSugerido: '220003', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '04022110': { descricao: 'Leite em pó integral sem adição de açúcar', cstSugerido: '220', cClassTribSugerido: '220003', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '04051000': { descricao: 'Manteiga de primeira qualidade obtida de leite', cstSugerido: '220', cClassTribSugerido: '220004', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '11062000': { descricao: 'Farinha e sêmola de mandioca', cstSugerido: '220', cClassTribSugerido: '220005', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '11022000': { descricao: 'Farinha e fubá de milho para alimentação humana', cstSugerido: '220', cClassTribSugerido: '220005', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '11010010': { descricao: 'Farinha de trigo comum para panificação', cstSugerido: '220', cClassTribSugerido: '220006', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '19059090': { descricao: 'Pão comum tipo francês (farinha, água, fermento e sal)', cstSugerido: '220', cClassTribSugerido: '220006', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '04072100': { descricao: 'Ovos frescos de galinha em casca', cstSugerido: '220', cClassTribSugerido: '220007', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '09012100': { descricao: 'Café torrado em grãos ou moído tradicional', cstSugerido: '220', cClassTribSugerido: '220008', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '15079011': { descricao: 'Óleo de soja comestível refinado', cstSugerido: '220', cClassTribSugerido: '220009', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '17011400': { descricao: 'Açúcar de cana cristal', cstSugerido: '220', cClassTribSugerido: '220010', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '17019900': { descricao: 'Açúcar refinado amorfo', cstSugerido: '220', cClassTribSugerido: '220010', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '07019000': { descricao: 'Batatas frescas ou refrigeradas in natura', cstSugerido: '220', cClassTribSugerido: '220011', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '07020000': { descricao: 'Tomates frescos in natura', cstSugerido: '220', cClassTribSugerido: '220011', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '07031019': { descricao: 'Cebolas frescas ou refrigeradas', cstSugerido: '220', cClassTribSugerido: '220011', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '08039000': { descricao: 'Bananas frescas tipo prata, nanica ou maçã', cstSugerido: '220', cClassTribSugerido: '220011', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '08081000': { descricao: 'Maçãs frescas in natura', cstSugerido: '220', cClassTribSugerido: '220011', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },
  '08051000': { descricao: 'Laranjas frescas in natura', cstSugerido: '220', cClassTribSugerido: '220011', categoria: 'Cesta Básica Nacional', reducaoPercentual: 100 },

  // -------------------------------------------------------------
  // ALIMENTOS COM REDUÇÃO DE 60% (CST 200 - Anexo VII)
  // -------------------------------------------------------------
  '02011000': { descricao: 'Carnes de animais da espécie bovina, frescas ou refrigeradas', cstSugerido: '200', cClassTribSugerido: '200006', categoria: 'Alimentos / Carnes (-60%)', reducaoPercentual: 60 },
  '02013000': { descricao: 'Carnes desossadas de bovino (alcatra, contrafilé, picanha, patinho)', cstSugerido: '200', cClassTribSugerido: '200006', categoria: 'Alimentos / Carnes (-60%)', reducaoPercentual: 60 },
  '02031100': { descricao: 'Carnes de animais da espécie suína em carcaças frescas', cstSugerido: '200', cClassTribSugerido: '200006', categoria: 'Alimentos / Carnes (-60%)', reducaoPercentual: 60 },
  '02071100': { descricao: 'Carnes e miudezas de galos e galinhas não cortadas em pedaços', cstSugerido: '200', cClassTribSugerido: '200006', categoria: 'Alimentos / Aves (-60%)', reducaoPercentual: 60 },
  '02071400': { descricao: 'Pedaços e miudezas de frango congelados (peito, coxa, sobrecoxa)', cstSugerido: '200', cClassTribSugerido: '200006', categoria: 'Alimentos / Aves (-60%)', reducaoPercentual: 60 },
  '03021100': { descricao: 'Trutas e salmões frescos ou refrigerados', cstSugerido: '200', cClassTribSugerido: '200028', categoria: 'Pescados (-60%)', reducaoPercentual: 60 },
  '03046100': { descricao: 'Filés congelados de tilápia', cstSugerido: '200', cClassTribSugerido: '200028', categoria: 'Pescados (-60%)', reducaoPercentual: 60 },
  '04061010': { descricao: 'Queijo tipo mussarela fresco', cstSugerido: '200', cClassTribSugerido: '200029', categoria: 'Laticínios (-60%)', reducaoPercentual: 60 },
  '04069020': { descricao: 'Queijo tipo prato e queijo minas curado', cstSugerido: '200', cClassTribSugerido: '200029', categoria: 'Laticínios (-60%)', reducaoPercentual: 60 },
  '19021900': { descricao: 'Massas alimentícias secas (macarrão, espaguete)', cstSugerido: '200', cClassTribSugerido: '200006', categoria: 'Alimentos (-60%)', reducaoPercentual: 60 },
  '19053100': { descricao: 'Biscoitos e bolachas secas sem recheio', cstSugerido: '200', cClassTribSugerido: '200006', categoria: 'Alimentos (-60%)', reducaoPercentual: 60 },
  '20091200': { descricao: 'Suco de laranja natural não congelado (100% fruta)', cstSugerido: '200', cClassTribSugerido: '200030', categoria: 'Sucos Naturais (-60%)', reducaoPercentual: 60 },

  // -------------------------------------------------------------
  // SAÚDE, MEDICAMENTOS E VACINAS (CST 200 & CST 220)
  // -------------------------------------------------------------
  '30049099': { descricao: 'Outros medicamentos para uso humano dosificados', cstSugerido: '200', cClassTribSugerido: '200003', categoria: 'Saúde / Medicamentos (-60%)', reducaoPercentual: 60 },
  '30042099': { descricao: 'Medicamentos contendo antibióticos dosificados', cstSugerido: '200', cClassTribSugerido: '200003', categoria: 'Saúde / Medicamentos (-60%)', reducaoPercentual: 60 },
  '30043100': { descricao: 'Insulina humana e análogos de insulina para diabetes', cstSugerido: '220', cClassTribSugerido: '220013', categoria: 'Saúde / Alíquota Zero', reducaoPercentual: 100 },
  '30022019': { descricao: 'Vacinas para medicina humana (imunobiológicos)', cstSugerido: '220', cClassTribSugerido: '220014', categoria: 'Saúde / Alíquota Zero', reducaoPercentual: 100 },
  '30021590': { descricao: 'Medicamentos imunoterápicos monoclonais e oncológicos', cstSugerido: '220', cClassTribSugerido: '220012', categoria: 'Saúde / Alíquota Zero', reducaoPercentual: 100 },
  '30024100': { descricao: 'Sangue humano e frações de sangue (plasma e hemoderivados)', cstSugerido: '220', cClassTribSugerido: '220015', categoria: 'Saúde / Alíquota Zero', reducaoPercentual: 100 },
  '90219080': { descricao: 'Stents coronários vasculares expansíveis', cstSugerido: '220', cClassTribSugerido: '220016', categoria: 'Saúde / Alíquota Zero', reducaoPercentual: 100 },
  '90215000': { descricao: 'Marca-passos cardíacos implantáveis', cstSugerido: '220', cClassTribSugerido: '220016', categoria: 'Saúde / Alíquota Zero', reducaoPercentual: 100 },
  '87139000': { descricao: 'Cadeiras de rodas elétricas motorizadas e manuais para PcD', cstSugerido: '220', cClassTribSugerido: '220017', categoria: 'Acessibilidade PcD', reducaoPercentual: 100 },
  '90211010': { descricao: 'Próteses ortopédicas de membros inferiores e superiores', cstSugerido: '220', cClassTribSugerido: '220017', categoria: 'Acessibilidade PcD', reducaoPercentual: 100 },
  '90189099': { descricao: 'Instrumentos e aparelhos para medicina e cirurgia em geral', cstSugerido: '200', cClassTribSugerido: '200002', categoria: 'Saúde / Equipamentos (-60%)', reducaoPercentual: 60 },
  '90221419': { descricao: 'Aparelhos de tomografia computadorizada e raio-x médico', cstSugerido: '200', cClassTribSugerido: '200025', categoria: 'Saúde / Equipamentos (-60%)', reducaoPercentual: 60 },

  // -------------------------------------------------------------
  // HIGIENE PESSOAL E CUIDADOS BÁSICOS
  // -------------------------------------------------------------
  '96190000': { descricao: 'Absorventes e tampões higiênicos femininos (Saúde Menstrual)', cstSugerido: '220', cClassTribSugerido: '220019', categoria: 'Higiene / Alíquota Zero', reducaoPercentual: 100 },
  '96190001': { descricao: 'Fraldas descartáveis infantis e geriátricas', cstSugerido: '200', cClassTribSugerido: '200040', categoria: 'Higiene (-60%)', reducaoPercentual: 60 },
  '34011190': { descricao: 'Sabonetes de toucador em barras para higiene pessoal', cstSugerido: '200', cClassTribSugerido: '200009', categoria: 'Higiene (-60%)', reducaoPercentual: 60 },
  '33061000': { descricao: 'Dentifrícios (pastas e cremes dentais)', cstSugerido: '200', cClassTribSugerido: '200009', categoria: 'Higiene (-60%)', reducaoPercentual: 60 },
  '96032100': { descricao: 'Escovas de dentes infantis e para adultos', cstSugerido: '200', cClassTribSugerido: '200009', categoria: 'Higiene (-60%)', reducaoPercentual: 60 },

  // -------------------------------------------------------------
  // AGROPECUÁRIA, SEMENTES E FERTILIZANTES (CST 200 - Anexos V & VI)
  // -------------------------------------------------------------
  '12019000': { descricao: 'Soja em grãos, mesmo triturada (produção agropecuária)', cstSugerido: '200', cClassTribSugerido: '200005', categoria: 'Agropecuária (-60%)', reducaoPercentual: 60 },
  '10059010': { descricao: 'Milho em grãos a granel para ração e indústria', cstSugerido: '200', cClassTribSugerido: '200005', categoria: 'Agropecuária (-60%)', reducaoPercentual: 60 },
  '10019900': { descricao: 'Trigo em grãos comum para moagem', cstSugerido: '220', cClassTribSugerido: '220006', categoria: 'Agropecuária / Cesta Básica', reducaoPercentual: 100 },
  '31052000': { descricao: 'Adubos minerais com nitrogênio, fósforo e potássio (NPK)', cstSugerido: '200', cClassTribSugerido: '200004', categoria: 'Insumos Agropecuários (-60%)', reducaoPercentual: 60 },
  '31021010': { descricao: 'Ureia com teor de nitrogênio > 45% para adubação agrícola', cstSugerido: '200', cClassTribSugerido: '200004', categoria: 'Insumos Agropecuários (-60%)', reducaoPercentual: 60 },
  '38089199': { descricao: 'Defensivos agrícolas inseticidas formulados', cstSugerido: '200', cClassTribSugerido: '200004', categoria: 'Insumos Agropecuários (-60%)', reducaoPercentual: 60 },
  '38089329': { descricao: 'Herbicidas para lavouras de soja e milho', cstSugerido: '200', cClassTribSugerido: '200004', categoria: 'Insumos Agropecuários (-60%)', reducaoPercentual: 60 },
  '12099100': { descricao: 'Sementes certificadas de hortaliças para semeadura', cstSugerido: '200', cClassTribSugerido: '200026', categoria: 'Insumos Agropecuários (-60%)', reducaoPercentual: 60 },
  '23099090': { descricao: 'Rações preparadas para alimentação de animais de corte', cstSugerido: '200', cClassTribSugerido: '200004', categoria: 'Insumos Agropecuários (-60%)', reducaoPercentual: 60 },
  '84321000': { descricao: 'Arados e maquinário de preparação de solo', cstSugerido: '000', cClassTribSugerido: '000004', categoria: 'Máquinas Agrícolas', reducaoPercentual: 0 },
  '84335100': { descricao: 'Colheitadeiras combinadas com motor de grande porte', cstSugerido: '000', cClassTribSugerido: '000004', categoria: 'Máquinas Agrícolas', reducaoPercentual: 0 },
  '87019100': { descricao: 'Tratores agrícolas de rodas de até 75 kW', cstSugerido: '000', cClassTribSugerido: '000004', categoria: 'Máquinas Agrícolas', reducaoPercentual: 0 },

  // -------------------------------------------------------------
  // COMBUSTÍVEIS E ENERGIA (CST 010 & 011 Monofásicos)
  // -------------------------------------------------------------
  '27101259': { descricao: 'Gasolina automotiva comum e aditivada (Monofásica)', cstSugerido: '010', cClassTribSugerido: '010001', categoria: 'Combustíveis Fósseis', reducaoPercentual: 0 },
  '27101921': { descricao: 'Óleo diesel automotivo S10 e S500', cstSugerido: '010', cClassTribSugerido: '010001', categoria: 'Combustíveis Fósseis', reducaoPercentual: 0 },
  '27111910': { descricao: 'Gás liquefeito de petróleo (GLP / Gás de cozinha)', cstSugerido: '010', cClassTribSugerido: '010001', categoria: 'Combustíveis Fósseis', reducaoPercentual: 0 },
  '27112100': { descricao: 'Gás natural em estado gasoso (GNV e industrial)', cstSugerido: '010', cClassTribSugerido: '010002', categoria: 'Combustíveis Fósseis', reducaoPercentual: 0 },
  '27101911': { descricao: 'Querosene de aviação comercial (QAV)', cstSugerido: '010', cClassTribSugerido: '010003', categoria: 'Combustíveis Fósseis', reducaoPercentual: 0 },
  '22071090': { descricao: 'Etanol hidratado combustível para veículos flex (-50%)', cstSugerido: '011', cClassTribSugerido: '011001', categoria: 'Biocombustíveis (-50%)', reducaoPercentual: 50 },
  '38260000': { descricao: 'Biodiesel B100 puro e suas misturas (-50%)', cstSugerido: '011', cClassTribSugerido: '011003', categoria: 'Biocombustíveis (-50%)', reducaoPercentual: 50 },
  '27112990': { descricao: 'Biometano e biogás purificado renovável (-50%)', cstSugerido: '011', cClassTribSugerido: '011002', categoria: 'Biocombustíveis (-50%)', reducaoPercentual: 50 },

  // -------------------------------------------------------------
  // INFORMÁTICA, ELETRÔNICOS E TELECOMUNICAÇÕES (CST 000 Padrão)
  // -------------------------------------------------------------
  '84713012': { descricao: 'Notebooks e laptops portáteis com tela <= 15.6"', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Informática', reducaoPercentual: 0 },
  '84713019': { descricao: 'Tablets digitais e outros computadores portáteis', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Informática', reducaoPercentual: 0 },
  '84714100': { descricao: 'Computadores de mesa (Desktops / Servidores locais)', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Informática', reducaoPercentual: 0 },
  '85171300': { descricao: 'Smartphones e aparelhos telefônicos celulares 4G/5G', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Eletrônicos', reducaoPercentual: 0 },
  '85285200': { descricao: 'Monitores de vídeo LED/OLED para computadores', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Informática', reducaoPercentual: 0 },
  '84717020': { descricao: 'Unidades de estado sólido (SSD NVMe e SATA)', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Informática', reducaoPercentual: 0 },
  '85176277': { descricao: 'Roteadores digitais e pontos de acesso Wi-Fi 6', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Telecomunicações', reducaoPercentual: 0 },
  '85044010': { descricao: 'Carregadores de bateria USB-C e no-breaks inteligentes', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Eletrônicos', reducaoPercentual: 0 },

  // -------------------------------------------------------------
  // VESTUÁRIO, CALÇADOS E TÊXTEIS (CST 000 Padrão)
  // -------------------------------------------------------------
  '61091000': { descricao: 'Camisetas de malha de algodão estampadas ou lisas', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Vestuário', reducaoPercentual: 0 },
  '62034200': { descricao: 'Calças compridas de tecido de algodão (Jeans / Sarja)', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Vestuário', reducaoPercentual: 0 },
  '62044200': { descricao: 'Vestidos de tecidos de algodão', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Vestuário', reducaoPercentual: 0 },
  '64039990': { descricao: 'Calçados com sola de borracha e cabedal de couro natural', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Calçados', reducaoPercentual: 0 },
  '64021900': { descricao: 'Tênis e calçados esportivos para corrida', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Calçados', reducaoPercentual: 0 },

  // -------------------------------------------------------------
  // CONSTRUÇÃO CIVIL E SIDERURGIA (CST 000 Padrão)
  // -------------------------------------------------------------
  '25232910': { descricao: 'Cimento Portland comum e composto para construção', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Construção Civil', reducaoPercentual: 0 },
  '72142000': { descricao: 'Barras de ferro e aço para armaduras de concreto armado (Vergalhões)', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Construção Civil', reducaoPercentual: 0 },
  '69072100': { descricao: 'Placas e ladrilhos cerâmicos (Porcelanato esmaltado)', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Construção Civil', reducaoPercentual: 0 },
  '32091010': { descricao: 'Tintas acrílicas à base de água para alvenaria', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Construção Civil', reducaoPercentual: 0 },
  '70052900': { descricao: 'Vidro flotado plano transparente para fachadas e janelas', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Construção Civil', reducaoPercentual: 0 },
  '39172300': { descricao: 'Tubos e conexões rígidas de PVC para instalações prediais', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Construção Civil', reducaoPercentual: 0 },

  // -------------------------------------------------------------
  // VEÍCULOS DE TRANSPORTE DE CARGA E AUTOPEÇAS (CST 000)
  // -------------------------------------------------------------
  '87042210': { descricao: 'Caminhões para transporte de mercadorias (peso 5t a 20t)', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Veículos Comerciais', reducaoPercentual: 0 },
  '87021000': { descricao: 'Ônibus para transporte de mais de 10 passageiros', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Veículos Comerciais', reducaoPercentual: 0 },
  '40111000': { descricao: 'Pneus novos de borracha para automóveis de passageiros', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Autopeças', reducaoPercentual: 0 },
  '85071010': { descricao: 'Baterias de chumbo-ácido para partida de motores de veículos', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Autopeças', reducaoPercentual: 0 },
  '87082999': { descricao: 'Peças e acessórios de carroçaria para veículos automotores', cstSugerido: '000', cClassTribSugerido: '000001', categoria: 'Autopeças', reducaoPercentual: 0 },

  // -------------------------------------------------------------
  // LIVROS E JORNAIS (Imunidade Constitucional CST 400)
  // -------------------------------------------------------------
  '49019900': { descricao: 'Livros didáticos, científicos, técnicos e literários (Imunidade)', cstSugerido: '400', cClassTribSugerido: '400001', categoria: 'Livros e Cultura (Imunidade)', reducaoPercentual: 100 },
  '49021000': { descricao: 'Jornais e periódicos diários ou semanais impressos', cstSugerido: '400', cClassTribSugerido: '400002', categoria: 'Livros e Cultura (Imunidade)', reducaoPercentual: 100 },
  '48010010': { descricao: 'Papel de imprensa destinado à tiragem de jornais e livros', cstSugerido: '400', cClassTribSugerido: '400002', categoria: 'Livros e Cultura (Imunidade)', reducaoPercentual: 100 },
};
