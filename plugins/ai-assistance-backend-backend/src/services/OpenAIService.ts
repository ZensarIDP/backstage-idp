import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI | null = null;
  private logger: LoggerService;

  constructor(config: Config, logger: LoggerService) {
    this.logger = logger;
    
    const apiKey = config.getOptionalString('ai.openai.apiKey');
    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured. OpenAI features will be disabled.');
      return;
    }

    this.client = new OpenAI({
      apiKey: apiKey,
    });

    this.logger.info('OpenAI service initialized successfully');
  }

  async generateResponse(requestBody: any): Promise<any> {
    if (!this.client) {
      throw new Error('OpenAI service is not configured. Please set ai.openai.apiKey in your configuration.');
    }

    try {
      this.logger.info('Making request to OpenAI API');
      
      // Forward the request to OpenAI
      const response = await this.client.chat.completions.create(requestBody);
      
      this.logger.info('Successfully received response from OpenAI API');
      return response;
    } catch (error) {
      this.logger.error('Error calling OpenAI API:', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }
}
