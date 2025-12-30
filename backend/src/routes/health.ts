import { Router } from 'express';
import { checkLLMHealth } from '../services/llm.js';

const router = Router();

router.get('/', async (_req, res) => {
  const llmHealthy = await checkLLMHealth();

  const status = {
    status: llmHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
      database: 'healthy',
      llm: llmHealthy ? 'healthy' : 'unhealthy',
    },
  };

  const httpStatus = llmHealthy ? 200 : 503;
  res.status(httpStatus).json(status);
});

export default router;
