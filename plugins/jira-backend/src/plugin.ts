import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { JiraService } from './services/JiraService';

/**
 * jiraBackendPlugin backend plugin
 *
 * @public
 */
export const jiraBackendPlugin = createBackendPlugin({
  pluginId: 'jira-backend',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
      },
      async init({ logger, httpRouter, config }) {
        const jiraService = new JiraService(config, logger);

        httpRouter.use(
          await createRouter({
            jiraService,
            logger,
          }),
        );
        
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
        
        httpRouter.addAuthPolicy({
          path: '/projects',
          allow: 'unauthenticated',
        });

        httpRouter.addAuthPolicy({
          path: '/issues',
          allow: 'unauthenticated',
        });

        httpRouter.addAuthPolicy({
          path: '/issue-types',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
