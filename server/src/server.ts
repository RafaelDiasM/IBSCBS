import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
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
let openApiPath = path.join(__dirname, 'docs', 'openapi.json');
if (!fs.existsSync(openApiPath)) {
  openApiPath = path.join(__dirname, '..', 'src', 'docs', 'openapi.json');
}
const openApiSpec = JSON.parse(fs.readFileSync(openApiPath, 'utf-8'));

const app = express();

// Segurança e Otimização
app.use(
  helmet({
    contentSecurityPolicy: false, // Necessário para Swagger UI e assets inline do Vite
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ type: ['application/xml', 'text/xml', 'text/plain'], limit: '10mb' }));

// Proteção contra abuso (Rate Limiting) para API pública gratuita
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : 300,
  standardHeaders: true, // Informa limites nos headers RateLimit-*
  legacyHeaders: false,
  message: {
    status: 'erro_rate_limit',
    mensagem: 'Limite de requisições excedido para este IP. Tente novamente em alguns minutos.',
  },
  skip: (req: Request) => req.path === '/api/v1/observabilidade/health' || req.path.startsWith('/api/docs'),
});
app.use('/api', apiLimiter);

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

// Servir frontend React compilado em produção (client/dist)
const clientDistPath = path.resolve(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA Fallback para rotas do navegador (rotas que não começam com /api)
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Em modo API-only (sem build do client): exibe status na raiz
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
}

app.listen(CONFIG.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 IBS/CBS EasyAPI Server rodando na porta ${CONFIG.PORT}`);
  console.log(`📚 Documentação Swagger: http://localhost:${CONFIG.PORT}/api/docs`);
  console.log(`⚡ API Gateway: http://localhost:${CONFIG.PORT}/api/v1`);
  console.log(`=======================================================`);
});

export default app;
