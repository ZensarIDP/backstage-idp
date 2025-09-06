import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Switch,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  GitHub as GitHubIcon,
  Visibility as ViewIcon,
  FolderOpen as FolderIcon,
  InsertDriveFile as FileIcon,
  Code as CodeIcon,
  CheckBox as CheckBoxIcon,
} from '@material-ui/icons';
import { Entity } from '@backstage/catalog-model';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.grey[50],
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: 300,
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.grey[50],
    display: 'flex',
    flexDirection: 'column',
  },
  fileList: {
    flex: 1,
    overflow: 'auto',
  },
  mainEditor: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  tabsContainer: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  editorContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  fileTab: {
    minWidth: 120,
    '&.modified': {
      fontWeight: 'bold',
      color: theme.palette.warning.main,
    },
    '&.ai-generated': {
      color: theme.palette.primary.main,
    },
  },
  codeEditor: {
    flex: 1,
    overflow: 'auto',
    fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
    padding: theme.spacing(2),
    backgroundColor: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: theme.spacing(1),
    margin: theme.spacing(1),
  },
  fileStatusChip: {
    margin: theme.spacing(0, 0.5),
    height: 20,
    fontSize: '0.7rem',
  },
  prSelectionDialog: {
    minWidth: 600,
  },
  fileTreeItem: {
    padding: theme.spacing(0.5, 1),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.selected': {
      backgroundColor: theme.palette.primary.light,
    },
  },
  fileActionButtons: {
    display: 'flex',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
}));

export interface FileState {
  path: string;
  content: string;
  originalContent?: string;
  isModified: boolean;
  isAIGenerated: boolean;
  isSelected: boolean;
  isNew: boolean;
  language?: string;
  lastModified: Date;
}

interface FileWorkspaceManagerProps {
  repository?: Entity;
  existingFiles: Array<{ path: string; content?: string; type: string }>;
  aiGeneratedFiles?: Array<{ path: string; content: string; isNew: boolean }>;
  onCreatePR: (selectedFiles: FileState[]) => Promise<void>;
  onRequestAIEdit: (filePath: string, content: string, instruction: string) => Promise<string>;
  githubToken?: string;
}

