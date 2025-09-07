// import { DirectoryPicker } from '../DirectoryPicker'; // Commented out - not used currently
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Page,
  Header,
  Content,
  SupportButton,
} from '@backstage/core-components';
import { useApi, configApiRef, githubAuthApiRef } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import {
  Typography,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  FolderOpen as ExplorerIcon,
  Chat as ChatIcon,
  AccountTree as WorkspaceIcon,
  InsertDriveFile as FileIcon,
  Build as CicdIcon,
  Storage as DockerIcon,
  CloudQueue as TerraformIcon,
  Settings as ConfigIcon,
  Code as CodeFileIcon,
  Description as DocumentIcon,
  Add as NewIcon,
  BubbleChart as ZenOpsAiIcon,
  Edit as ManualIcon,
} from '@material-ui/icons';
import { ChatInterface } from '../ChatInterface';
import { FileWorkspaceManager, FileState, FileWorkspaceManagerHandle } from '../FileWorkspace/FileWorkspaceManager';
import { RepositorySelector } from '../RepositorySelector';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@material-ui/core';


const useStyles = makeStyles(() => ({
  root: {
    height: '100vh',
    width: '100%',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1e1e1e', // VS Code dark background
    color: '#cccccc',
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    overflow: 'hidden', // Prevent page scrolling
    '& .MuiContainer-root': {
      padding: 0,
      margin: 0,
      maxWidth: 'none',
    },
    // Global scrollbar styling for consistency
    '& *::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '& *::-webkit-scrollbar-track': {
      background: '#2d2d30',
    },
    '& *::-webkit-scrollbar-thumb': {
      background: '#464647',
      borderRadius: '4px',
      '&:hover': {
        background: '#505050',
      },
    },
    '& *::-webkit-scrollbar-corner': {
      background: '#2d2d30',
    },
  },
  content: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    margin: 0,
    padding: 0,
    height: 'calc(100vh - 64px)', // Account for header height
    '& > div': {
      padding: 0,
      margin: 0,
    },
  },
  // VS Code style three-panel layout
  vsCodeLayout: {
    display: 'flex',
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  fileExplorer: {
    width: '320px',
    backgroundColor: '#252526',
    borderRight: '1px solid #2d2d30',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  workspace: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    minWidth: 0, // Important for flex children to shrink properly
    maxWidth: '100%',
  },
  aiChat: {
    width: '360px',
    backgroundColor: '#252526',
    borderLeft: '1px solid #2d2d30',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  chatHistory: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 0 8px 0',
    height: '100%', // Fill available space
  },
  chatInput: {
    borderTop: '1px solid #2d2d30',
    backgroundColor: '#252526',
    padding: '12px',
    height: '60px',
    flexShrink: 0, // Don't shrink
  },
    prButtonFixed: {
      backgroundColor: '#252526',
      padding: '12px',
      borderTop: '1px solid #2d2d30',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '50px',
      flexShrink: 0, // Don't shrink
    },
    stagedFilesScrollable: {
      flex: 1, // Equal space with repo files
      overflowY: 'auto',
      padding: 8,
      minHeight: 0, // Allow shrinking
    },
    repoFilesScrollable: {
      flex: 1, // Equal space with staged files
      overflowY: 'auto',
      padding: 8,
      minHeight: 0, // Allow shrinking
    },
  // Panel headers
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    backgroundColor: '#252526',
    borderBottom: '1px solid #2d2d30',
    fontSize: '13px',
    fontWeight: 600,
    color: '#cccccc',
    minHeight: 35,
    '& .MuiSvgIcon-root': {
      fontSize: 16,
      color: '#cccccc',
    },
  },
  panelContent: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    maxWidth: '100%',
    minWidth: 0, // Important for flex children to shrink properly
  },
  explorerBody: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    minHeight: 0, // Allow shrinking
  },
  // Repository selector in explorer
  repositorySection: {
    padding: 12,
    borderBottom: '1px solid #2d2d30',
    backgroundColor: '#252526',
  },
  // Welcome states
  welcomeMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: 32,
    textAlign: 'center',
    color: '#969696',
    '& .MuiSvgIcon-root': {
      fontSize: 64,
      color: '#525252',
      marginBottom: 16,
    },
  },
  welcomeTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#cccccc',
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: '14px',
    lineHeight: 1.5,
    maxWidth: 300,
    color: '#969696',
  },
  // Resize handles
  resizeHandle: {
    width: 4,
    backgroundColor: 'transparent',
    cursor: 'col-resize',
    position: 'relative',
    '&:hover': {
      backgroundColor: '#007acc',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 1,
      height: '100%',
      backgroundColor: '#2d2d30',
    },
  },
  // Activity indicator
  activityIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '12px',
    color: '#969696',
    padding: '4px 12px',
    backgroundColor: '#252526',
    borderTop: '1px solid #2d2d30',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: '#89d185', // VS Code success green
  },
  // Files list styles
  filesList: {
    padding: 8,
    overflowY: 'auto',
    flex: 1,
  },
  fileItem: {
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: 4,
    marginBottom: 4,
    '&:hover': {
      backgroundColor: '#2a2d2e',
    },
  },
  fileName: {
    fontSize: '13px',
    color: '#cccccc',
    fontWeight: 500,
    marginBottom: 2,
  },
  filePath: {
    fontSize: '11px',
    color: '#969696',
    fontFamily: 'monospace',
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
    color: '#969696',
    fontSize: '13px',
  },
  emptyState: {
    padding: '20px',
    textAlign: 'center',
    color: '#969696',
    fontSize: '13px',
  },
  sectionSubheader: {
    padding: '6px 12px',
    fontSize: '12px',
    color: '#969696',
    borderTop: '1px solid #2d2d30',
    borderBottom: '1px solid #2d2d30',
    backgroundColor: '#252526',
  },
  aiChangesList: {
    padding: 8,
    overflowY: 'auto',
    maxHeight: 200,
  },
  checkbox: {
    marginRight: 8,
  },
  prFooter: {
    padding: '8px 12px',
    borderTop: '1px solid #2d2d30',
    backgroundColor: '#252526',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
}));

interface Repository {
  name: string;
  owner: string;
  defaultBranch: string;
  entity?: Entity;
}

interface ExistingFile {
  path: string;
  type: 'dockerfile' | 'ci-cd' | 'terraform' | 'helm' | 'other';
  content?: string;
}

