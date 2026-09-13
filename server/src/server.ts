import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from './config/constants.js';
import apiRoutes from './routes/api.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openApiPath = path.join(__dirname, 'docs', 'openapi.json');
const openApiSpec = JSON.parse(fs.readFileSync(openApiPath, 'utf-8'));

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ type: ['application/xml', 'text/xml', 'text/plain'], limit: '10mb' }));

// Swagger UI Docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get('/api/openapi.json', (_req: Request, res: Response) => {
  res.json(openApiSpec);
});

app.get('/api/postman-collection', (_req: Request, res: Response) => {
  const postmanPath = path.resolve(__dirname, '..', '..', 'ibscbs-easyapi.postman_collection.json');
  if (fs.existsSync(postmanPath)) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="ibscbs-easyapi.postman_collection.json"');
    res.sendFile(postmanPath);
  } else {
    res.status(404).json({ error: 'Arquivo da coleção Postman não encontrado' });
  }
});

// API Routes (Suporte a /api/v1 e compatibilidade direta com /api/calculadora/*)
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes);

// Root Endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    projeto: 'IBS/CBS EasyAPI - Gateway Inteligente & Hub da Reforma Tributária',
    versao: '1.0.0',
    status: 'online',
    documentacaoSwagger: '/api/docs',
    endpointsPrincipais: {
      calculoSimplificado: 'POST /api/v1/calcular',
      calculoRegimeGeral: 'POST /api/v1/calculadora/regime-geral',
      consultarNcmIS: 'GET /api/v1/dados-abertos/ncm?ncm=24021000',
      cronogramaReforma: 'GET /api/v1/dados-abertos/cronograma',
      saudeServidorGoverno: 'GET /api/v1/observabilidade/health',
      snippetsSdk: 'POST /api/v1/sdk/snippets',
    },
    baseLegal: 'Lei Complementar nº 214/2025 e Emenda Constitucional nº 132/2023',
  });
});

app.listen(CONFIG.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 IBS/CBS EasyAPI Server rodando na porta ${CONFIG.PORT}`);
  console.log(`📚 Documentação Swagger: http://localhost:${CONFIG.PORT}/api/docs`);
  console.log(`⚡ API Gateway: http://localhost:${CONFIG.PORT}/api/v1`);
  console.log(`=======================================================`);
});

export default app;