export const FileWorkspaceManager: React.FC<FileWorkspaceManagerProps> = ({
  existingFiles,
  aiGeneratedFiles = [],
  onCreatePR,
  onRequestAIEdit,
}) => {
  const classes = useStyles();
  
  // File workspace state
  const [files, setFiles] = useState<Map<string, FileState>>(new Map());
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingContent, setEditingContent] = useState<string>('');
  
  // UI state
  const [showPRDialog, setShowPRDialog] = useState<boolean>(false);
  const [showOnlyModified, setShowOnlyModified] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; filePath: string } | null>(null);
  
  // AI integration state
  const [aiEditDialog, setAiEditDialog] = useState<{ open: boolean; filePath: string; instruction: string }>({
    open: false,
    filePath: '',
    instruction: '',
  });

  // Helper functions
  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
      py: 'python', java: 'java', cpp: 'cpp', c: 'c', cs: 'csharp',
      php: 'php', rb: 'ruby', go: 'go', rs: 'rust', swift: 'swift',
      yml: 'yaml', yaml: 'yaml', json: 'json', xml: 'xml',
      html: 'html', css: 'css', scss: 'scss', md: 'markdown',
      dockerfile: 'dockerfile', sh: 'bash', ps1: 'powershell',
    };
    return languageMap[ext || ''] || 'text';
  };

  // Initialize workspace with existing and AI-generated files
  useEffect(() => {
    const fileMap = new Map<string, FileState>();
    
    // Add existing files
    existingFiles.forEach(file => {
      fileMap.set(file.path, {
        path: file.path,
        content: file.content || '',
        originalContent: file.content || '',
        isModified: false,
        isAIGenerated: false,
        isSelected: false,
        isNew: false,
        language: getLanguageFromPath(file.path),
        lastModified: new Date(),
      });
    });

    // Add AI-generated files
    aiGeneratedFiles.forEach(file => {
      fileMap.set(file.path, {
        path: file.path,
        content: file.content,
        originalContent: file.isNew ? '' : file.content,
        isModified: true,
        isAIGenerated: true,
        isSelected: true,
        isNew: file.isNew,
        language: getLanguageFromPath(file.path),
        lastModified: new Date(),
      });
    });

    setFiles(fileMap);

    // Auto-open AI-generated files in tabs
    const aiFiles = aiGeneratedFiles.map(f => f.path);
    if (aiFiles.length > 0) {
      setOpenTabs(aiFiles);
      setActiveTab(aiFiles[0]);
    }
  }, [existingFiles, aiGeneratedFiles]);

  const updateFile = useCallback((path: string, updates: Partial<FileState>) => {
    setFiles(prev => {
      const newFiles = new Map(prev);
      const existingFile = newFiles.get(path);
      if (existingFile) {
        newFiles.set(path, { ...existingFile, ...updates, lastModified: new Date() });
      }
      return newFiles;
    });
  }, []);

  const openFile = useCallback((path: string) => {
    if (!openTabs.includes(path)) {
      setOpenTabs(prev => [...prev, path]);
    }
    setActiveTab(path);
    setIsEditing(false);
  }, [openTabs]);

  const closeTab = useCallback((path: string) => {
    setOpenTabs(prev => {
      const newTabs = prev.filter(tab => tab !== path);
      if (activeTab === path && newTabs.length > 0) {
        setActiveTab(newTabs[newTabs.length - 1]);
      } else if (newTabs.length === 0) {
        setActiveTab('');
      }
      return newTabs;
    });
  }, [activeTab]);

  const saveFile = useCallback(() => {
    if (activeTab && isEditing) {
      const file = files.get(activeTab);
      if (file) {
        updateFile(activeTab, {
          content: editingContent,
          isModified: editingContent !== (file.originalContent || ''),
        });
      }
      setIsEditing(false);
    }
  }, [activeTab, isEditing, editingContent, files, updateFile]);

  const toggleFileSelection = useCallback((path: string) => {
    const file = files.get(path);
    if (file) {
      updateFile(path, { isSelected: !file.isSelected });
    }
  }, [files, updateFile]);

  const handleAIEdit = async () => {
    const { filePath, instruction } = aiEditDialog;
    const file = files.get(filePath);
    
    if (file && instruction) {
      try {
        const updatedContent = await onRequestAIEdit(filePath, file.content, instruction);
        updateFile(filePath, {
          content: updatedContent,
          isModified: true,
          isAIGenerated: true,
        });
        setAiEditDialog({ open: false, filePath: '', instruction: '' });
      } catch (error) {
        console.error('AI edit failed:', error);
      }
    }
  };

  const handleCreatePR = async () => {
    const selectedFiles = Array.from(files.values()).filter(file => file.isSelected);
    if (selectedFiles.length > 0) {
      await onCreatePR(selectedFiles);
      setShowPRDialog(false);
    }
  };

  const getFilteredFiles = () => {
    const allFiles = Array.from(files.values());
    if (showOnlyModified) {
      return allFiles.filter(file => file.isModified || file.isAIGenerated);
    }
    return allFiles;
  };

  const activeFile = files.get(activeTab);
  const selectedFilesCount = Array.from(files.values()).filter(f => f.isSelected).length;

  return (
    <div className={classes.root}>
      {/* Toolbar */}
      <div className={classes.toolbar}>
        <Box display="flex" alignItems="center" style={{ gap: 8 }}>
          <Typography variant="h6">File Workspace</Typography>
          <Chip
            size="small"
            label={`${files.size} files`}
            className={classes.fileStatusChip}
          />
          <Chip
            size="small"
            label={`${selectedFilesCount} selected`}
            color="primary"
            className={classes.fileStatusChip}
          />
        </Box>
        
        <Box display="flex" alignItems="center" style={{ gap: 8 }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showOnlyModified}
                onChange={(e) => setShowOnlyModified(e.target.checked)}
              />
            }
            label="Modified only"
          />
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<GitHubIcon />}
            onClick={() => setShowPRDialog(true)}
            disabled={selectedFilesCount === 0}
            size="small"
          >
            Create PR ({selectedFilesCount})
          </Button>
        </Box>
      </div>

      <div className={classes.content}>
        {/* File Tree Sidebar */}
        <div className={classes.sidebar}>
          <div className={classes.fileList}>
            <List dense>
              {getFilteredFiles().map(file => (
                <ListItem
                  key={file.path}
                  button
                  onClick={() => openFile(file.path)}
                  className={`${classes.fileTreeItem} ${activeTab === file.path ? 'selected' : ''}`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY, filePath: file.path });
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      size="small"
                      checked={file.isSelected}
                      onChange={() => toggleFileSelection(file.path)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </ListItemIcon>
                  
                  <ListItemIcon>
                    <FileIcon />
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={file.path.split('/').pop()}
                    secondary={file.path}
                    primaryTypographyProps={{
                      style: {
                        fontWeight: file.isModified ? 'bold' : 'normal',
                        color: file.isAIGenerated ? '#1976d2' : 'inherit',
                      }
                    }}
                  />
                  
                  <ListItemSecondaryAction>
                    <Box display="flex" flexDirection="column" style={{ gap: 4 }}>
                      {file.isAIGenerated && (
                        <Chip size="small" label="AI" color="primary" className={classes.fileStatusChip} />
                      )}
                      {file.isModified && (
                        <Chip size="small" label="Modified" color="secondary" className={classes.fileStatusChip} />
                      )}
                      {file.isNew && (
                        <Chip size="small" label="New" color="default" className={classes.fileStatusChip} />
                      )}
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </div>
        </div>

        {/* Main Editor */}
        <div className={classes.mainEditor}>
          {/* Tabs */}
          {openTabs.length > 0 && (
            <div className={classes.tabsContainer}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {openTabs.map(path => {
                  const file = files.get(path);
                  return (
                    <Tab
                      key={path}
                      value={path}
                      label={
                        <Box display="flex" alignItems="center" style={{ gap: 4 }}>
                          <span>{path.split('/').pop()}</span>
                          {file?.isModified && <span style={{ color: '#ff9800' }}>●</span>}
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              closeTab(path);
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                      className={`${classes.fileTab} ${file?.isModified ? 'modified' : ''} ${file?.isAIGenerated ? 'ai-generated' : ''}`}
                    />
                  );
                })}
              </Tabs>
            </div>
          )}

          {/* Editor Content */}
          {activeFile && (
            <div className={classes.editorContainer}>
              {/* File Actions */}
              <div className={classes.fileActionButtons}>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setIsEditing(true);
                    setEditingContent(activeFile.content);
                  }}
                  disabled={isEditing}
                >
                  Edit
                </Button>
                
                <Button
                  size="small"
                  startIcon={<CodeIcon />}
                  onClick={() => setAiEditDialog({ open: true, filePath: activeTab, instruction: '' })}
                >
                  AI Edit
                </Button>
                
                {isEditing && (
                  <>
                    <Button
                      size="small"
                      startIcon={<SaveIcon />}
                      onClick={saveFile}
                      color="primary"
                    >
                      Save
                    </Button>
                    <Button
                      size="small"
                      startIcon={<CloseIcon />}
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>

              {/* Code Editor */}
              <div className={classes.codeEditor}>
                {isEditing ? (
                  <TextField
                    multiline
                    fullWidth
                    variant="outlined"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    InputProps={{
                      style: {
                        fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                        fontSize: '14px',
                      }
                    }}
                    rows={20}
                  />
                ) : (
                  <pre style={{
                    margin: 0,
                    padding: 16,
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: 4,
                    fontSize: '14px',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    height: '100%',
                    overflow: 'auto',
                    fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                  }}>
                    {activeFile.content}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {openTabs.length === 0 && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              p={4}
            >
              <FolderIcon style={{ fontSize: 64, color: '#ccc', marginBottom: 16 }} />
              <Typography variant="h6" color="textSecondary">
                No files open
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Select a file from the sidebar to start editing
              </Typography>
            </Box>
          )}
        </div>
      </div>

      {/* PR Creation Dialog */}
      <Dialog
        open={showPRDialog}
        onClose={() => setShowPRDialog(false)}
        maxWidth="md"
        fullWidth
        className={classes.prSelectionDialog}
      >
        <DialogTitle>Create Pull Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Select files to include in the pull request:
          </Typography>
          
          <List>
            {Array.from(files.values())
              .filter(file => file.isModified || file.isAIGenerated)
              .map(file => (
                <ListItem key={file.path}>
                  <ListItemIcon>
                    <Checkbox
                      checked={file.isSelected}
                      onChange={() => toggleFileSelection(file.path)}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.path}
                    secondary={
                      <Box display="flex" style={{ gap: 8 }}>
                        {file.isAIGenerated && <Chip size="small" label="AI Generated" color="primary" />}
                        {file.isModified && <Chip size="small" label="Modified" color="secondary" />}
                        {file.isNew && <Chip size="small" label="New File" />}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPRDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreatePR}
            variant="contained"
            color="primary"
            disabled={selectedFilesCount === 0}
          >
            Create PR with {selectedFilesCount} files
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Edit Dialog */}
      <Dialog
        open={aiEditDialog.open}
        onClose={() => setAiEditDialog({ open: false, filePath: '', instruction: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>AI Edit: {aiEditDialog.filePath.split('/').pop()}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Describe the changes you want to make"
            value={aiEditDialog.instruction}
            onChange={(e) => setAiEditDialog(prev => ({ ...prev, instruction: e.target.value }))}
            placeholder="e.g., Add error handling, fix the syntax error, optimize performance..."
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiEditDialog({ open: false, filePath: '', instruction: '' })}>
            Cancel
          </Button>
          <Button
            onClick={handleAIEdit}
            variant="contained"
            color="primary"
            disabled={!aiEditDialog.instruction.trim()}
          >
            Apply AI Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        open={Boolean(contextMenu)}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined}
      >
        <MenuItem onClick={() => {
          if (contextMenu) {
            openFile(contextMenu.filePath);
          }
          setContextMenu(null);
        }}>
          <ViewIcon fontSize="small" style={{ marginRight: 8 }} />
          Open
        </MenuItem>
        <MenuItem onClick={() => {
          if (contextMenu) {
            setAiEditDialog({ open: true, filePath: contextMenu.filePath, instruction: '' });
          }
          setContextMenu(null);
        }}>
          <CodeIcon fontSize="small" style={{ marginRight: 8 }} />
          AI Edit
        </MenuItem>
        <MenuItem onClick={() => {
          if (contextMenu) {
            toggleFileSelection(contextMenu.filePath);
          }
          setContextMenu(null);
        }}>
          <CheckBoxIcon fontSize="small" style={{ marginRight: 8 }} />
          Toggle Selection
        </MenuItem>
      </Menu>
    </div>
  );
};

export default FileWorkspaceManager;
