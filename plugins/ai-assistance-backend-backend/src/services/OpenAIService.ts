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

  async generatePredefinedPromptResponse(promptId: string, template: string, systemPrompt: string, userInput?: string): Promise<any> {
    if (!this.client) {
      throw new Error('OpenAI service is not configured. Please set ai.openai.apiKey in your configuration.');
    }

    try {
      this.logger.info(`Making predefined prompt request to OpenAI API for prompt: ${promptId}`);
      
      // Construct the enhanced prompt
      const enhancedPrompt = userInput 
        ? `${template}\n\nAdditional requirements: ${userInput}`
        : template;

      // Create optimized request for predefined prompts
      const requestBody = {
        model: 'gpt-4',
        messages: [
          {
            role: 'system' as const,
            content: systemPrompt
          },
          {
            role: 'user' as const,
            content: enhancedPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 3000, // Higher token limit for comprehensive responses
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      };

      const response = await this.client.chat.completions.create(requestBody);
      
      this.logger.info(`Successfully received predefined prompt response from OpenAI API for prompt: ${promptId}`);
      return response;
    } catch (error) {
      this.logger.error(`Error calling OpenAI API for predefined prompt ${promptId}:`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }
}
