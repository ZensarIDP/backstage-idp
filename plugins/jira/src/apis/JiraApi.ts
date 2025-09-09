import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/core-plugin-api';

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

export interface JiraApi {
  getProjects(): Promise<JiraProject[]>;
  getIssues(projectKey?: string, status?: string, assignee?: string): Promise<JiraIssue[]>;
  getIssue(issueKey: string): Promise<JiraIssue>;
  createIssue(request: CreateIssueRequest): Promise<JiraIssue>;
  updateIssue(issueKey: string, request: UpdateIssueRequest): Promise<JiraIssue>;
  getIssueTypes(projectKey: string): Promise<JiraIssueType[]>;
  addComment(issueKey: string, comment: string): Promise<void>;
}

export const jiraApiRef = createApiRef<JiraApi>({
  id: 'plugin.jira.service',
});

export class JiraApiClient implements JiraApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: {
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  private async getBaseUrl(): Promise<string> {
    const baseUrl = await this.discoveryApi.getBaseUrl('jira-backend');
    return baseUrl;
  }

  async getProjects(): Promise<JiraProject[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/projects`);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    return response.json();
  }

  async getIssues(projectKey?: string, status?: string, assignee?: string): Promise<JiraIssue[]> {
    const baseUrl = await this.getBaseUrl();
    const params = new URLSearchParams();
    if (projectKey) params.append('projectKey', projectKey);
    if (status) params.append('status', status);
    if (assignee) params.append('assignee', assignee);
    
    const url = `${baseUrl}/issues${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.fetchApi.fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch issues: ${response.statusText}`);
    }
    return response.json();
  }

  async getIssue(issueKey: string): Promise<JiraIssue> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/issues/${issueKey}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch issue: ${response.statusText}`);
    }
    return response.json();
  }

  async createIssue(request: CreateIssueRequest): Promise<JiraIssue> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Failed to create issue: ${response.statusText}`);
    }
    return response.json();
  }

  async updateIssue(issueKey: string, request: UpdateIssueRequest): Promise<JiraIssue> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/issues/${issueKey}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      let errorMessage = `Failed to update issue: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If we can't parse the error response, use the status text
      }
      throw new Error(errorMessage);
    }
    return response.json();
  }

  async getIssueTypes(projectKey: string): Promise<JiraIssueType[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/projects/${projectKey}/issue-types`);
    if (!response.ok) {
      throw new Error(`Failed to fetch issue types: ${response.statusText}`);
    }
    return response.json();
  }

  async addComment(issueKey: string, comment: string): Promise<void> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/issues/${issueKey}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    });
    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.statusText}`);
    }
  }
}
