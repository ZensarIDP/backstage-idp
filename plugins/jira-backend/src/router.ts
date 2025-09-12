import { Router } from 'express';
import express from 'express';
import { LoggerService } from '@backstage/backend-plugin-api';
import { JiraService, CreateIssueRequest, UpdateIssueRequest } from './services/JiraService';
import { InputError } from '@backstage/errors';

export interface RouterOptions {
  jiraService: JiraService;
  logger: LoggerService;
}

export async function createRouter(options: RouterOptions): Promise<Router> {
  const { jiraService, logger } = options;

  const router = Router();

  // Add middleware to parse JSON bodies
  router.use(express.json());

  // Health check endpoint
  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  // Get all projects
  router.get('/projects', async (_, response) => {
    try {
      const projects = await jiraService.getProjects();
      response.json(projects);
    } catch (error) {
      logger.error(`Error fetching projects: ${error}`);
      response.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  // Get issues with optional filters
  router.get('/issues', async (request, response) => {
    try {
      const { projectKey, status, assignee } = request.query;
      const issues = await jiraService.getIssues(
        projectKey as string,
        status as string,
        assignee as string,
      );
      response.json(issues);
    } catch (error) {
      logger.error(`Error fetching issues: ${error}`);
      response.status(500).json({ error: 'Failed to fetch issues' });
    }
  });

  // Get a specific issue
  router.get('/issues/:issueKey', async (request, response) => {
    try {
      const { issueKey } = request.params;
      const issue = await jiraService.getIssue(issueKey);
      response.json(issue);
    } catch (error) {
      logger.error(`Error fetching issue: ${error}`, { issueKey: request.params.issueKey });
      response.status(500).json({ error: 'Failed to fetch issue' });
    }
  });

  // Create a new issue
  router.post('/issues', async (request, response) => {
    try {
      if (!request.body) {
        throw new InputError('Request body is required');
      }
      
      const createRequest: CreateIssueRequest = request.body;
      
      if (!createRequest.projectKey || !createRequest.summary || !createRequest.issueType) {
        throw new InputError('Missing required fields: projectKey, summary, issueType');
      }

      const issue = await jiraService.createIssue(createRequest);
      response.status(201).json(issue);
    } catch (error) {
      logger.error(`Error creating issue: ${error}`);
      if (error instanceof InputError) {
        response.status(400).json({ error: error.message });
      } else {
        response.status(500).json({ error: 'Failed to create issue' });
      }
    }
  });

  // Update an issue
  router.put('/issues/:issueKey', async (request, response) => {
    try {
      const { issueKey } = request.params;
      
      if (!request.body) {
        throw new InputError('Request body is required');
      }
      
      const updateRequest: UpdateIssueRequest = request.body;
      
      logger.info(`Updating issue ${issueKey} with data: ${JSON.stringify(updateRequest)}`);
      
      const issue = await jiraService.updateIssue(issueKey, updateRequest);
      response.json(issue);
    } catch (error) {
      logger.error(`Error updating issue ${request.params.issueKey}: ${error}`);
      if (error instanceof InputError) {
        response.status(400).json({ error: error.message });
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Detailed error - Message: ${errorMessage}, Stack: ${error instanceof Error ? error.stack : 'No stack trace'}, IssueKey: ${request.params.issueKey}, RequestBody: ${JSON.stringify(request.body)}`);
        response.status(500).json({ error: `Failed to update issue: ${errorMessage}` });
      }
    }
  });

  // Get available transitions for an issue
  router.get('/issues/:issueKey/transitions', async (request, response) => {
    try {
      const { issueKey } = request.params;
      const transitions = await jiraService.getAvailableTransitions(issueKey);
      response.json(transitions);
    } catch (error) {
      logger.error(`Error fetching transitions: ${error}`, { issueKey: request.params.issueKey });
      response.status(500).json({ error: 'Failed to fetch transitions' });
    }
  });

  // Get issue types for a project
  router.get('/projects/:projectKey/issue-types', async (request, response) => {
    try {
      const { projectKey } = request.params;
      const issueTypes = await jiraService.getIssueTypes(projectKey);
      response.json(issueTypes);
    } catch (error) {
      logger.error(`Error fetching issue types: ${error}`, { projectKey: request.params.projectKey });
      response.status(500).json({ error: 'Failed to fetch issue types' });
    }
  });

  // Add comment to an issue
  router.post('/issues/:issueKey/comments', async (request, response) => {
    try {
      const { issueKey } = request.params;
      
      if (!request.body) {
        throw new InputError('Request body is required');
      }
      
      const { comment } = request.body;
      
      if (!comment) {
        throw new InputError('Comment is required');
      }

      await jiraService.addComment(issueKey, comment);
      response.status(201).json({ message: 'Comment added successfully' });
    } catch (error) {
      logger.error(`Error adding comment: ${error}`, { issueKey: request.params.issueKey });
      if (error instanceof InputError) {
        response.status(400).json({ error: error.message });
      } else {
        response.status(500).json({ error: 'Failed to add comment' });
      }
    }
  });

  return router;
}
