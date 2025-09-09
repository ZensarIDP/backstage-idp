import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import fetch from 'node-fetch';
import { InputError } from '@backstage/errors';

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description?: string;
  status?: {
    name: string;
    statusCategory?: {
      key: string;
      name: string;
    };
  };
  priority?: {
    name: string;
    iconUrl?: string;
  };
  issuetype?: {
    name: string;
    iconUrl?: string;
  };
  assignee?: {
    displayName: string;
    emailAddress: string;
  };
  created: string;
  updated: string;
  project: {
    key: string;
    name: string;
  };
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}

export interface JiraIssueType {
  id: string;
  name: string;
  iconUrl: string;
  subtask: boolean;
}

export interface CreateIssueRequest {
  projectKey: string;
  summary: string;
  description?: string;
  issueType: string;
  priority?: string;
  assignee?: string;
}

export interface UpdateIssueRequest {
  summary?: string;
  description?: string;
  assignee?: string;
  priority?: string;
  status?: string;
}

export class JiraService {
  private readonly logger: LoggerService;
  private readonly baseUrl: string;
  private readonly email: string;
  private readonly apiToken: string;

  constructor(config: Config, logger: LoggerService) {
    this.logger = logger;
    
    const jiraConfig = config.getOptionalConfig('jira');
    if (!jiraConfig) {
      throw new Error('Jira configuration is missing. Please add jira config to your app-config.yaml');
    }

    this.baseUrl = jiraConfig.getString('baseUrl');
    this.email = jiraConfig.getString('email');
    this.apiToken = jiraConfig.getString('apiToken');

    if (!this.baseUrl || !this.email || !this.apiToken) {
      throw new Error('Jira configuration is incomplete. Required: baseUrl, email, apiToken');
    }
  }

  private getAuthHeaders() {
    const auth = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async makeRequest(endpoint: string, options: any = {}) {
    const url = `${this.baseUrl}/rest/api/3${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Could not read error response';
        }
        this.logger.error(`Jira API error: ${response.status} ${response.statusText}`, { errorText });
        throw new Error(`Jira API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // For PUT requests (like updates), check if response has content
      if (options.method === 'PUT' && response.status === 204) {
        // No content response for successful PUT
        return {};
      }

      const responseText = await response.text();
      if (!responseText) {
        return {};
      }

      try {
        return JSON.parse(responseText);
      } catch (jsonError) {
        this.logger.error(`Invalid JSON response from Jira: ${jsonError}`, { responseText, url });
        throw new Error(`Invalid JSON response from Jira API`);
      }
    } catch (error) {
      this.logger.error(`Error making request to Jira: ${error}`, { url });
      throw error;
    }
  }

  async getProjects(): Promise<JiraProject[]> {
    try {
      const response = await this.makeRequest('/project');
      return response.map((project: any) => ({
        id: project.id,
        key: project.key,
        name: project.name,
        projectTypeKey: project.projectTypeKey,
      }));
    } catch (error) {
      this.logger.error(`Error fetching projects: ${error}`);
      throw error;
    }
  }

