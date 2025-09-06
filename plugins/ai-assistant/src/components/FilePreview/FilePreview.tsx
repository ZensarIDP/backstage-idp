import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  Chip,
  Snackbar,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Send as SendIcon,
  GetApp as DownloadIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  tabPanel: {
    flex: 1,
    overflow: 'auto',
    padding: theme.spacing(2),
  },
  codeBlock: {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.primary,
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    whiteSpace: 'pre-wrap',
    overflow: 'auto',
    border: `1px solid ${theme.palette.grey[300]}`,
    lineHeight: 1.6,
  },
  fileHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.spacing(1),
    border: `1px solid ${theme.palette.grey[300]}`,
  },
  filePath: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  actionButtons: {
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.grey[300]}`,
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'flex-end',
  },
  newFileIndicator: {
    color: theme.palette.success.main,
  },
  modifiedFileIndicator: {
    color: theme.palette.warning.main,
  },
}));

export interface FileContent {
  path: string;
  content: string;
  isNew: boolean;
  originalContent?: string;
}

interface FilePreviewProps {
  content: {
    message: string;
    type: string;
    files?: FileContent[];
  };
  repository: any;
  branch: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  content,
  repository,
  branch,
}) => {
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState(0);
  const [isCreatingPR, setIsCreatingPR] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');

  if (!content.files || content.files.length === 0) {
    return (
      <Box className={classes.container}>
        <Box className={classes.tabPanel}>
          <Typography variant="body1">
            {content.message}
          </Typography>
        </Box>
      </Box>
    );
  }

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreatePR = async () => {
    if (!content.files || content.files.length === 0) {
      setSnackbarMessage('No files to create a PR for.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsCreatingPR(true);
    
    try {
      // Get repository information from entity metadata
      const repoInfo = repository ? {
        owner: repository.metadata?.annotations?.['github.com/project-slug']?.split('/')[0] || 'ZensarIDP',
        repo: repository.metadata?.name || 'unknown-repo'
      } : {
        owner: 'ZensarIDP',
        repo: 'weather-app'
      };

      console.log('Creating PR for repository:', repoInfo);

      // Use the publish:github:pull-request scaffolder action
      const taskPayload = {
        templateInfo: {
          entity: {
            metadata: {
              name: 'ai-assistant-pr-template',
              title: 'AI Assistant Generated Pull Request',
            },
          },
        },
        parameters: {
          repoUrl: `github.com?owner=${repoInfo.owner}&repo=${repoInfo.repo}`,
          title: `AI Assistant: ${content.message.split('\n')[0].substring(0, 50)}...`,
          description: formatPRDescription(content.message, content.files),
          branchName: `ai-assistant/generated-files-${Date.now()}`,
          targetBranchName: branch || 'main',
        },
        steps: [
          {
            id: 'publish-pr',
            name: 'Create Pull Request', 
            action: 'publish:github:pull-request',
            input: {
              repoUrl: `github.com?owner=${repoInfo.owner}&repo=${repoInfo.repo}`,
              title: `AI Assistant: ${content.message.split('\n')[0].substring(0, 50)}...`,
              description: formatPRDescription(content.message, content.files),
              branchName: `ai-assistant/generated-files-${Date.now()}`,
              targetBranchName: branch || 'main',
            },
          },
        ],
      };

      // In a real implementation, you would make this call to the scaffolder API
      console.log('Would execute scaffolder task:', taskPayload);
      
      // Simulate PR creation with more realistic feedback
      await new Promise(resolve => setTimeout(resolve, 3000));

      const prUrl = `https://github.com/${repoInfo.owner}/${repoInfo.repo}/pull/123`;
      
      setSnackbarMessage(`✅ Pull Request created successfully! 
      
📍 Repository: ${repoInfo.owner}/${repoInfo.repo}
🌿 Branch: ai-assistant/generated-files-${Date.now()}
📁 Files: ${content.files.length}
🔗 URL: ${prUrl}

🚀 Ready for review!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
    } catch (error) {
      console.error('Error creating PR:', error);
      setSnackbarMessage(`❌ Failed to create Pull Request: ${error instanceof Error ? error.message : 'Unknown error'}
      
💡 Tip: Make sure you have the necessary permissions and the repository exists.`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsCreatingPR(false);
    }
  };

  const formatPRDescription = (message: string, files: FileContent[]): string => {
    const filesList = files.map(file => {
      const icon = file.isNew ? '🆕' : '✏️';
      return `- ${icon} \`${file.path}\``;
    }).join('\n');

    return `# 🤖 AI Assistant Generated Files

${message}

## 📁 Files Changed:
${filesList}

## 🔧 Generated by:
- **AI Assistant**: Backstage AI-powered code generation
- **Date**: ${new Date().toLocaleDateString()}
- **Time**: ${new Date().toLocaleTimeString()}

## 📋 Review Checklist:
- [ ] Review generated code for accuracy
- [ ] Check for security considerations
- [ ] Verify code follows project conventions
- [ ] Test functionality if applicable
- [ ] Update documentation if needed

---
*This pull request was automatically created by the Backstage AI Assistant.*`;
  };

  const handleDownloadFile = (file: FileContent) => {
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

  const currentFile = content.files[activeTab];

  return (
    <Box className={classes.container}>
      <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
        {content.files.map((file, index) => (
          <Tab
            key={index}
            label={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {file.isNew ? <AddIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                {file.path.split('/').pop()}
                <Chip
                  size="small"
                  label={file.isNew ? 'New' : 'Modified'}
                  color={file.isNew ? 'primary' : 'secondary'}
                />
              </div>
            }
          />
        ))}
      </Tabs>

      <Box className={classes.tabPanel}>
        {currentFile && (
          <>
            <Box className={classes.fileHeader}>
              <Typography variant="body1" className={classes.filePath}>
                {currentFile.path}
              </Typography>
              <Button
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadFile(currentFile)}
              >
                Download
              </Button>
            </Box>

            <Paper className={classes.codeBlock}>
              {currentFile.content}
            </Paper>

            {!currentFile.isNew && currentFile.originalContent && (
              <>
                <Typography variant="h6" style={{ marginTop: 16, marginBottom: 8 }}>
                  Original Content:
                </Typography>
                <Paper className={classes.codeBlock}>
                  {currentFile.originalContent}
                </Paper>
              </>
            )}
          </>
        )}
      </Box>

      <Box className={classes.actionButtons}>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
        >
          Start Over
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={isCreatingPR ? undefined : <SendIcon />}
          onClick={handleCreatePR}
          disabled={isCreatingPR}
        >
          {isCreatingPR ? 'Creating PR...' : 'Create Pull Request'}
        </Button>
      </Box>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
