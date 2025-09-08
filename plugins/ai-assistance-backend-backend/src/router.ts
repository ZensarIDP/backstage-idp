import express from 'express';
import Router from 'express-promise-router';
import { OpenAIService } from './services/OpenAIService';

export async function createRouter({
  openAIService,
}: {
  openAIService: OpenAIService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  // Health check endpoint
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // OpenAI chat completions proxy endpoint
  router.post('/openai/chat/completions', async (req, res) => {
    try {
      // Validate that OpenAI service is configured
      if (!openAIService.isConfigured()) {
        res.status(503).json({
          error: 'OpenAI service is not configured. Please set ai.openai.apiKey in your configuration.'
        });
        return;
      }

      // Forward the request to OpenAI
      const response = await openAIService.generateResponse(req.body);
      
      res.json(response);
    } catch (error) {
      console.error('Error in OpenAI proxy:', error);
      
      if (error instanceof Error) {
        // Handle OpenAI API errors
        if (error.message.includes('401')) {
          res.status(401).json({
            error: 'Invalid OpenAI API key'
          });
          return;
        }
        if (error.message.includes('429')) {
          res.status(429).json({
            error: 'OpenAI API rate limit exceeded'
          });
          return;
        }
        if (error.message.includes('500')) {
          res.status(500).json({
            error: 'OpenAI API server error'
          });
          return;
        }
      }
      
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });

  return router;
}
