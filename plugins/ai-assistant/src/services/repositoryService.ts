import { Entity } from '@backstage/catalog-model';
import { GithubApi, GitHubFileInfo } from '../apis/githubApi';

export interface RepositoryMetadata {
  name: string;
  owner: string;
  fullName: string;
  description?: string;
  language?: string;
  languages: Record<string, number>;
  topics: string[];
  defaultBranch: string;
  framework?: string;
  packageManager?: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  structure: FileStructure[];
  readmeContent?: string;
  hasDockerfile: boolean;
  hasCICD: boolean;
  techStack: string[];
}

export interface FileStructure {
  path: string;
  type: 'file' | 'directory';
  size?: number;
  language?: string;
}

export class RepositoryService {
  constructor(
    private githubApi: GithubApi
  ) {}

  async getRepositoryContext(entity: Entity): Promise<RepositoryMetadata> {
    // Try multiple possible repository URL annotations
    const possibleUrlKeys = [
      'github.com/project-slug',
      'backstage.io/source-location',
      'github.com/repo-url',
      'backstage.io/github-url'
    ];

    let repoUrl: string | undefined;
    let owner: string = '';
    let repo: string = '';

    // Check each possible annotation
    for (const key of possibleUrlKeys) {
      const url = entity.metadata?.annotations?.[key];
      if (url) {
        if (key === 'backstage.io/source-location' && url.startsWith('url:')) {
          // Handle backstage source location format: url:https://github.com/owner/repo
          const githubUrl = url.replace('url:', '');
          const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
          if (match) {
            owner = match[1];
            repo = match[2];
            repoUrl = `${owner}/${repo}`;
            break;
          }
        } else if (url.includes('/')) {
          // Direct format: owner/repo
          const parts = url.split('/');
          if (parts.length >= 2) {
            owner = parts[parts.length - 2];
            repo = parts[parts.length - 1];
            repoUrl = `${owner}/${repo}`;
            break;
          }
        }
      }
    }

    // Fallback: try to derive from entity metadata
    if (!repoUrl && entity.metadata?.name) {
      // Use entity name as repo name and try to find owner
      repo = entity.metadata.name;
      owner = entity.metadata?.namespace || 'default';
      repoUrl = `${owner}/${repo}`;
      console.warn(`Repository URL not found in annotations, using fallback: ${repoUrl}`);
    }

    if (!repoUrl) {
      // Create a minimal context without GitHub API calls
      console.warn('No repository information found, creating minimal context');
      return {
        name: entity.metadata?.name || 'unknown',
        owner: 'unknown',
        fullName: 'unknown/unknown',
        description: entity.metadata?.description,
        language: 'unknown',
        languages: {},
        topics: [],
        defaultBranch: 'main',
        dependencies: {},
        devDependencies: {},
        scripts: {},
        structure: [],
        hasDockerfile: false,
        hasCICD: false,
        techStack: [],
      };
    }

    try {
      // Get repository information from GitHub
      const repoInfo = await this.githubApi.getRepository(owner, repo);
      const languages = await this.githubApi.getRepositoryLanguages(owner, repo);
      const contents = await this.githubApi.getRepositoryContents(owner, repo);
    
    // Analyze package.json if it exists
    let packageJson: any = {};
    let dependencies: Record<string, string> = {};
    let devDependencies: Record<string, string> = {};
    let scripts: Record<string, string> = {};
    let packageManager = 'npm';
    
    try {
      const packageJsonContent = await this.githubApi.getFileContent(owner, repo, 'package.json');
      if (packageJsonContent) {
        packageJson = JSON.parse(packageJsonContent);
        dependencies = packageJson.dependencies || {};
        devDependencies = packageJson.devDependencies || {};
        scripts = packageJson.scripts || {};
        
        // Detect package manager
        const hasYarnLock = contents.some((f: GitHubFileInfo) => f.path === 'yarn.lock');
        const hasPnpmLock = contents.some((f: GitHubFileInfo) => f.path === 'pnpm-lock.yaml');
        const hasPackageLock = contents.some((f: GitHubFileInfo) => f.path === 'package-lock.json');
        
        if (hasYarnLock) packageManager = 'yarn';
        else if (hasPnpmLock) packageManager = 'pnpm';
        else if (hasPackageLock) packageManager = 'npm';
      }
    } catch (error) {
      // package.json might not exist
    }

    // Get README content
    let readmeContent: string | undefined;
    try {
      readmeContent = await this.githubApi.getFileContent(owner, repo, 'README.md') ||
                     await this.githubApi.getFileContent(owner, repo, 'readme.md') ||
                     await this.githubApi.getFileContent(owner, repo, 'README.rst') ||
                     undefined;
    } catch (error) {
      // README might not exist
    }

    // Analyze file structure
    const structure: FileStructure[] = contents.map((item: GitHubFileInfo) => ({
      path: item.path,
      type: item.type === 'dir' ? 'directory' : 'file',
      size: item.size,
      language: this.detectLanguage(item.path)
    }));

    // Detect framework and tech stack
    const framework = this.detectFramework(packageJson, dependencies, structure);
    const techStack = this.analyzeTechStack(languages, dependencies, devDependencies, structure);

    // Check for important files
    const hasDockerfile = contents.some((f: GitHubFileInfo) => f.path === 'Dockerfile' || f.path.includes('docker'));
    const hasCICD = contents.some((f: GitHubFileInfo) => 
      f.path.includes('.github/workflows') || 
      f.path.includes('.gitlab-ci') || 
      f.path.includes('azure-pipelines') ||
      f.path.includes('bitbucket-pipelines.yml')
    );

    return {
      name: repo,
      owner,
      fullName: `${owner}/${repo}`,
      description: repoInfo.description || undefined,
      language: repoInfo.language || undefined,
      languages,
      topics: repoInfo.topics || [],
      defaultBranch: repoInfo.default_branch,
      framework,
      packageManager,
      dependencies,
      devDependencies,
      scripts,
      structure,
      readmeContent,
      hasDockerfile,
      hasCICD,
      techStack,
    };
    } catch (error) {
      console.error('Error fetching repository context from GitHub:', error);
      // Return minimal context on error
      return {
        name: repo,
        owner,
        fullName: `${owner}/${repo}`,
        description: entity.metadata?.description,
        language: 'unknown',
        languages: {},
        topics: [],
        defaultBranch: 'main',
        dependencies: {},
        devDependencies: {},
        scripts: {},
        structure: [],
        hasDockerfile: false,
        hasCICD: false,
        techStack: [],
      };
    }
  }

