import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  TextField,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  GitHub as GitHubIcon,
  Code as CodeIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  FileCopy as FileCopyIcon,
} from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { FileContent } from '../FilePreview/FilePreview';
import { PullRequestOptions, PullRequestResult } from '../../services/scaffolderGitHubService';

const useStyles = makeStyles((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      maxWidth: '900px',
      width: '90vw',
      height: '80vh',
    },
  },
  dialogContent: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  stepperContainer: {
    flex: 1,
    overflow: 'auto',
    padding: theme.spacing(2),
  },
  progressContainer: {
    padding: theme.spacing(1, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  filePreview: {
    backgroundColor: theme.palette.grey[50],
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: theme.spacing(1),
    maxHeight: '300px',
    overflow: 'auto',
  },
  codeBlock: {
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    fontSize: '0.875rem',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    whiteSpace: 'pre-wrap',
    color: theme.palette.text.primary,
  },
  successContainer: {
    textAlign: 'center',
    padding: theme.spacing(3),
  },
  branchInput: {
    marginBottom: theme.spacing(2),
  },
  fileChip: {
    margin: theme.spacing(0.5),
  },
  actionButtons: {
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
}));

interface PullRequestDialogProps {
  open: boolean;
  onClose: () => void;
  files: FileContent[];
  repository: {
    name: string;
    owner: string;
    defaultBranch: string;
  };
  onSubmit: (options: PullRequestOptions) => Promise<PullRequestResult>;
  initialTitle?: string;
  initialDescription?: string;
}

const steps = [
  'Review Changes',
  'Configure Pull Request',
  'Create Pull Request',
  'Success',
];

export const PullRequestDialog: React.FC<PullRequestDialogProps> = ({
  open,
  onClose,
  files,
  repository,
  onSubmit,
  initialTitle = '',
  initialDescription = '',
}) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PullRequestResult | null>(null);

  // PR configuration
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [branchName, setBranchName] = useState(`ai-assistant/generated-files-${Date.now()}`);
  const [targetBranch, setTargetBranch] = useState(repository.defaultBranch);
  const [isDraft, setIsDraft] = useState(false);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Pull request title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const options: PullRequestOptions = {
        owner: repository.owner,
        repo: repository.name,
        title: title.trim(),
        description: description.trim(),
        files,
        branchName,
        targetBranch,
      };

      const result = await onSubmit(options);
      setResult(result);
      handleNext(); // Move to success step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pull request');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setError(null);
    setResult(null);
    setLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const renderFilePreview = (file: FileContent) => (
    <Box key={file.path} mb={2}>
      <Box display="flex" alignItems="center" mb={1}>
        <Chip
          icon={file.isNew ? <CodeIcon /> : <EditIcon />}
          label={file.path}
          size="small"
          color={file.isNew ? 'primary' : 'secondary'}
          className={classes.fileChip}
        />
        <Tooltip title="Preview file">
          <IconButton size="small">
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Copy content">
          <IconButton
            size="small"
            onClick={() => navigator.clipboard.writeText(file.content)}
          >
            <FileCopyIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box className={classes.filePreview}>
        <pre className={classes.codeBlock}>
          {file.content.length > 1000 
            ? `${file.content.substring(0, 1000)}...\n\n[Content truncated - ${file.content.length} total characters]`
            : file.content
          }
        </pre>
      </Box>
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Changes
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Review the files that will be included in your pull request. You can preview each file and ensure the content is correct.
            </Typography>
            
            <Alert severity="info" style={{ marginBottom: 16 }}>
              <strong>{files.length} file(s)</strong> will be {files.every(f => f.isNew) ? 'created' : 'modified'} in this pull request
            </Alert>

            <Box>
              {files.map(renderFilePreview)}
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure Pull Request
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Configure the details for your pull request. Provide a clear title and description to help reviewers understand your changes.
            </Typography>

            <TextField
              fullWidth
              label="Pull Request Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!title.trim()}
              helperText={!title.trim() ? 'Title is required' : ''}
              margin="normal"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              margin="normal"
              variant="outlined"
              placeholder="Describe what this pull request does..."
            />

            <TextField
              fullWidth
              label="Branch Name"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              margin="normal"
              variant="outlined"
              className={classes.branchInput}
            />

            <TextField
              fullWidth
              label="Target Branch"
              value={targetBranch}
              onChange={(e) => setTargetBranch(e.target.value)}
              margin="normal"
              variant="outlined"
              className={classes.branchInput}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isDraft}
                  onChange={(e) => setIsDraft(e.target.checked)}
                  color="primary"
                />
              }
              label="Create as draft pull request"
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Creating Pull Request
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Please wait while we create your pull request...
            </Typography>

            {loading && (
              <Box mb={2}>
                <LinearProgress />
                <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                  Creating branch and uploading files...
                </Typography>
              </Box>
            )}

            <List>
              <ListItem>
                <ListItemIcon>
                  <GitHubIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Repository" 
                  secondary={`${repository.owner}/${repository.name}`} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CodeIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Branch" 
                  secondary={`${branchName} → ${targetBranch}`} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Files" 
                  secondary={`${files.length} file(s) to be ${files.every(f => f.isNew) ? 'created' : 'modified'}`} 
                />
              </ListItem>
            </List>

            {error && (
              <Alert severity="error" style={{ marginTop: 16 }}>
                {error}
              </Alert>
            )}
          </Box>
        );

      case 3:
        return (
          <Box className={classes.successContainer}>
            <CheckCircleIcon style={{ fontSize: 64, color: '#4caf50', marginBottom: 16 }} />
            <Typography variant="h5" gutterBottom>
              Pull Request Created Successfully!
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Your pull request has been created and is ready for review.
            </Typography>

            {result && (
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<GitHubIcon />}
                  size="large"
                >
                  View Pull Request #{result.number}
                </Button>
              </Box>
            )}
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} className={classes.dialog} maxWidth={false}>
      <DialogTitle>
        Create Pull Request
        <Typography variant="body2" color="textSecondary">
          {repository.owner}/{repository.name}
        </Typography>
      </DialogTitle>

      {loading && (
        <Box className={classes.progressContainer}>
          <LinearProgress />
        </Box>
      )}

      <DialogContent className={classes.dialogContent}>
        <Box className={classes.stepperContainer}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  {getStepContent(index)}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
      </DialogContent>

      <DialogActions className={classes.actionButtons}>
        <Button onClick={handleClose} disabled={loading}>
          {activeStep === steps.length - 1 ? 'Close' : 'Cancel'}
        </Button>
        
        {activeStep > 0 && activeStep < steps.length - 1 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        
        {activeStep < steps.length - 2 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={activeStep === 0 && files.length === 0}
          >
            Next
          </Button>
        )}
        
        {activeStep === steps.length - 2 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
          >
            Create Pull Request
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
