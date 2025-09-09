import {
  mockErrorHandler,
} from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';

import { createRouter } from './router';
import { OpenAIService } from './services/OpenAIService';

// TEMPLATE NOTE:
// Testing the router directly allows you to write a unit test that mocks the provided options.
describe('createRouter', () => {
  let app: express.Express;
  let openAIService: jest.Mocked<OpenAIService>;

  beforeEach(async () => {
    openAIService = {
      isConfigured: jest.fn().mockReturnValue(true),
      generateResponse: jest.fn(),
      generatePredefinedPromptResponse: jest.fn(),
    } as any;
    
    const router = await createRouter({
      openAIService,
    });
    app = express();
    app.use(router);
    app.use(mockErrorHandler());
  });

  it('should return health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should return predefined prompts', async () => {
    const response = await request(app).get('/predefined-prompts');

    expect(response.status).toBe(200);
    expect(response.body.prompts).toBeDefined();
    expect(Array.isArray(response.body.prompts)).toBe(true);
  });
});