export const AiAssistantPage = () => {
  const classes = useStyles();
  const workspaceRef = useRef<FileWorkspaceManagerHandle | null>(null);
  const catalogApi = useApi(catalogApiRef);
  const configApi = useApi(configApiRef);
  const githubAuthApi = useApi(githubAuthApiRef);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [branches, setBranches] = useState<string[]>([]);
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [repositoriesLoading, setRepositoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [aiGeneratedFiles, setAiGeneratedFiles] = useState<Array<{ path: string; content: string; isNew: boolean; originalContent?: string }>>([]);
  // const [pendingAIFile, setPendingAIFile] = useState<{ content: string; name: string } | null>(null); // Commented out - not used currently
  // const [showDirectoryPicker, setShowDirectoryPicker] = useState(false); // Commented out - not used currently
  // const [repoDirectories, setRepoDirectories] = useState<string[]>([]); // Commented out - not used
  const [selectedAIPaths, setSelectedAIPaths] = useState<Set<string>>(new Set());
  const [selectedRepoPaths, setSelectedRepoPaths] = useState<Set<string>>(new Set());
  const [creatingPR, setCreatingPR] = useState(false);
  const [manuallyEditedFiles, setManuallyEditedFiles] = useState<Map<string, { content: string; isNew: boolean }>>(new Map());
  const [selectedManualPaths, setSelectedManualPaths] = useState<Set<string>>(new Set());
  // Read GitHub token from app config: aiAssistant.githubToken; prefer OAuth over PAT
  const githubTokenFromConfig = configApi.getOptionalString('aiAssistant.githubToken');
  const [oauthToken, setOauthToken] = useState<string | undefined>(undefined);
  const effectiveGithubToken = oauthToken || githubTokenFromConfig;

  // Auto-request OAuth token on component mount if no token configured
  useEffect(() => {
    if (!githubTokenFromConfig) {
      requestGithubToken();
    }
  }, [githubTokenFromConfig]);

  const requestGithubToken = async () => {
    try {
      // Request both 'repo' and 'workflow' scopes for full GitHub Actions support
      const token = await githubAuthApi.getAccessToken(['repo', 'workflow']);
      setOauthToken(token);
      setError(null);
    } catch (e) {
      console.warn('GitHub OAuth token request failed', e);
      setError('GitHub sign-in failed or was cancelled.');
    }
  };

  // Fetch repositories from Backstage catalog
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setRepositoriesLoading(true);
        const entities = await catalogApi.getEntities({
          filter: { kind: 'Component' },
        });

        const repoList: Repository[] = entities.items
          .filter((entity: Entity) => {
            // Filter for entities that have source location (repository)
            return entity.metadata?.annotations?.['backstage.io/source-location'];
          })
          .map((entity: Entity) => {
            const sourceLocation = entity.metadata?.annotations?.['backstage.io/source-location'];
            if (sourceLocation) {
              // Parse GitHub URL - format: url:https://github.com/owner/repo
              const match = sourceLocation.match(/github\.com\/([^\/]+)\/([^\/]+)/);
              if (match) {
                const [, owner, repoName] = match;
                return {
                  name: repoName.replace(/\.git$/, ''), // Remove .git suffix if present
                  owner,
                  defaultBranch: 'main', // Default to main, could be enhanced to fetch actual default branch
                  entity,
                };
              }
            }
            
            // Fallback: use entity name
            return {
              name: entity.metadata.name,
              owner: entity.metadata.namespace || 'default',
              defaultBranch: 'main',
              entity,
            };
          });

        setRepositories(repoList);
      } catch (err) {
        setError('Failed to fetch repositories from catalog');
        console.error('Error fetching repositories:', err);
      } finally {
        setRepositoriesLoading(false);
      }
    };

    fetchRepositories();
  }, [catalogApi]);

  const handleRepositorySelect = async (repo: Repository, branch: string) => {
    setSelectedRepo(repo);
    setSelectedBranch(branch);
    setLoading(true);
    setError(null);
    try {
      // Fetch branches from GitHub
      const fetchedBranches = await fetchBranches(repo);
      setBranches(fetchedBranches);
      
      // If the selected branch is not in the fetched branches, use the first available branch
      const actualBranch = fetchedBranches.includes(branch) ? branch : (fetchedBranches[0] || 'main');
      setSelectedBranch(actualBranch);
      
      // Check repository permissions if we have a token
      if (effectiveGithubToken) {
        try {
          const repoResponse = await fetch(
            `https://api.github.com/repos/${repo.owner}/${repo.name}`,
            {
              headers: {
                'Authorization': `Bearer ${effectiveGithubToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (repoResponse.ok) {
            const repoData = await repoResponse.json();
            if (!repoData.permissions?.push) {
              setError(`Warning: No write access to ${repo.owner}/${repo.name}. PR creation will not work. Token needs 'repo' scope with write permissions.`);
            }
          }
        } catch (permError) {
          console.warn('Could not check repository permissions:', permError);
        }
      }
      
      // Fetch files from GitHub
      const files = await fetchExistingFiles(repo, actualBranch, true); // Always show all files
      setExistingFiles(files);
    } catch (err) {
      setError('Failed to fetch repository contents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch branches from GitHub
  const fetchBranches = async (repo: Repository): Promise<string[]> => {
    try {
      const apiUrl = `https://api.github.com/repos/${repo.owner}/${repo.name}/branches`;
      const headers: HeadersInit = effectiveGithubToken ? { Authorization: `Bearer ${effectiveGithubToken}` } : {};
      const response = await fetch(apiUrl, { headers });
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Repository ${repo.owner}/${repo.name} not found or not accessible`);
          return ['main'];
        }
        if (response.status === 403) {
          console.warn(`Access denied to repository ${repo.owner}/${repo.name}. Check GitHub token permissions.`);
          return ['main'];
        }
        throw new Error(`Failed to fetch branches: ${response.status}`);
      }
      const data = await response.json();
      return data.map((b: any) => b.name);
    } catch (err) {
      console.error('Error fetching branches:', err);
      return ['main'];
    }
  };

  // Fetch files from GitHub
  const fetchExistingFiles = async (repo: Repository, branch: string, showAll: boolean = false): Promise<ExistingFile[]> => {
    try {
      const apiUrl = `https://api.github.com/repos/${repo.owner}/${repo.name}/git/trees/${branch}?recursive=1`;
      const headers: HeadersInit = effectiveGithubToken ? { Authorization: `Bearer ${effectiveGithubToken}` } : {};
      const response = await fetch(apiUrl, { headers });
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Repository ${repo.owner}/${repo.name} or branch ${branch} not found`);
          return [];
        }
        if (response.status === 403) {
          console.warn(`Access denied to repository ${repo.owner}/${repo.name}. Check GitHub token permissions.`);
          return [];
        }
        throw new Error(`Failed to fetch files: ${response.status}`);
      }
      const data = await response.json();
      if (!data.tree) return [];
      let files = data.tree
        .filter((item: any) => item.type === 'blob')
        .filter((item: any) => {
          const path = item.path.toLowerCase();
          const fileName = item.path.split('/').pop()?.toLowerCase() || '';
          
          // EXCLUDE: Common directories that bloat the results
          if (path.includes('node_modules/') ||
              path.includes('.git/') ||
              path.includes('dist/') ||
              path.includes('build/') ||
              path.includes('coverage/') ||
              path.includes('.next/') ||
              path.includes('.nuxt/') ||
              path.includes('vendor/') ||
              path.includes('target/') ||
              path.includes('bin/') ||
              path.includes('obj/') ||
              path.includes('packages/') ||
              path.includes('libs/') ||
              path.includes('assets/') ||
              path.includes('public/') ||
              path.includes('static/') ||
              path.includes('images/') ||
              path.includes('img/') ||
              path.includes('fonts/') ||
              path.includes('icons/') ||
              path.includes('docs/') ||
              path.includes('documentation/')) {
            return false;
          }
          
          // EXCLUDE: Source code files (not DevOps related)
          if (path.endsWith('.js') ||
              path.endsWith('.ts') ||
              path.endsWith('.tsx') ||
              path.endsWith('.jsx') ||
              path.endsWith('.py') ||
              path.endsWith('.java') ||
              path.endsWith('.cs') ||
              path.endsWith('.cpp') ||
              path.endsWith('.c') ||
              path.endsWith('.php') ||
              path.endsWith('.rb') ||
              path.endsWith('.go') ||
              path.endsWith('.rs') ||
              path.endsWith('.swift') ||
              path.endsWith('.kt')) {
            // Exception: Keep important config files even if they have code extensions
            if (fileName === 'webpack.config.js' ||
                fileName === 'next.config.js' ||
                fileName === 'nuxt.config.js' ||
                fileName === 'vue.config.js' ||
                fileName === 'vite.config.js' ||
                fileName === 'jest.config.js' ||
                fileName === 'babel.config.js' ||
                fileName === 'tailwind.config.js' ||
                fileName === 'postcss.config.js' ||
                fileName.includes('config.') ||
                fileName.includes('settings.') ||
                fileName === 'main.go' ||
                fileName === 'manage.py' ||
                fileName === 'wsgi.py' ||
                fileName === 'asgi.py' ||
                fileName === 'setup.py') {
              return true;
            }
            return false;
          }
          
          // EXCLUDE: UI/Frontend files
          if (path.endsWith('.html') ||
              path.endsWith('.css') ||
              path.endsWith('.scss') ||
              path.endsWith('.sass') ||
              path.endsWith('.less') ||
              path.endsWith('.svg') ||
              path.endsWith('.png') ||
              path.endsWith('.jpg') ||
              path.endsWith('.jpeg') ||
              path.endsWith('.gif') ||
              path.endsWith('.ico') ||
              path.endsWith('.woff') ||
              path.endsWith('.woff2') ||
              path.endsWith('.ttf') ||
              path.endsWith('.eot')) {
            return false;
          }
          
          return true;
        })
        .map((item: any) => ({
          path: item.path,
          type: classifyFileType(item.path),
        }));
      if (!showAll) {
        files = files.filter((file: ExistingFile) =>
          ['dockerfile', 'ci-cd', 'terraform', 'helm'].includes(file.type)
        );
      }

      // Load content for DevOps and operational files only
      const filesToLoadContent = files
        .filter((file: ExistingFile) => {
          const fileName = file.path.split('/').pop()?.toLowerCase() || '';
          const filePath = file.path.toLowerCase();
          
          // PRIORITY 1: Core DevOps/Infrastructure files
          if (['dockerfile', 'ci-cd', 'terraform', 'helm'].includes(file.type)) {
            return true;
          }
          
          // PRIORITY 2: Essential build and package files
          if (fileName === 'package.json' || 
              fileName === 'pom.xml' ||
              fileName === 'build.gradle' ||
              fileName === 'go.mod' ||
              fileName === 'cargo.toml' ||
              fileName === 'requirements.txt' ||
              fileName === 'composer.json' ||
              fileName === 'gemfile' ||
              fileName === 'poetry.lock' ||
              fileName === 'yarn.lock' ||
              fileName === 'package-lock.json') {
            return true;
          }
          
          // PRIORITY 3: Application configuration files
          if (fileName === 'appsettings.json' ||
              fileName === 'app.config' ||
              fileName === 'web.config' ||
              fileName === 'application.properties' ||
              fileName === 'application.yml' ||
              fileName === 'application.yaml' ||
              fileName.includes('appsettings') ||
              fileName.includes('application-')) {
            return true;
          }
          
          // PRIORITY 4: Environment and deployment configs
          if (fileName === '.env' ||
              fileName === '.env.example' ||
              fileName === '.env.local' ||
              fileName === '.env.dev' ||
              fileName === '.env.development' ||
              fileName === '.env.staging' ||
              fileName === '.env.prod' ||
              fileName === '.env.production' ||
              fileName === 'docker-compose.yml' ||
              fileName === 'docker-compose.yaml' ||
              fileName === 'nginx.conf' ||
              fileName === 'apache.conf' ||
              fileName.includes('docker-compose')) {
            return true;
          }
          
          // PRIORITY 5: Infrastructure and DevOps scripts
          if (fileName.endsWith('.sh') ||
              fileName.endsWith('.bat') ||
              fileName.endsWith('.ps1') ||
              fileName.includes('setup-') ||
              fileName.includes('deploy') ||
              fileName.includes('build') ||
              fileName.includes('install') ||
              fileName.includes('pipeline') ||
              fileName.includes('workflow')) {
            return true;
          }
          
          // PRIORITY 6: Documentation and metadata (DevOps related)
          if (fileName === 'readme.md' ||
              fileName === 'catalog-info.yaml' ||
              fileName === 'catalog-info.yml' ||
              fileName.includes('readme') ||
              fileName.includes('guide') ||
              fileName.includes('manual')) {
            return true;
          }
          
          // PRIORITY 7: Any config files (regardless of depth for comprehensive coverage)
          if (fileName.includes('config') ||
              fileName.includes('settings') ||
              fileName.endsWith('.yml') ||
              fileName.endsWith('.yaml') ||
              fileName.endsWith('.toml') ||
              fileName.endsWith('.ini') ||
              fileName.endsWith('.conf') ||
              filePath.includes('config/') ||
              filePath.includes('configs/') ||
              filePath.includes('configuration/')) {
            return true;
          }
          
          // PRIORITY 8: CI/CD and workflow files (any depth)
          if (filePath.includes('workflow') ||
              filePath.includes('pipeline') ||
              filePath.includes('ci-cd') ||
              filePath.includes('.github/') ||
              filePath.includes('.gitlab/') ||
              filePath.includes('jenkins') ||
              filePath.includes('azure-pipelines')) {
            return true;
          }
          
          // PRIORITY 9: Infrastructure directories (any depth)
          if (filePath.includes('infrastructure/') ||
              filePath.includes('infra/') ||
              filePath.includes('deploy/') ||
              filePath.includes('deployment/') ||
              filePath.includes('k8s/') ||
              filePath.includes('kubernetes/') ||
              filePath.includes('helm/') ||
              filePath.includes('terraform/')) {
            return true;
          }
          
          return false;
        });

      const filesWithContent = await Promise.all(
        filesToLoadContent.map(async (file: ExistingFile) => {
          try {
            const contentUrl = `https://api.github.com/repos/${repo.owner}/${repo.name}/contents/${file.path}?ref=${branch}`;
            const contentResponse = await fetch(contentUrl, { headers });
            if (contentResponse.ok) {
              const contentData = await contentResponse.json();
              if (contentData.content) {
                const content = atob(contentData.content.replace(/\n/g, ''));
                return { ...file, content };
              }
            }
            return file;
          } catch (error) {
            console.warn(`Failed to load content for ${file.path}:`, error);
            return file;
          }
        })
      );

      return filesWithContent;
    } catch (err) {
      console.error('Error fetching files:', err);
      return [];
    }
  };

  // Helper to classify file types
  const classifyFileType = (path: string): ExistingFile['type'] => {
    const lower = path.toLowerCase();
    const fileName = path.split('/').pop()?.toLowerCase() || '';
    
    // Docker files
    if (fileName === 'dockerfile' || fileName.includes('dockerfile') || lower.includes('docker-compose')) return 'dockerfile';
    
    // CI/CD files
    if (lower.includes('.github/workflows/') || 
        lower.includes('.gitlab-ci') || 
        lower.includes('jenkins') ||
        lower.includes('azure-pipelines') ||
        lower.includes('buildspec') ||
        fileName.includes('pipeline') ||
        fileName.includes('workflow') ||
        fileName === '.travis.yml' ||
        fileName === 'circle.yml' ||
        fileName === '.circleci') return 'ci-cd';
    
    // Infrastructure as Code
    if (lower.match(/\.tf$/) || 
        lower.match(/\.tfvars$/) ||
        lower.includes('terraform') ||
        lower.includes('pulumi') ||
        fileName.includes('infrastructure') ||
        fileName.includes('infra')) return 'terraform';
    
    // Kubernetes & Helm
    if (lower.includes('helm') || 
        lower.includes('k8s') ||
        lower.includes('kubernetes') ||
        fileName.match(/values\.ya?ml$/) || 
        fileName.match(/chart\.ya?ml$/) ||
        fileName.includes('deployment') ||
        fileName.includes('service.yaml') ||
        fileName.includes('ingress.yaml') ||
        fileName.includes('configmap') ||
        fileName.includes('secret.yaml')) return 'helm';
    
    return 'other';
  };

  // Helper to get file icon based on path and type
  const getFileIcon = (path: string, fileType?: ExistingFile['type']) => {
    const lower = path.toLowerCase();
    const fileName = path.split('/').pop()?.toLowerCase() || '';
    const type = fileType || classifyFileType(path);
    
    // Docker files
    if (type === 'dockerfile' || fileName.includes('dockerfile') || fileName.includes('docker-compose')) {
      return <DockerIcon style={{ fontSize: 16, color: '#0db7ed', marginRight: 8 }} />;
    }
    
    // CI/CD files
    if (type === 'ci-cd' || lower.includes('workflow') || lower.includes('.github') || 
        fileName.includes('pipeline') || fileName.includes('jenkins') || fileName.includes('ci')) {
      return <CicdIcon style={{ fontSize: 16, color: '#f39c12', marginRight: 8 }} />;
    }
    
    // Infrastructure as Code
    if (type === 'terraform' || lower.endsWith('.tf') || lower.includes('terraform') || 
        fileName.includes('infrastructure') || fileName.includes('infra')) {
      return <TerraformIcon style={{ fontSize: 16, color: '#7c3aed', marginRight: 8 }} />;
    }
    
    // Kubernetes/Helm files
    if (type === 'helm' || lower.includes('helm') || lower.includes('k8s') || 
        fileName.includes('deployment') || fileName.includes('service.yaml')) {
      return <TerraformIcon style={{ fontSize: 16, color: '#326ce5', marginRight: 8 }} />;
    }
    
    // Configuration files
    if (lower.endsWith('.json') || lower.endsWith('.yaml') || lower.endsWith('.yml') ||
        fileName.includes('config') || fileName === '.env' || fileName.includes('settings') ||
        fileName === 'package.json' || fileName === 'tsconfig.json') {
      return <ConfigIcon style={{ fontSize: 16, color: '#10b981', marginRight: 8 }} />;
    }
    
    // Code files
    if (lower.endsWith('.js') || lower.endsWith('.ts') || lower.endsWith('.tsx') || 
        lower.endsWith('.jsx') || lower.endsWith('.py') || lower.endsWith('.go') || 
        lower.endsWith('.java') || lower.endsWith('.cs')) {
      return <CodeFileIcon style={{ fontSize: 16, color: '#fbbf24', marginRight: 8 }} />;
    }
    
    // Documentation
    if (lower.endsWith('.md') || lower.endsWith('.txt') || lower.endsWith('.rst') || 
        fileName === 'readme.md' || fileName.includes('doc')) {
      return <DocumentIcon style={{ fontSize: 16, color: '#64748b', marginRight: 8 }} />;
    }
    
    return <FileIcon style={{ fontSize: 16, color: '#9ca3af', marginRight: 8 }} />;
  };

  // Handle manual file saves - track them for PR inclusion
  const handleFileSave = useCallback((filePath: string, content: string, isNew: boolean) => {
    setManuallyEditedFiles(prev => {
      const newMap = new Map(prev);
      newMap.set(filePath, { content, isNew });
      return newMap;
    });
  }, []);

  const handleChatResponse = (response: any) => {
    // Add AI-generated files to the workspace
    if (response.files && response.files.length > 0) {
      const newFiles = response.files.map((file: any) => {
        const isExistingFile = existingFiles.some(ef => ef.path === file.path);
        return {
          path: file.path,
          content: file.content,
          isNew: !isExistingFile,
          // Store original content for diff comparison
          originalContent: isExistingFile 
            ? existingFiles.find(ef => ef.path === file.path)?.content || ''
            : ''
        };
      });
      
      setAiGeneratedFiles(prev => {
        const fileMap = new Map();
        // Preserve existing files but update with new AI content
        prev.forEach(f => fileMap.set(f.path, f));
        newFiles.forEach((f: any) => {
          const existingAIFile = fileMap.get(f.path);
          fileMap.set(f.path, {
            ...f,
            // Preserve original content if it exists from previous AI generations
            originalContent: existingAIFile?.originalContent || f.originalContent
          });
        });
        const merged = Array.from(fileMap.values());
        // Auto-select only new AI files for PR, preserve existing selections
        setSelectedAIPaths(prev => {
          const newPaths = new Set(prev);
          newFiles.forEach((f: any) => newPaths.add(f.path));
          return newPaths;
        });
        return merged;
      });
    }
  };

  const handleFilesGenerated = (files: any[], request: any) => {
    // Legacy support for existing functionality - could be removed if not needed
    console.log('Files generated:', files.length, 'Request:', request);
  };

  const handleOpenFileFromChat = (filePath: string) => {
    // Open file in workspace from chat interface
    if (workspaceRef.current) {
      workspaceRef.current.openFile(filePath);
    }
  };

  const handleCreatePR = async (selectedFiles: FileState[]) => {
    if (!selectedRepo || !effectiveGithubToken) {
      setError('GitHub token is required to create PRs. Use Sign in to GitHub or add aiAssistant.githubToken to app-config.');
      return;
    }

    try {
      const branchName = `ai-assistant-updates-${Date.now()}`;
      const commitMessage = `ZenOps AI: Update files (${selectedFiles.length} files)`;
      
      // First, check if we have push access to the repository
      const repoResponse = await fetch(
        `https://api.github.com/repos/${selectedRepo.owner}/${selectedRepo.name}`,
        {
          headers: {
            'Authorization': `Bearer ${effectiveGithubToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!repoResponse.ok) {
        const errorText = await repoResponse.text();
        throw new Error(`Cannot access repository: ${repoResponse.status} - ${errorText}`);
      }

      const repoData = await repoResponse.json();
      if (!repoData.permissions?.push) {
        throw new Error(`No push permission to repository ${selectedRepo.owner}/${selectedRepo.name}. Token needs 'repo' or 'public_repo' scope with write access.`);
      }
      
      // Create a new branch
      const createBranchResponse = await fetch(
        `https://api.github.com/repos/${selectedRepo.owner}/${selectedRepo.name}/git/refs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveGithubToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ref: `refs/heads/${branchName}`,
            sha: await getLatestCommitSha(selectedRepo, selectedBranch),
          }),
        }
      );

      if (!createBranchResponse.ok) {
        const errorText = await createBranchResponse.text();
        let errorData: any = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        // Handle OAuth App restrictions specifically
        if (createBranchResponse.status === 403 && 
            errorData.message?.includes('OAuth App access restrictions')) {
          const restrictionMessage = 'Organization has OAuth App access restrictions enabled. Please sign in with GitHub OAuth for full access.';
          setError(restrictionMessage);
          throw new Error(`Failed to create branch: ${restrictionMessage}`);
        }
        
        throw new Error(`Failed to create branch: ${createBranchResponse.status} - ${errorText}`);
      }

      // Create or update files
      for (const file of selectedFiles) {
        // For new files, don't include SHA. For existing files, include SHA
        let requestBody: any = {
          message: `${commitMessage} - ${file.path}`,
          content: btoa(file.content),
          branch: branchName,
        };

        // Only add SHA for existing files (files that have originalContent)
        if (file.originalContent && !file.isNew) {
          try {
            const sha = await getFileSha(selectedRepo, file.path, selectedBranch);
            requestBody.sha = sha;
          } catch (error) {
            console.warn(`Could not get SHA for ${file.path}, treating as new file:`, error);
          }
        }

        const fileResponse = await fetch(
          `https://api.github.com/repos/${selectedRepo.owner}/${selectedRepo.name}/contents/${file.path}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${effectiveGithubToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!fileResponse.ok) {
          const errorText = await fileResponse.text();
          throw new Error(`Failed to update file ${file.path}: ${fileResponse.status} - ${errorText}`);
        }
      }

      // Create pull request
      const prResponse = await fetch(
        `https://api.github.com/repos/${selectedRepo.owner}/${selectedRepo.name}/pulls`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveGithubToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: commitMessage,
            head: branchName,
            base: selectedBranch,
            body: `AI-generated pull request with ${selectedFiles.length} file updates:\n\n${selectedFiles.map(f => `- ${f.path}`).join('\n')}`,
          }),
        }
      );

      if (!prResponse.ok) {
        const errorText = await prResponse.text();
        throw new Error(`Failed to create pull request: ${prResponse.status} - ${errorText}`);
      }

      const prData = await prResponse.json();
      console.log('Pull request created:', prData.html_url);
      setError(null); // Clear any previous errors
      
    } catch (error) {
      console.error('PR creation failed:', error);
      let errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide specific guidance for OAuth App restrictions
      if (errorMessage.includes('OAuth App access restrictions') || 
          errorMessage.includes('Organization has OAuth App access restrictions')) {
        errorMessage = `${errorMessage}\n\nTo resolve this:\n1. Click "Sign in with GitHub" to use OAuth authentication\n2. Or ask your organization admin to enable OAuth App access for this application`;
      }
      
      setError(`Failed to create PR: ${errorMessage}`);
      throw error;
    }
  };

  const handleAIEdit = async (_filePath: string, content: string, instruction: string): Promise<string> => {
    // TODO: Implement AI edit functionality via ChatInterface
    // For now, return the original content with a comment
    return `${content}\n\n// AI Edit Request: ${instruction}`;
  };

  // Create PR from selected files
  const handleCreatePRSelection = async (branchName: string, commitMessage: string) => {
    if (!selectedRepo || !effectiveGithubToken) {
      setError('GitHub token is required to create PRs. Use Sign in to GitHub or add aiAssistant.githubToken to app-config.');
      return;
    }

    setCreatingPR(true);
    try {
      // First, check if we have push access to the repository
      const repoResponse = await fetch(
        `https://api.github.com/repos/${selectedRepo.owner}/${selectedRepo.name}`,
        {
          headers: {
            'Authorization': `Bearer ${effectiveGithubToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!repoResponse.ok) {
        const errorText = await repoResponse.text();
        throw new Error(`Cannot access repository: ${repoResponse.status} - ${errorText}`);
      }

      const repoData = await repoResponse.json();
      if (!repoData.permissions?.push) {
        throw new Error(`No push permission to repository ${selectedRepo.owner}/${selectedRepo.name}. Token needs 'repo' or 'public_repo' scope with write access.`);
      }
      
      // Create a new branch
      const createBranchResponse = await fetch(
        `https://api.github.com/repos/${selectedRepo.owner}/${selectedRepo.name}/git/refs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveGithubToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ref: `refs/heads/${branchName}`,
            sha: await getLatestCommitSha(selectedRepo, selectedBranch),
          }),
        }
      );

      if (!createBranchResponse.ok) {
        const errorText = await createBranchResponse.text();
        let errorData: any = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        // Handle OAuth App restrictions specifically
        if (createBranchResponse.status === 403 && 
            errorData.message?.includes('OAuth App access restrictions')) {
          const restrictionMessage = 'Organization has OAuth App access restrictions enabled. Please sign in with GitHub OAuth for full access.';
          setError(restrictionMessage);
          throw new Error(`Failed to create branch: ${restrictionMessage}`);
        }
        
        throw new Error(`Failed to create branch: ${createBranchResponse.status} - ${errorText}`);
      }

      // Collect all files, avoiding duplicates (manual edits override AI files)
      const allFiles = new Map<string, FileState>();

      // First add AI-generated files
      Array.from(selectedAIPaths).forEach(path => {
        const aiFile = aiGeneratedFiles.find(f => f.path === path);
        if (aiFile) {
          allFiles.set(path, {
            path: aiFile.path,
            content: aiFile.content,
            originalContent: undefined,
            isModified: true,
            isAIGenerated: true,
            isSelected: true,
            isNew: !!aiFile.isNew,
            lastModified: new Date(),
          });
        }
      });

      // Add selected repository files
      for (const path of Array.from(selectedRepoPaths)) {
        const ef = existingFiles.find(e => e.path === path);
        if (!ef) continue;
        let content = ef.content;
        if (!content) {
          try {
            const headers: HeadersInit = effectiveGithubToken ? { Authorization: `Bearer ${effectiveGithubToken}` } : {};
            const url = `https://api.github.com/repos/${selectedRepo.owner}/${selectedRepo.name}/contents/${path}?ref=${selectedBranch}`;
            const res = await fetch(url, { headers });
            if (res.ok) {
              const data = await res.json();
              content = atob((data.content || '').replace(/\n/g, ''));
            }
          } catch (e) {
            console.warn('Failed to fetch content for', path, e);
          }
        }
        if (content != null) {
          allFiles.set(path, {
            path,
            content,
            originalContent: content,
            isModified: true,
            isAIGenerated: false,
            isSelected: true,
            isNew: false,
            lastModified: new Date(),
          });
        }
      }

      // Add manually edited files (these override AI files if same path)
      Array.from(selectedManualPaths).forEach(path => {
        const fileInfo = manuallyEditedFiles.get(path);
        if (fileInfo) {
          allFiles.set(path, {
            path,
            content: fileInfo.content,
            originalContent: fileInfo.isNew ? undefined : (existingFiles.find(f => f.path === path)?.content || ''),
            isModified: true,
            isAIGenerated: false,
            isSelected: true,
            isNew: fileInfo.isNew,
            lastModified: new Date(),
          });
        }
      });

      const selectedFiles = Array.from(allFiles.values());
      if (selectedFiles.length === 0) return;
      // When creating/updating files, check existence:
      for (const file of selectedFiles) {
        let requestBody: any = {
          message: `${commitMessage} - ${file.path}`,
          content: btoa(file.content),
          branch: branchName,
        };
        // Check if file exists in repo
        try {
          const headers: HeadersInit = effectiveGithubToken ? { Authorization: `Bearer ${effectiveGithubToken}` } : {};
          const url = `https://api.github.com/repos/${selectedRepo.owner}/${selectedRepo.name}/contents/${file.path}?ref=${selectedBranch}`;
          const res = await fetch(url, { headers });
          if (res.ok) {
            const data = await res.json();
            if (data.sha) {
              requestBody.sha = data.sha;
            }
          }
        } catch {}
        // If file does not exist, do not include sha
        const fileResponse = await fetch(
          `https://api.github.com/repos/${selectedRepo.owner}/${selectedRepo.name}/contents/${file.path}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${effectiveGithubToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          }
        );
        if (!fileResponse.ok) {
          const errorText = await fileResponse.text();
          let errorData: any = {};
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText };
          }
          
          // Handle workflow scope requirements specifically
          if (fileResponse.status === 403 && 
              errorData.message?.includes('workflow') && 
              file.path.includes('.github/workflows/')) {
            throw new Error(`Failed to update workflow file ${file.path}: GitHub token needs 'workflow' scope to create/update GitHub Actions workflows. Please sign in again to grant additional permissions.`);
          }
          
          throw new Error(`Failed to update file ${file.path}: ${fileResponse.status} - ${errorText}`);
        }
      }
      // Create pull request
      const prResponse = await fetch(
        `https://api.github.com/repos/${selectedRepo.owner}/${selectedRepo.name}/pulls`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveGithubToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: commitMessage,
            head: branchName,
            base: selectedBranch,
            body: `AI-generated pull request with ${selectedFiles.length} file updates:\n\n${selectedFiles.map(f => `- ${f.path}`).join('\n')}`,
          }),
        }
      );

      if (!prResponse.ok) {
        const errorText = await prResponse.text();
        throw new Error(`Failed to create pull request: ${prResponse.status} - ${errorText}`);
      }

      const prData = await prResponse.json();
      console.log('Pull request created:', prData.html_url);
      
      // Clear any previous errors and show success message
      setError(null);
      setSuccessMessage(`✅ Pull request created successfully! View it here: ${prData.html_url}`);
      
      // Clear all staged changes and reset state
      setSelectedRepoPaths(new Set());
      setSelectedAIPaths(new Set());
      setSelectedManualPaths(new Set());
      setManuallyEditedFiles(new Map());
      setAiGeneratedFiles([]);
      
      // Clear workspace modified states by notifying FileWorkspaceManager
      if (workspaceRef.current) {
        // Reset all file states to unmodified
        workspaceRef.current.clearAllModifications?.();
      }
      
      // Reset PR dialog state
      setPRBranchName(`ai-assistant-updates-${Date.now()}`);
      setPRMessage('');
      
      // Auto-clear success message after 10 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 10000);
      
    } catch (error) {
      console.error('PR creation failed:', error);
      let errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide specific guidance for OAuth App restrictions
      if (errorMessage.includes('OAuth App access restrictions') || 
          errorMessage.includes('Organization has OAuth App access restrictions')) {
        errorMessage = `${errorMessage}\n\nTo resolve this:\n1. Click "Sign in with GitHub" to use OAuth authentication\n2. Or ask your organization admin to enable OAuth App access for this application`;
      }
      
      // Provide specific guidance for workflow scope requirements
      if (errorMessage.includes('workflow scope')) {
        errorMessage = `${errorMessage}\n\nTo resolve this:\n1. Click "Sign in with GitHub" again to grant workflow permissions\n2. Make sure to authorize both 'repo' and 'workflow' scopes when prompted`;
      }
      
      setError(`Failed to create PR: ${errorMessage}`);
      throw error;
    } finally {
      setCreatingPR(false);
    }
  };

  // Auto-stage manual edits when saved
  useEffect(() => {
    manuallyEditedFiles.forEach((_, path) => {
      setSelectedManualPaths(prev => {
        const next = new Set(prev);
        next.add(path);
        return next;
      });
    });
  }, [manuallyEditedFiles]);

  const [showPRDialog, setShowPRDialog] = useState(false);
  const [prBranchName, setPRBranchName] = useState(`ai-assistant-updates-${Date.now()}`);
  const [prMessage, setPRMessage] = useState('');

  const openPRDialog = () => {
    // Calculate unique files to avoid counting duplicates
    const uniqueFiles = new Set([
      ...Array.from(selectedRepoPaths),
      ...Array.from(selectedAIPaths),
      ...Array.from(selectedManualPaths)
    ]);
    setPRMessage(`ZenOps AI: Update files (${uniqueFiles.size} files)`);
    setShowPRDialog(true);
  };

  const confirmCreatePR = async () => {
    setShowPRDialog(false);
    await handleCreatePRSelection(prBranchName, prMessage);
  };

  // Helper functions for GitHub API
  const getLatestCommitSha = async (repo: Repository, branch: string): Promise<string> => {
    const response = await fetch(
      `https://api.github.com/repos/${repo.owner}/${repo.name}/git/refs/heads/${branch}`,
      {
  headers: { 'Authorization': `Bearer ${effectiveGithubToken}` },
      }
    );
    const data = await response.json();
    return data.object.sha;
  };

  const getFileSha = async (repo: Repository, filePath: string, branch: string): Promise<string> => {
    const response = await fetch(
      `https://api.github.com/repos/${repo.owner}/${repo.name}/contents/${filePath}?ref=${branch}`,
      {
  headers: { 'Authorization': `Bearer ${effectiveGithubToken}` },
      }
    );
    const data = await response.json();
    return data.sha;
  };

  // Fetch repo directories for picker (simple implementation: list all folders in repo root)
  /*
  const fetchRepoDirectories = async (): Promise<void> => {
    if (!selectedRepo || !effectiveGithubToken) return;
    try {
      const res = await fetch(`https://api.github.com/repos/${selectedRepo.owner}/${selectedRepo.name}/contents`, {
        headers: { 'Authorization': `Bearer ${effectiveGithubToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        const dirs = data.filter((item: any) => item.type === 'dir').map((item: any) => item.path);
        setRepoDirectories(['/', ...dirs]);
      }
    } catch {}
  };
  */

  // Handle directory selection for new AI file
  /*
  const handleDirectorySelect = (dir: string): void => {
    if (pendingAIFile) {
      const newPath = dir === '/' ? pendingAIFile.name : `${dir}/${pendingAIFile.name}`;
      setAiGeneratedFiles((prev: Array<{ path: string; content: string; isNew: boolean; originalContent?: string }>) => {
        const fileMap = new Map<string, { path: string; content: string; isNew: boolean; originalContent?: string }>();
        prev.forEach((f) => fileMap.set(f.path, f));
        fileMap.set(newPath, { path: newPath, content: pendingAIFile.content, isNew: true, originalContent: '' });
        const merged = Array.from(fileMap.values());
        setSelectedAIPaths(new Set(merged.map((f) => f.path)));
        return merged;
      });
      setPendingAIFile(null);
      setShowDirectoryPicker(false);
    }
  };
  */
  {/* DirectoryPicker modal for new AI files - Commented out for now */}
  {/*
  <DirectoryPicker
    open={showDirectoryPicker}
    directories={[]}
    onSelect={handleDirectorySelect}
    onClose={() => setShowDirectoryPicker(false)}
  />
  */}
  return (
    <Page themeId="home" className={classes.root}>
      <Header title="ZenOps AI">
        <SupportButton>
          Get AI-powered help with generating configuration files, CI/CD pipelines, and infrastructure code.
        </SupportButton>
      </Header>
      <Content className={classes.content}>
        <div className={classes.vsCodeLayout}>
          {/* Left Panel - Repository Explorer */}
          <div className={classes.fileExplorer}>
            <div className={classes.panelHeader}>
              <ExplorerIcon />
              Explorer
            </div>
            <div className={classes.repositorySection}>
              <RepositorySelector
                repositories={repositories}
                selectedRepo={selectedRepo}
                selectedBranch={selectedBranch}
                branches={branches}
                onRepositorySelect={handleRepositorySelect}
                loading={repositoriesLoading || loading}
              />
            </div>
            <div className={classes.explorerBody}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {selectedRepo ? (
                <>
                  {/* Infra and Config Files Section - Equal Space */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <div className={classes.sectionSubheader}>Infra and Config Files ({existingFiles.length})</div>
                    <div className={classes.repoFilesScrollable}>
                      {loading ? (
                        <div className={classes.loading}>Loading files...</div>
                      ) : existingFiles.length > 0 ? (
                        existingFiles.map((file, index) => (
                          <div
                            key={index}
                            className={classes.fileItem}
                            onClick={() => workspaceRef.current?.openFile(file.path)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                workspaceRef.current?.openFile(file.path);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {getFileIcon(file.path, file.type)}
                              <div className={classes.fileName}>
                                {file.path.split('/').pop()}
                              </div>
                            </div>
                            <div className={classes.filePath}>{file.path}</div>
                          </div>
                        ))
                      ) : (
                        <div className={classes.emptyState}>No files found</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Staged Changes Section - Equal Space */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <div className={classes.sectionSubheader}>
                      Staged Changes ({Array.from(new Set([
                        ...aiGeneratedFiles.map(f => f.path),
                        ...Array.from(manuallyEditedFiles.keys())
                      ])).length})
                      <div style={{ fontSize: 11, color: '#969696', fontWeight: 'normal', marginTop: '2px' }}>
                        Check files to include in PR
                      </div>
                    </div>
                    <div className={classes.stagedFilesScrollable}>
                      {Array.from(new Set([
                        ...aiGeneratedFiles.map(f => f.path),
                        ...Array.from(manuallyEditedFiles.keys())
                      ])).length === 0 ? (
                        <div className={classes.emptyState}>No staged files yet</div>
                      ) : (
                        Array.from(new Set([
                          ...aiGeneratedFiles.map(f => f.path),
                          ...Array.from(manuallyEditedFiles.keys())
                        ])).map((path, idx) => {
                          // Find file details from AI or manual
                          const aiFile = aiGeneratedFiles.find(f => f.path === path);
                          const editedFile = manuallyEditedFiles.get(path);
                          const isAI = !!aiFile;
                          const isManual = !!editedFile;
                          const isSelected = selectedAIPaths.has(path) || selectedManualPaths.has(path);
                          const isNew = aiFile?.isNew || editedFile?.isNew || false;
                          
                          // Determine status and icon
                          let statusText = '';
                          let statusIcon = null;
                          if (isNew) {
                            statusText = 'New';
                            statusIcon = <NewIcon style={{ fontSize: 14, color: '#4caf50', marginLeft: 4 }} />;
                          } else if (isAI) {
                            statusText = '(AI)';
                            statusIcon = <ZenOpsAiIcon style={{ fontSize: 14, color: '#2196f3', marginLeft: 4 }} />;
                          } else if (isManual) {
                            statusText = '(Manual)';
                            statusIcon = <ManualIcon style={{ fontSize: 14, color: '#ff9800', marginLeft: 4 }} />;
                          }
                          return (
                            <div key={idx} className={classes.fileItem}>
                              <div 
                                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => workspaceRef.current?.openDiffView?.(path)}
                              >
                                <input
                                  type="checkbox"
                                  className={classes.checkbox}
                                  checked={isSelected}
                                  onClick={(e) => e.stopPropagation()} // Prevent triggering diff view
                                  onChange={(e) => {
                                    if (aiFile) {
                                      setSelectedAIPaths(prev => {
                                        const next = new Set(prev);
                                        if (e.target.checked) next.add(path); else next.delete(path);
                                        return next;
                                      });
                                    } else if (editedFile) {
                                      setSelectedManualPaths(prev => {
                                        const next = new Set(prev);
                                        if (e.target.checked) next.add(path); else next.delete(path);
                                        return next;
                                      });
                                    }
                                  }}
                                />
                                {getFileIcon(path)}
                                <div className={classes.fileName} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                  <span style={{ flex: 1 }}>{path.split('/').pop()}</span>
                                  <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontSize: 11, fontWeight: 500, marginRight: 2 }}>{statusText}</span>
                                    {statusIcon}
                                  </span>
                                </div>
                              </div>
                              <div 
                                className={classes.filePath}
                                style={{ cursor: 'pointer' }}
                                onClick={() => workspaceRef.current?.openDiffView?.(path)}
                              >
                                {path}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  
                  {/* PR Button - Fixed at Bottom */}
                  <div className={classes.prButtonFixed}>
                    <div style={{ fontSize: 12, color: '#969696' }}>
                      Selected: {new Set([
                        ...Array.from(selectedAIPaths),
                        ...Array.from(selectedManualPaths)
                      ]).size}
                    </div>
                    {(error?.includes('OAuth App access restrictions')) ? (
                      <button
                        onClick={requestGithubToken}
                        style={{
                          backgroundColor: '#0e639c',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 3,
                          padding: '6px 12px',
                          cursor: 'pointer',
                        }}
                      >
                        Sign in with GitHub
                      </button>
                    ) : (!effectiveGithubToken ? (
                      <button
                        onClick={requestGithubToken}
                        style={{
                          backgroundColor: '#0e639c',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 3,
                          padding: '6px 12px',
                          cursor: 'pointer',
                        }}
                      >
                        Sign in to GitHub
                      </button>
                    ) : (
                      <button
                        onClick={openPRDialog}
                        disabled={creatingPR || (selectedAIPaths.size + selectedManualPaths.size === 0)}
                        style={{
                          backgroundColor: (creatingPR || (selectedAIPaths.size + selectedManualPaths.size === 0)) ? '#3c3c3c' : '#0e639c',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 3,
                          padding: '6px 12px',
                          cursor: (creatingPR || (selectedRepoPaths.size + selectedAIPaths.size + selectedManualPaths.size === 0)) ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {creatingPR ? 'Creating…' : 'Create PR'}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className={classes.welcomeMessage}>
                  <ExplorerIcon />
                  <div className={classes.welcomeTitle}>No Repository Selected</div>
                  <div className={classes.welcomeDescription}>
                    Select a repository and branch above to explore files
                  </div>
                </div>
              )}
              </div>
            </div>
            {selectedRepo && (
              <div className={classes.activityIndicator}>
                <div className={classes.statusDot} />
                {selectedRepo.owner}/{selectedRepo.name} • {selectedBranch}
              </div>
            )}
          </div>
          {/* Center Panel - Workspace */}
          <div className={classes.workspace}>
            <div className={classes.panelHeader}>
              <WorkspaceIcon />
              Infrastructure & Config Workspace
            </div>
            <div className={classes.panelContent}>
              {!selectedRepo ? (
                <div className={classes.welcomeMessage}>
                  <ZenOpsAiIcon />
                  <div className={classes.welcomeTitle}>Welcome to ZenOps AI</div>
                  <div className={classes.welcomeDescription}>
                    Select a repository from the Explorer to start managing your infrastructure 
                    files, configurations, CI/CD pipelines, and get AI-powered assistance.
                  </div>
                </div>
              ) : (
                <div style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: 0
                }}>
                  <FileWorkspaceManager
                    ref={workspaceRef}
                    repository={selectedRepo?.entity}
                    existingFiles={existingFiles}
                    aiGeneratedFiles={aiGeneratedFiles}
                    onCreatePR={handleCreatePR}
                    onRequestAIEdit={handleAIEdit}
                    onFileSave={handleFileSave}
                    githubToken={effectiveGithubToken}
                    hideSidebar
                    hideToolbar
                  />
                </div>
              )}
            </div>
          </div>
          {/* Right Panel - AI Chat */}
          <div className={classes.aiChat}>
            <div className={classes.panelHeader}>
              <ChatIcon />
              ZenOps AI
            </div>
            <div className={classes.panelContent} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {selectedRepo ? (
                <>
                  <div className={classes.chatHistory}>
                    <ChatInterface
                      repository={selectedRepo}
                      branch={selectedBranch}
                      existingFiles={existingFiles}
                      onResponse={handleChatResponse}
                      onFilesGenerated={handleFilesGenerated}
                      onOpenFile={handleOpenFileFromChat}
                      projectContext={{
                        githubSecrets: {
                          GCP_PROJECT_ID: 'Your Google Cloud Project ID',
                          GCP_REGION: 'Your Google Cloud Region (e.g., us-central1)',
                          GCP_SA_KEY: 'Your Google Cloud Service Account Key (JSON format)',
                          OPENWEATHER_API_KEY: 'Your OpenWeather API Key for weather services'
                        },
                        instructions: {
                          codeGeneration: 'Generate production-ready, complete files/scripts that can be used immediately without modification. Use the exact GitHub secret variable names listed above when referencing secrets in CI/CD workflows, deployment scripts, or configuration files.',
                          contextAwareness: 'You have access to the complete DevOps context of this project including infrastructure files, CI/CD pipelines, configuration files, deployment scripts, and environment settings. Use this context to generate appropriate solutions.',
                          gcpIntegration: 'When generating GCP-related code (Cloud Run, Cloud Build, IAM, etc.), always use the exact secret names: GCP_PROJECT_ID, GCP_REGION, and GCP_SA_KEY.',
                          fileFormats: 'Generate complete, properly formatted files including headers, comments, error handling, and best practices. Files should be ready to commit and deploy.',
                          devopsPattern: 'Follow industry-standard DevOps patterns: infrastructure as code, GitOps workflows, proper secret management, multi-environment support, and comprehensive documentation.'
                        },
                        capabilities: [
                          'Generate complete CI/CD workflows using exact GitHub secret names',
                          'Create infrastructure as code (Terraform, Helm) with proper configurations',
                          'Generate deployment scripts and automation tools',
                          'Create environment-specific configuration files',
                          'Generate Docker configurations and compose files',
                          'Create monitoring and logging configurations',
                          'Generate security and IAM configurations',
                          'Create complete project documentation and setup guides'
                        ]
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className={classes.welcomeMessage}>
                  <ZenOpsAiIcon />
                  <div className={classes.welcomeTitle}>ZenOps AI Ready</div>
                  <div className={classes.welcomeDescription}>
                    Select a repository to start getting AI-powered development assistance 
                    for infrastructure, configuration, and CI/CD pipeline generation.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <Box mt={2}>
            <Typography color="error">
              {error}
            </Typography>
          </Box>
        )}
        
        <Dialog open={!!successMessage} onClose={() => setSuccessMessage(null)} maxWidth="xs">
          <DialogTitle>Pull Request Created</DialogTitle>
          <DialogContent>
            <Typography variant="body1" style={{ marginBottom: 8 }}>
              {successMessage}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSuccessMessage(null)} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>

  {/* Removed overlapping FilePreviewEnhanced section. Preview is only shown in the right panel. */}

  {/* 5. Render PR dialog */}
  {showPRDialog && (
    <Dialog open={showPRDialog} onClose={() => setShowPRDialog(false)}>
      <DialogTitle>Create Pull Request</DialogTitle>
      <DialogContent>
        <div>Files to be included:</div>
        <ul>
          {Array.from(new Set([
            ...Array.from(selectedRepoPaths),
            ...Array.from(selectedAIPaths),
            ...Array.from(selectedManualPaths)
          ])).map((path, idx) => (
            <li key={idx}>{path}</li>
          ))}
        </ul>
        <TextField
          label="Branch Name"
          value={prBranchName}
          onChange={e => setPRBranchName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="PR Message"
          value={prMessage}
          onChange={e => setPRMessage(e.target.value)}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowPRDialog(false)} color="secondary">Cancel</Button>
        <Button onClick={confirmCreatePR} color="primary">Create PR</Button>
      </DialogActions>
    </Dialog>
  )}
      </Content>
    </Page>
  );
};
