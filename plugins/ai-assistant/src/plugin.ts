import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const aiAssistantPlugin = createPlugin({
  id: 'ai-assistant',
  routes: {
    root: rootRouteRef,
  },
});

export const AiAssistantPage = aiAssistantPlugin.provide(
  createRoutableExtension({
    name: 'AiAssistantPage',
    component: () =>
      import('./components/AiAssistantPage').then(m => m.AiAssistantPage),
    mountPoint: rootRouteRef,
  }),
);
