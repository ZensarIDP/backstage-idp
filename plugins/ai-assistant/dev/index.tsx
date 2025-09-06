import { createDevApp } from '@backstage/dev-utils';
import { aiAssistantPlugin, AiAssistantPage } from '../src/plugin';

createDevApp()
  .registerPlugin(aiAssistantPlugin)
  .addPage({
    element: <AiAssistantPage />,
    title: 'Root Page',
    path: '/ai-assistant',
  })
  .render();
