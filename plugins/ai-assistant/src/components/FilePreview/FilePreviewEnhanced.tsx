import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  Chip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Fade,
  Slide,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  GetApp as DownloadIcon,
  GitHub as GitHubIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  FileCopy as FileCopyIcon,
  PlayArrow as PlayArrowIcon,
  ExpandMore as ExpandMoreIcon,
  Launch as LaunchIcon,
} from '@material-ui/icons';
import { useApi, discoveryApiRef } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { GithubApi } from '../../apis/githubApi';
import { RepositoryService } from '../../services/repositoryService';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
    minHeight: '600px',
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  },
  tabPanel: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    minHeight: '400px',
  },
  codeContainer: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    overflow: 'auto',
    maxHeight: '500px',
    fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
    fontSize: '14px',
    lineHeight: 1.5,
    border: '1px solid #333',
    position: 'relative',
  },
  fileHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.spacing(0.5),
    border: `1px solid ${theme.palette.divider}`,
  },
  fileName: {
    fontWeight: 600,
    color: theme.palette.primary.main,
    fontFamily: 'monospace',
  },
  actionButton: {
    margin: theme.spacing(1),
    borderRadius: theme.spacing(3),
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1, 3),
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    },
  },
  createPRButton: {
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
    color: 'white',
    '&:hover': {
      background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
    },
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.spacing(1),
    margin: theme.spacing(2, 0),
  },
  stepperContainer: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
  },
  enhancedCard: {
    margin: theme.spacing(1, 0),
    borderRadius: theme.spacing(1),
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: theme.shadows[8],
      transform: 'translateY(-2px)',
    },
  },
  statusChip: {
    fontWeight: 600,
    borderRadius: theme.spacing(2),
  },
  dialogActions: {
    padding: theme.spacing(2, 3),
    backgroundColor: theme.palette.grey[50],
  },
  prPreview: {
    backgroundColor: theme.palette.grey[50],
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    margin: theme.spacing(1, 0),
  },
}));

export interface FileContent {
  path: string;
  content: string;
  isNew: boolean;
  language?: string;
}

export interface PreviewContent {
  message: string;
  files: FileContent[];
}

interface FilePreviewEnhancedProps {
  content: PreviewContent;
  repository?: Entity;
  onClose?: () => void;
  githubToken?: string;
}

const languages = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  cs: 'csharp',
  php: 'php',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  swift: 'swift',
  kt: 'kotlin',
  scala: 'scala',
  sh: 'bash',
  ps1: 'powershell',
  yml: 'yaml',
  yaml: 'yaml',
  json: 'json',
  xml: 'xml',
  html: 'html',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  md: 'markdown',
  dockerfile: 'dockerfile',
  sql: 'sql',
};

const getLanguageColor = (filePath: string): string => {
  const ext = filePath.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return '#007acc'; // TypeScript blue
    case 'py':
      return '#3776ab'; // Python blue
    case 'java':
      return '#f89820'; // Java orange
    case 'json':
      return '#000000'; // Black for JSON
    case 'yml':
    case 'yaml':
      return '#cb171e'; // YAML red
    case 'dockerfile':
      return '#384d54'; // Docker dark blue
    case 'md':
      return '#083fa1'; // Markdown blue
    case 'css':
    case 'scss':
      return '#1572b6'; // CSS blue
    case 'html':
      return '#e34f26'; // HTML orange
    default:
      return '#333333'; // Default dark gray
  }
};

