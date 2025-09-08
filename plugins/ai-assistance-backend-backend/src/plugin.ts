import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { OpenAIService } from './services/OpenAIService';

/**
 * aiAssistanceBackendPlugin backend plugin
 *
 * @public
 */
export const aiAssistanceBackendPlugin = createBackendPlugin({
  pluginId: 'ai-assistance-backend',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
      },
      async init({ logger, httpRouter, config }) {
        const openAIService = new OpenAIService(config, logger);

        httpRouter.use(
          await createRouter({
            openAIService,
          }),
        );
        
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
        
        httpRouter.addAuthPolicy({
          path: '/openai',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
