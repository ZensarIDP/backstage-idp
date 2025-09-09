import {
  createPlugin,
  createRoutableExtension,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { jiraApiRef, JiraApiClient } from './apis/JiraApi';

export const jiraPlugin = createPlugin({
  id: 'jira',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: jiraApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new JiraApiClient({ discoveryApi, fetchApi }),
    }),
  ],
});

export const JiraPage = jiraPlugin.provide(
  createRoutableExtension({
    name: 'JiraPage',
    component: () =>
      import('./components/JiraPage').then(m => m.JiraPage),
    mountPoint: rootRouteRef,
  }),
);