export const FilePreviewEnhanced: React.FC<FilePreviewEnhancedProps> = ({
  content,
  repository,
  onClose,
  githubToken,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const discoveryApi = useApi(discoveryApiRef);
  
  const [activeTab, setActiveTab] = useState(0);
  const [isCreatingPR, setIsCreatingPR] = useState(false);
  const [showPRDialog, setShowPRDialog] = useState(false);
  const [prTitle, setPrTitle] = useState('');
  const [prDescription, setPrDescription] = useState('');
  const [prBranch, setPrBranch] = useState('');
  const [targetBranch, setTargetBranch] = useState('main');
  const [activeStep, setActiveStep] = useState(0);
  const [prResult, setPrResult] = useState<any>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [repositoryContext, setRepositoryContext] = useState<any>(null);
  const [loadingContext, setLoadingContext] = useState(false);

  // Initialize PR form with AI-generated content
  useEffect(() => {
    if (content.message) {
      const title = content.message.split('\n')[0].substring(0, 72);
      setPrTitle(title);
      setPrDescription(formatPRDescription(content.message, content.files));
      setPrBranch(`ai-assistant/feature-${Date.now()}`);
    }
  }, [content]);

  // Load repository context when repository changes
  useEffect(() => {
    if (repository) {
      loadRepositoryContext();
    }
  }, [repository]);

  const loadRepositoryContext = async () => {
    if (!repository) return;
    
    setLoadingContext(true);
    try {
      const githubApi = new GithubApi(discoveryApi);
      const repoService = new RepositoryService(githubApi);
      const context = await repoService.getRepositoryContext(repository);
      setRepositoryContext(context);
    } catch (error) {
      console.error('Failed to load repository context:', error);
    } finally {
      setLoadingContext(false);
    }
  };

  const formatPRDescription = (message: string, files: FileContent[]): string => {
    const filesList = files.map(file => {
      const icon = file.isNew ? '🆕' : '✏️';
      return `- ${icon} \`${file.path}\``;
    }).join('\n');

    const contextInfo = repositoryContext ? `
## 📊 Repository Context:
- **Framework**: ${repositoryContext.framework || 'Unknown'}
- **Language**: ${repositoryContext.primaryLanguage || 'Unknown'}
- **Package Manager**: ${repositoryContext.packageManager || 'Unknown'}
- **Tech Stack**: ${repositoryContext.techStack?.join(', ') || 'N/A'}
` : '';

    return `# 🤖 AI Assistant Generated Changes

${message}

## 📁 Files Modified:
${filesList}
${contextInfo}
## 🔧 Generated by:
- **AI Model**: GPT-4o
- **Context-Aware**: ${repositoryContext ? '✅ Yes' : '❌ No'}
- **Timestamp**: ${new Date().toISOString()}

## ✅ Pre-commit Checklist:
- [ ] Code follows project conventions
- [ ] Tests are included/updated
- [ ] Documentation is updated
- [ ] No breaking changes introduced
- [ ] Security considerations reviewed

> This PR was automatically generated by the AI Assistant with full repository context analysis.
`;
  };

  const getLanguageFromPath = (path: string): string => {
    const extension = path.split('.').pop()?.toLowerCase();
    return languages[extension as keyof typeof languages] || 'text';
  };

  const handleCreatePR = async () => {
    if (!content.files || content.files.length === 0) {
      setSnackbarMessage('No files to create a PR for.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setShowPRDialog(true);
  };

  const executePRCreation = async () => {
    setIsCreatingPR(true);
    setActiveStep(0);
    
    try {
      // Step 1: Validate repository
      setActiveStep(0);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const repoInfo = repository ? {
        owner: repository.metadata?.annotations?.['github.com/project-slug']?.split('/')[0] || 'ZensarIDP',
        repo: repository.metadata?.annotations?.['github.com/project-slug']?.split('/')[1] || repository.metadata?.name || 'unknown-repo'
      } : {
        owner: 'ZensarIDP',
        repo: 'weather-app'
      };

      // Step 2: Create branch using GitHub API
      setActiveStep(1);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const token = githubToken || process.env.REACT_APP_GITHUB_TOKEN || '';
      if (!token) throw new Error('GitHub token is missing');
      const headers = {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
      };

      // Get the default branch reference
      const refResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/ref/heads/${targetBranch}`, {
        headers
      });
      if (!refResponse.ok) {
        throw new Error(`Failed to get branch reference: ${refResponse.statusText}`);
      }
      const refData = await refResponse.json();
      const baseSha = refData.object.sha;

      // Create new branch
      const createBranchResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ref: `refs/heads/${prBranch}`,
          sha: baseSha
        })
      });
      if (!createBranchResponse.ok) {
        throw new Error(`Failed to create branch: ${createBranchResponse.statusText}`);
      }

      // Step 3: Commit files to the new branch
      setActiveStep(2);
      for (const file of content.files) {
        // Get the latest commit SHA for the branch
        const branchRefRes = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/ref/heads/${prBranch}`, { headers });
        if (!branchRefRes.ok) throw new Error(`Failed to get branch ref for file commit: ${branchRefRes.statusText}`);
        const branchRefData = await branchRefRes.json();
        const latestCommitSha = branchRefData.object.sha;

        // Get the tree SHA from the latest commit
        const commitRes = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits/${latestCommitSha}`, { headers });
        if (!commitRes.ok) throw new Error(`Failed to get commit for file commit: ${commitRes.statusText}`);
        const commitData = await commitRes.json();
        const treeSha = commitData.tree.sha;

        // Create a blob for the file content
        const blobRes = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/blobs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            content: file.content,
            encoding: 'utf-8'
          })
        });
        if (!blobRes.ok) throw new Error(`Failed to create blob for ${file.path}: ${blobRes.statusText}`);
        const blobData = await blobRes.json();

        // Create a new tree with the file
        const treeRes = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            base_tree: treeSha,
            tree: [{
              path: file.path,
              mode: '100644',
              type: 'blob',
              sha: blobData.sha
            }]
          })
        });
        if (!treeRes.ok) throw new Error(`Failed to create tree for ${file.path}: ${treeRes.statusText}`);
        const treeData = await treeRes.json();

        // Create a commit
        const commitMsg = file.isNew ? `Add ${file.path}` : `Update ${file.path}`;
        const newCommitRes = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message: commitMsg,
            tree: treeData.sha,
            parents: [latestCommitSha]
          })
        });
        if (!newCommitRes.ok) throw new Error(`Failed to create commit for ${file.path}: ${newCommitRes.statusText}`);
        const newCommitData = await newCommitRes.json();

        // Update the branch reference to point to the new commit
        const updateRefRes = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs/heads/${prBranch}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            sha: newCommitData.sha
          })
        });
        if (!updateRefRes.ok) throw new Error(`Failed to update branch ref for ${file.path}: ${updateRefRes.statusText}`);
      }

      // Step 4: Create pull request
      setActiveStep(3);
      const prResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/pulls`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: prTitle,
          head: prBranch,
          base: targetBranch,
          body: prDescription,
          draft: false
        })
      });
      if (!prResponse.ok) {
        throw new Error(`Failed to create pull request: ${prResponse.statusText}`);
      }
      const prData = await prResponse.json();

      // Step 5: Complete
      setActiveStep(4);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPrResult({
        prUrl: prData.html_url,
        prNumber: prData.number,
        repository: `${repoInfo.owner}/${repoInfo.repo}`,
        branch: prBranch,
      });

      setSnackbarMessage('Pull Request created successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

    } catch (error) {
      console.error('Error creating PR:', error);
      setSnackbarMessage(`Failed to create Pull Request: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setActiveStep(0);
    } finally {
      setIsCreatingPR(false);
    }
  };

  const downloadFile = (file: FileContent) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'file.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllFiles = () => {
    content.files.forEach(file => downloadFile(file));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage('Content copied to clipboard!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const steps = ['Validate Repository', 'Prepare Changes', 'Create Pull Request', 'Complete'];

  return (
    <>
      <Paper className={classes.root} elevation={3}>
        {/* Header with enhanced styling */}
        <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
          <Box display="flex" alignItems="center" style={{ gap: "8px" }}>
            <CodeIcon color="primary" />
            <Typography variant="h4" component="h1" style={{ fontWeight: 600 }}>
              AI Generated Files
            </Typography>
            {loadingContext && <CircularProgress size={24} />}
          </Box>
          <Box display="flex" style={{ gap: "8px" }}>
            <Chip 
              icon={<InfoIcon />}
              label={`${content.files.length} files`}
              className={classes.statusChip}
              color="primary"
              variant="outlined"
            />
            {repositoryContext && (
              <Chip 
                icon={<CheckCircleIcon />}
                label="Context Aware"
                className={classes.statusChip}
                color="secondary"
              />
            )}
          </Box>
        </Box>

        {/* Repository Context Card */}
        {repositoryContext && (
          <Fade in={true}>
            <Card className={classes.enhancedCard} elevation={2}>
              <CardHeader
                avatar={<GitHubIcon />}
                title="Repository Context"
                subheader={`${repositoryContext.framework} • ${repositoryContext.primaryLanguage}`}
              />
              <CardContent>
                <Box display="flex" style={{ gap: "8px" }} flexWrap="wrap">
                  {repositoryContext.techStack?.map((tech: string) => (
                    <Chip key={tech} label={tech} size="small" variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Enhanced Message Display */}
        <Card className={classes.enhancedCard} elevation={2}>
          <CardHeader
            title="AI Response"
            subheader="Generated with repository context"
          />
          <CardContent>
            <Typography variant="body1" paragraph style={{ lineHeight: 1.6 }}>
              {content.message}
            </Typography>
          </CardContent>
        </Card>

        {/* Enhanced File Tabs */}
        <Box mt={3}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {content.files.map((file, index) => (
              <Tab
                key={index}
                label={
                  <Box display="flex" alignItems="center" style={{ gap: "8px" }}>
                    {file.isNew ? <AddIcon /> : <EditIcon />}
                    <span>{file.path.split('/').pop()}</span>
                    <Chip 
                      label={getLanguageFromPath(file.path)} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>

          {content.files.map((file, index) => (
            <div key={index} hidden={activeTab !== index}>
              <Box className={classes.tabPanel}>
                <Box className={classes.fileHeader}>
                  <Typography variant="h6" className={classes.fileName}>
                    {file.path}
                  </Typography>
                  <Box display="flex" style={{ gap: "8px" }}>
                    <Tooltip title="Copy content">
                      <IconButton onClick={() => copyToClipboard(file.content)} size="small">
                        <FileCopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download file">
                      <IconButton onClick={() => downloadFile(file)} size="small">
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Chip 
                      label={file.isNew ? 'New File' : 'Modified'} 
                      color={file.isNew ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </Box>
                </Box>
                <Box className={classes.codeContainer}>
                  <pre style={{ 
                    margin: 0, 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word',
                    backgroundColor: '#f5f5f5',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    overflow: 'auto',
                    maxHeight: '500px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <code style={{ color: getLanguageColor(file.path) }}>
                      {file.content}
                    </code>
                  </pre>
                </Box>
              </Box>
            </div>
          ))}
        </Box>

        {/* Enhanced Action Buttons */}
        <Box display="flex" justifyContent="center" style={{ gap: "8px" }} mt={4}>
          <Button
            variant="contained"
            className={`${classes.actionButton} ${classes.createPRButton}`}
            startIcon={<GitHubIcon />}
            onClick={handleCreatePR}
            disabled={isCreatingPR}
            size="large"
          >
            {isCreatingPR ? 'Creating PR...' : 'Create Pull Request'}
          </Button>
          <Button
            variant="outlined"
            className={classes.actionButton}
            startIcon={<DownloadIcon />}
            onClick={downloadAllFiles}
            size="large"
          >
            Download All Files
          </Button>
          {onClose && (
            <Button
              variant="text"
              className={classes.actionButton}
              onClick={onClose}
              size="large"
            >
              Close
            </Button>
          )}
        </Box>
      </Paper>

      {/* Enhanced PR Creation Dialog */}
      <Dialog
        open={showPRDialog}
        onClose={() => !isCreatingPR && setShowPRDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: { borderRadius: 16 }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" style={{ gap: "8px" }}>
            <GitHubIcon color="primary" />
            <Typography variant="h5" component="span" style={{ fontWeight: 600 }}>
              Create Pull Request
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {!prResult ? (
            <>
              {/* PR Configuration Form */}
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="Pull Request Title"
                  value={prTitle}
                  onChange={(e) => setPrTitle(e.target.value)}
                  margin="normal"
                  variant="outlined"
                  disabled={isCreatingPR}
                />
                <TextField
                  fullWidth
                  label="Branch Name"
                  value={prBranch}
                  onChange={(e) => setPrBranch(e.target.value)}
                  margin="normal"
                  variant="outlined"
                  disabled={isCreatingPR}
                />
                <TextField
                  fullWidth
                  label="Target Branch"
                  value={targetBranch}
                  onChange={(e) => setTargetBranch(e.target.value)}
                  margin="normal"
                  variant="outlined"
                  disabled={isCreatingPR}
                />
              </Box>

              {/* PR Description Preview */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Preview Description</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box className={classes.prPreview}>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                      {prDescription}
                    </pre>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Progress Stepper */}
              {isCreatingPR && (
                <Box mt={3} className={classes.stepperContainer}>
                  <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((label, index) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                        <StepContent>
                          <Box className={classes.progressContainer}>
                            <CircularProgress size={24} />
                            <Typography>
                              {index === 0 && 'Validating repository access...'}
                              {index === 1 && 'Preparing file changes...'}
                              {index === 2 && 'Creating pull request on GitHub...'}
                              {index === 3 && 'Pull request created successfully!'}
                            </Typography>
                          </Box>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </Box>
              )}
            </>
          ) : (
            /* Success Result */
            <Box textAlign="center" p={3}>
              <CheckCircleIcon style={{ fontSize: 64, color: theme.palette.success.main }} />
              <Typography variant="h5" style={{ margin: '16px 0', fontWeight: 600 }}>
                Pull Request Created Successfully!
              </Typography>
              <Card elevation={2} style={{ margin: '16px 0' }}>
                <CardContent>
                  <Typography variant="body1">
                    <strong>Repository:</strong> {prResult.repository}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Branch:</strong> {prResult.branch}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Task ID:</strong> {prResult.taskId}
                  </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<LaunchIcon />}
                    href={prResult.prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Pull Request
                  </Button>
                </CardActions>
              </Card>
            </Box>
          )}
        </DialogContent>

        <DialogActions className={classes.dialogActions}>
          {!prResult ? (
            <>
              <Button
                onClick={() => setShowPRDialog(false)}
                disabled={isCreatingPR}
              >
                Cancel
              </Button>
              <Button
                onClick={executePRCreation}
                disabled={isCreatingPR || !prTitle.trim() || !prBranch.trim()}
                variant="contained"
                color="primary"
                startIcon={isCreatingPR ? <CircularProgress size={20} /> : <PlayArrowIcon />}
              >
                {isCreatingPR ? 'Creating...' : 'Create Pull Request'}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                setShowPRDialog(false);
                setPrResult(null);
                setActiveStep(0);
                onClose?.();
              }}
              variant="contained"
              color="primary"
            >
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Enhanced Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        TransitionComponent={Slide}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