  async getIssues(projectKey?: string, status?: string, assignee?: string): Promise<JiraIssue[]> {
    try {
      let jql = 'ORDER BY updated DESC';
      const conditions: string[] = [];

      if (projectKey) {
        conditions.push(`project = "${projectKey}"`);
      }
      if (status) {
        conditions.push(`status = "${status}"`);
      }
      if (assignee) {
        conditions.push(`assignee = "${assignee}"`);
      }

      if (conditions.length > 0) {
        jql = `${conditions.join(' AND ')} ORDER BY updated DESC`;
      }

      const response = await this.makeRequest('/search', {
        method: 'POST',
        body: JSON.stringify({
          jql,
          maxResults: 100,
          fields: ['summary', 'description', 'status', 'priority', 'issuetype', 'assignee', 'created', 'updated', 'project'],
        }),
      });

      this.logger.info(`Jira API response: ${JSON.stringify(response, null, 2)}`);

      return response.issues.map((issue: any) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        description: issue.fields.description,
        status: issue.fields.status,
        priority: issue.fields.priority,
        issuetype: issue.fields.issuetype,
        assignee: issue.fields.assignee,
        created: issue.fields.created,
        updated: issue.fields.updated,
        project: issue.fields.project,
      }));
    } catch (error) {
      this.logger.error(`Error fetching issues: ${error}`);
      throw error;
    }
  }

  async getIssue(issueKey: string): Promise<JiraIssue> {
    try {
      const response = await this.makeRequest(`/issue/${issueKey}`);
      return {
        id: response.id,
        key: response.key,
        summary: response.fields.summary,
        description: response.fields.description,
        status: response.fields.status,
        priority: response.fields.priority,
        issuetype: response.fields.issuetype,
        assignee: response.fields.assignee,
        created: response.fields.created,
        updated: response.fields.updated,
        project: response.fields.project,
      };
    } catch (error) {
      this.logger.error(`Error fetching issue: ${error}`, { issueKey });
      throw error;
    }
  }

  async createIssue(request: CreateIssueRequest): Promise<JiraIssue> {
    try {
      const issueData = {
        fields: {
          project: { key: request.projectKey },
          summary: request.summary,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: request.description || '',
                  },
                ],
              },
            ],
          },
          issuetype: { name: request.issueType },
          ...(request.priority && { priority: { name: request.priority } }),
          ...(request.assignee && { assignee: { emailAddress: request.assignee } }),
        },
      };

      const response = await this.makeRequest('/issue', {
        method: 'POST',
        body: JSON.stringify(issueData),
      });

      // Fetch the created issue to return complete data
      return await this.getIssue(response.key);
    } catch (error) {
      this.logger.error(`Error creating issue: ${error}`);
      throw error;
    }
  }

  async updateIssue(issueKey: string, request: UpdateIssueRequest): Promise<JiraIssue> {
    try {
      const updateData: any = {
        fields: {},
      };

      if (request.summary) {
        updateData.fields.summary = request.summary;
      }
      
      if (request.description) {
        updateData.fields.description = {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: request.description,
                },
              ],
            },
          ],
        };
      }

      if (request.assignee) {
        // Only set assignee if it's a valid email format or null to unassign
        if (request.assignee.toLowerCase() === 'unassigned' || request.assignee === '') {
          updateData.fields.assignee = null;
        } else if (request.assignee.includes('@')) {
          updateData.fields.assignee = { emailAddress: request.assignee };
        } else {
          // Try by account ID or display name
          updateData.fields.assignee = { displayName: request.assignee };
        }
      }

      if (request.priority) {
        updateData.fields.priority = { name: request.priority };
      }

      await this.makeRequest(`/issue/${issueKey}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      // Handle status transition separately if provided
      if (request.status) {
        await this.transitionIssue(issueKey, request.status);
      }

      // Fetch the updated issue to return complete data
      return await this.getIssue(issueKey);
    } catch (error) {
      this.logger.error(`Error updating issue: ${error}`, { issueKey });
      throw error;
    }
  }

  async transitionIssue(issueKey: string, status: string): Promise<void> {
    try {
      // Get available transitions
      const transitions = await this.makeRequest(`/issue/${issueKey}/transitions`);
      
      const transition = transitions.transitions.find((t: any) => t.to.name === status);
      if (!transition) {
        throw new InputError(`Status '${status}' is not available for issue ${issueKey}`);
      }

      await this.makeRequest(`/issue/${issueKey}/transitions`, {
        method: 'POST',
        body: JSON.stringify({
          transition: { id: transition.id },
        }),
      });
    } catch (error) {
      this.logger.error(`Error transitioning issue: ${error}`, { issueKey, status });
      throw error;
    }
  }

  async getIssueTypes(projectKey: string): Promise<JiraIssueType[]> {
    try {
      const response = await this.makeRequest(`/project/${projectKey}`);
      return response.issueTypes.map((issueType: any) => ({
        id: issueType.id,
        name: issueType.name,
        iconUrl: issueType.iconUrl,
        subtask: issueType.subtask,
      }));
    } catch (error) {
      this.logger.error(`Error fetching issue types: ${error}`, { projectKey });
      throw error;
    }
  }

  async addComment(issueKey: string, comment: string): Promise<void> {
    try {
      await this.makeRequest(`/issue/${issueKey}/comment`, {
        method: 'POST',
        body: JSON.stringify({
          body: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: comment,
                  },
                ],
              },
            ],
          },
        }),
      });
    } catch (error) {
      this.logger.error(`Error adding comment: ${error}`, { issueKey, comment });
      throw error;
    }
  }
}
