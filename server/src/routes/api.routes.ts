import { Router } from 'express';
import { CalculatorController } from '../controllers/calculator.controller.js';
import { OpenDataController } from '../controllers/openData.controller.js';
import { ObservabilityController } from '../controllers/observability.controller.js';
import { XmlController } from '../controllers/xml.controller.js';
import { SdkController } from '../controllers/sdk.controller.js';

const router = Router();

const calculatorController = new CalculatorController();
const openDataController = new OpenDataController();
const observabilityController = new ObservabilityController();
const xmlController = new XmlController();
const sdkController = new SdkController();

// 1. Calculadora e Tributos (EasyAPI & Oficial)
router.post('/calcular', calculatorController.calcularSimplificado);
router.post('/calculadora/regime-geral', calculatorController.calcularRegimeGeral);
router.post('/calculadora/pedagio', calculatorController.calcularPedagio);
router.post('/calculadora/base-calculo/cbs-ibs-mercadorias', calculatorController.calcularBaseCalculoCibs);
router.post('/calculadora/base-calculo/is-mercadorias', calculatorController.calcularBaseCalculoIS);
router.post('/calculadora/nfse/base-calculo', calculatorController.calcularNfseBaseCalculo);
router.post('/calculadora/nfse/indicador-operacao/validate', calculatorController.validarNfseIndicador);

// 2. Dados Abertos e Tabelas Fiscais
router.get('/dados-abertos/versao', openDataController.getVersao);
router.get('/dados-abertos/ufs', openDataController.getUfs);
router.get('/dados-abertos/ufs/municipios', openDataController.getMunicipios);
router.get('/dados-abertos/ncm', openDataController.getNcm);
router.get('/dados-abertos/ncm/imposto-seletivo', openDataController.getNcmsImpostoSeletivo);
router.get('/dados-abertos/nbs', openDataController.getNbs);
router.get('/dados-abertos/csts', openDataController.getCsts);
router.get('/dados-abertos/classificacoes-tributarias', openDataController.getClassificacoesTributarias);
router.get('/dados-abertos/classificacoes-tributarias/:cst', openDataController.getClassificacoesTributarias);
router.get('/dados-abertos/situacoes-tributarias/cbs-ibs', openDataController.getSituacoesTributariasCbsIbs);
router.get('/dados-abertos/situacoes-tributarias/imposto-seletivo', openDataController.getSituacoesTributariasIS);
router.get('/dados-abertos/cronograma', openDataController.getCronograma);
router.get('/dados-abertos/busca-geral', openDataController.buscaGeral);

// 3. Observabilidade e Diagnóstico
router.get('/observabilidade/health', observabilityController.getHealth);
router.get('/observabilidade/erros', observabilityController.getGlossarioErros);
router.get('/observabilidade/erros/buscar', observabilityController.buscarErro);

// 4. DFe e NFS-e XML (EasyAPI & Espelhos Oficiais do Governo)
router.get('/xml/documentos', xmlController.getDocumentosValidacao);
router.post('/xml/generate', xmlController.gerarXmlDfe);
router.post('/xml/validate', xmlController.validarXmlDfe);
router.post('/xml/inject', xmlController.injetarXmlDfe);
router.post('/xml/injetar-dfe', xmlController.injetarXmlDfe);
router.get('/xml/exemplo-nfe', xmlController.getExemploNfe);

// Espelhos com path oficial do Governo: /api/calculadora/xml/*
router.post('/calculadora/xml/generate', xmlController.gerarXmlDfe);
router.post('/calculadora/xml/validate', xmlController.validarXmlDfe);
router.post('/calculadora/xml/inject', xmlController.injetarXmlDfe);
router.post('/calculadora/xml/injetar-dfe', xmlController.injetarXmlDfe);
router.get('/calculadora/xml/exemplo-nfe', xmlController.getExemploNfe);

// 5. Gerador de SDK
router.post('/sdk/snippets', sdkController.generateSnippets);

export default router;