  private detectLanguage(filepath: string): string | undefined {
    const extension = filepath.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'jsx': 'JavaScript',
      'tsx': 'TypeScript',
      'py': 'Python',
      'java': 'Java',
      'go': 'Go',
      'rs': 'Rust',
      'php': 'PHP',
      'rb': 'Ruby',
      'cpp': 'C++',
      'c': 'C',
      'cs': 'C#',
      'swift': 'Swift',
      'kt': 'Kotlin',
      'scala': 'Scala',
      'sh': 'Shell',
      'dockerfile': 'Docker',
      'yaml': 'YAML',
      'yml': 'YAML',
      'json': 'JSON',
      'md': 'Markdown',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'sass': 'Sass',
    };
    return extension ? languageMap[extension] : undefined;
  }

  private detectFramework(_packageJson: any, dependencies: Record<string, string>, contents: FileStructure[]): string | undefined {
    // React
    if (dependencies.react) return 'React';
    if (dependencies['@angular/core']) return 'Angular';
    if (dependencies.vue) return 'Vue.js';
    if (dependencies.svelte) return 'Svelte';
    if (dependencies.next) return 'Next.js';
    if (dependencies.gatsby) return 'Gatsby';
    if (dependencies.nuxt) return 'Nuxt.js';
    
    // Backend frameworks
    if (dependencies.express) return 'Express.js';
    if (dependencies.fastify) return 'Fastify';
    if (dependencies.koa) return 'Koa.js';
    if (dependencies.nest || dependencies['@nestjs/core']) return 'NestJS';
    if (dependencies.django) return 'Django';
    if (dependencies.flask) return 'Flask';
    if (dependencies.spring) return 'Spring Boot';
    
    // Check for framework-specific files
    if (contents.some(f => f.path === 'angular.json')) return 'Angular';
    if (contents.some(f => f.path === 'vue.config.js')) return 'Vue.js';
    if (contents.some(f => f.path === 'svelte.config.js')) return 'Svelte';
    if (contents.some(f => f.path === 'next.config.js')) return 'Next.js';
    if (contents.some(f => f.path === 'gatsby-config.js')) return 'Gatsby';
    if (contents.some(f => f.path === 'nuxt.config.js')) return 'Nuxt.js';
    
    return undefined;
  }

  private analyzeTechStack(
    languages: Record<string, number>,
    dependencies: Record<string, string>,
    devDependencies: Record<string, string>,
    contents: FileStructure[]
  ): string[] {
    const techStack = new Set<string>();

    // Languages
    Object.keys(languages).forEach(lang => techStack.add(lang));

    // Databases
    if (dependencies.mongoose || dependencies.mongodb) techStack.add('MongoDB');
    if (dependencies.pg || dependencies.postgresql) techStack.add('PostgreSQL');
    if (dependencies.mysql || dependencies.mysql2) techStack.add('MySQL');
    if (dependencies.redis) techStack.add('Redis');
    if (dependencies.sqlite3) techStack.add('SQLite');

    // Cloud & Infrastructure
    if (contents.some(f => f.path.includes('terraform'))) techStack.add('Terraform');
    if (contents.some(f => f.path.includes('kubernetes') || f.path.includes('k8s'))) techStack.add('Kubernetes');
    if (contents.some(f => f.path === 'Dockerfile')) techStack.add('Docker');
    if (contents.some(f => f.path.includes('aws'))) techStack.add('AWS');
    if (contents.some(f => f.path.includes('gcp') || f.path.includes('google-cloud'))) techStack.add('Google Cloud');
    if (contents.some(f => f.path.includes('azure'))) techStack.add('Azure');

    // Testing
    if (dependencies.jest || devDependencies.jest) techStack.add('Jest');
    if (dependencies.mocha || devDependencies.mocha) techStack.add('Mocha');
    if (dependencies.cypress || devDependencies.cypress) techStack.add('Cypress');
    if (dependencies.playwright || devDependencies.playwright) techStack.add('Playwright');

    // Build tools
    if (dependencies.webpack || devDependencies.webpack) techStack.add('Webpack');
    if (dependencies.vite || devDependencies.vite) techStack.add('Vite');
    if (dependencies.rollup || devDependencies.rollup) techStack.add('Rollup');
    if (contents.some(f => f.path === 'tsconfig.json')) techStack.add('TypeScript');

    return Array.from(techStack);
  }

  generateContextPrompt(metadata: RepositoryMetadata): string {
    return `# Repository Context for ${metadata.fullName}

## Project Overview
- **Repository**: ${metadata.fullName}
- **Description**: ${metadata.description || 'No description available'}
- **Primary Language**: ${metadata.language || 'Not specified'}
- **Framework**: ${metadata.framework || 'Not detected'}
- **Package Manager**: ${metadata.packageManager}
- **Default Branch**: ${metadata.defaultBranch}

## Tech Stack
${metadata.techStack.map(tech => `- ${tech}`).join('\n')}

## Languages Distribution
${Object.entries(metadata.languages).map(([lang, bytes]) => `- ${lang}: ${((bytes / Object.values(metadata.languages).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%`).join('\n')}

## Dependencies
### Production Dependencies
${Object.entries(metadata.dependencies).slice(0, 10).map(([dep, version]) => `- ${dep}: ${version}`).join('\n')}
${Object.keys(metadata.dependencies).length > 10 ? `... and ${Object.keys(metadata.dependencies).length - 10} more` : ''}

### Development Dependencies
${Object.entries(metadata.devDependencies).slice(0, 10).map(([dep, version]) => `- ${dep}: ${version}`).join('\n')}
${Object.keys(metadata.devDependencies).length > 10 ? `... and ${Object.keys(metadata.devDependencies).length - 10} more` : ''}

## Available Scripts
${Object.entries(metadata.scripts).map(([script, command]) => `- ${script}: \`${command}\``).join('\n')}

## Project Structure Highlights
${metadata.structure.filter(f => f.type === 'file' && this.isImportantFile(f.path)).slice(0, 20).map(f => `- ${f.path} (${f.language || 'Unknown'})`).join('\n')}

## Infrastructure & DevOps
- **Has Dockerfile**: ${metadata.hasDockerfile ? 'Yes' : 'No'}
- **Has CI/CD**: ${metadata.hasCICD ? 'Yes' : 'No'}
- **Topics**: ${metadata.topics.join(', ') || 'None'}

## README Content (First 500 chars)
${metadata.readmeContent?.substring(0, 500) || 'No README available'}${metadata.readmeContent && metadata.readmeContent.length > 500 ? '...' : ''}

---
Use this context to generate relevant and accurate code that fits the project's architecture, follows its conventions, and integrates well with the existing tech stack.`;
  }

  private isImportantFile(path: string): boolean {
    const importantPatterns = [
      /package\.json$/,
      /tsconfig\.json$/,
      /\.env/,
      /docker/i,
      /readme/i,
      /license/i,
      /changelog/i,
      /\.config\./,
      /\.yml$/,
      /\.yaml$/,
      /Makefile$/,
      /\.md$/,
      /src\//,
      /lib\//,
      /test\//,
      /spec\//,
    ];
    
    return importantPatterns.some(pattern => pattern.test(path)) ||
           path.split('/').length <= 2; // Top-level files
  }
}
