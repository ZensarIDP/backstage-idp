import { DiscoveryApi } from '@backstage/core-plugin-api';

export interface GitHubRepositoryInfo {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  default_branch: string;
  topics: string[];
  clone_url: string;
  html_url: string;
}

export interface GitHubFileInfo {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
}

export class GithubApi {
  constructor(private discoveryApi: DiscoveryApi) {}

  async getRepository(owner: string, repo: string): Promise<GitHubRepositoryInfo> {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    const response = await fetch(`${proxyUrl}/github/api/repos/${owner}/${repo}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch repository info: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getRepositoryLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    const response = await fetch(`${proxyUrl}/github/api/repos/${owner}/${repo}/languages`);
    
    if (!response.ok) {
      return {};
    }
    
    return response.json();
  }

  async getRepositoryContents(owner: string, repo: string, path: string = ''): Promise<GitHubFileInfo[]> {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    const response = await fetch(`${proxyUrl}/github/api/repos/${owner}/${repo}/contents/${path}`);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    try {
      const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
      const response = await fetch(`${proxyUrl}/github/api/repos/${owner}/${repo}/contents/${path}`);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      
      if (data.type === 'file' && data.content) {
        // GitHub API returns base64 encoded content
        return atob(data.content.replace(/\n/g, ''));
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base: string
  ): Promise<{ html_url: string; number: number }> {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    const response = await fetch(`${proxyUrl}/github/api/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        body,
        head,
        base,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create pull request: ${error.message}`);
    }
    
    return response.json();
  }

  async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    fromBranch: string = 'main'
  ): Promise<void> {
    // First get the SHA of the source branch
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    const branchResponse = await fetch(`${proxyUrl}/github/api/repos/${owner}/${repo}/git/refs/heads/${fromBranch}`);
    
    if (!branchResponse.ok) {
      throw new Error(`Failed to get source branch: ${branchResponse.statusText}`);
    }
    
    const branchData = await branchResponse.json();
    const sha = branchData.object.sha;
    
    // Create new branch
    const createResponse = await fetch(`${proxyUrl}/github/api/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha,
      }),
    });
    
    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(`Failed to create branch: ${error.message}`);
    }
  }

  async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch: string,
    sha?: string
  ): Promise<void> {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    const response = await fetch(`${proxyUrl}/github/api/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: btoa(content), // Base64 encode the content
        branch,
        ...(sha && { sha }), // Include SHA if updating existing file
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create/update file: ${error.message}`);
    }
  }
}
