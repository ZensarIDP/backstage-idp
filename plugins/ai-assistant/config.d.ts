export interface Config {
  aiAssistant: {
    openai: {
      /**
       * OpenAI API Key for AI Assistant
       * @visibility frontend
       */
      apiKey: string;
      /**
       * OpenAI Model to use
       * @visibility frontend
       */
      model?: string;
      /**
       * Maximum tokens for OpenAI responses
       * @visibility frontend
       */
      maxTokens?: number;
      /**
       * Temperature for OpenAI responses
       * @visibility frontend
       */
      temperature?: number;
    };
  };
}
