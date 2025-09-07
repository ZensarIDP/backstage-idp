import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
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
  Visibility as ViewIcon,
  FolderOpen as FolderIcon,
  InsertDriveFile as FileIcon,
  Code as CodeIcon,
  CheckBox as CheckBoxIcon,
} from '@material-ui/icons';
import GitHubIcon from '@material-ui/icons/GitHub';
import { Entity } from '@backstage/catalog-model';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#1e1e1e', // VS Code editor background
    color: '#cccccc',
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#252526',
    borderBottom: '1px solid #2d2d30',
    fontSize: '13px',
    minHeight: 35,
    '& .MuiChip-root': {
      backgroundColor: '#007acc',
      color: '#ffffff',
      fontWeight: 500,
      fontSize: '11px',
      height: 18,
    },
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: 250,
    borderRight: '1px solid #2d2d30',
    backgroundColor: '#252526',
    display: 'flex',
    flexDirection: 'column',
  },
  fileList: {
    flex: 1,
    overflow: 'auto',
    backgroundColor: '#252526',
    '& .MuiList-root': {
      padding: 0,
    },
  },
  mainEditor: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1e1e1e',
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    minWidth: 0, // Important for flex children to shrink properly
  },
  tabsContainer: {
    backgroundColor: '#252526',
    borderBottom: '1px solid #2d2d30',
    minHeight: 35,
    '& .MuiTabs-root': {
      minHeight: 35,
    },
    '& .MuiTabs-flexContainer': {
      height: 35,
    },
    '& .MuiTab-root': {
      fontWeight: 400,
      color: '#969696',
      textTransform: 'none',
      fontSize: '13px',
      minHeight: 35,
      padding: '0 16px',
      backgroundColor: '#2d2d30',
      marginRight: '1px',
      borderTopLeftRadius: '4px',
      borderTopRightRadius: '4px',
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: '#37373d',
        color: '#ffffff',
      },
      '&.Mui-selected': {
        color: '#ffffff',
        backgroundColor: '#1e1e1e',
        '&:hover': {
          backgroundColor: '#1e1e1e',
        },
      },
    },
    '& .MuiTabs-scrollButtons': {
      color: '#969696',
      '&:hover': {
        backgroundColor: '#37373d',
      },
      '&.Mui-disabled': {
        color: '#3c3c3c',
      },
    },
  },
  editorContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  fileTab: {
    minWidth: 120,
    maxWidth: 200,
    textTransform: 'none',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '& .MuiTab-wrapper': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    '&.modified': {
      fontWeight: 'bold',
      color: '#ffffff',
    },
    '&.ai-generated': {
      color: '#4fc3f7',
      '&::before': {
        content: '"✨"',
        marginRight: 4,
      },
    },
  },
  codeEditor: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
    padding: 0,
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    border: 'none',
    margin: 0,
    fontSize: '14px',
    lineHeight: 1.4,
    overflow: 'hidden',
  },
  fileStatusChip: {
    margin: '0 4px',
    height: 16,
    fontSize: '10px',
    fontWeight: 500,
  },
  prSelectionDialog: {
    minWidth: 600,
    '& .MuiDialog-paper': {
      backgroundColor: '#252526',
      color: '#cccccc',
    },
  },
  fileTreeItem: {
    padding: '2px 8px',
    margin: 0,
    borderRadius: 0,
    color: '#cccccc',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'background-color 0.1s',
    fontSize: '13px',
    minHeight: 22,
    '&:hover': {
      backgroundColor: '#2a2d2e',
    },
    '&.selected': {
      backgroundColor: '#094771',
      color: '#ffffff',
    },
    '& .MuiListItemIcon-root': {
      minWidth: 20,
      '& .MuiSvgIcon-root': {
        fontSize: 16,
      },
    },
    '& .MuiListItemText-primary': {
      fontSize: '13px',
    },
  },
  fileActionButtons: {
    display: 'flex',
    gap: 8,
    padding: '8px 12px',
    backgroundColor: '#252526',
    borderTop: '1px solid #2d2d30',
    '& .MuiButton-root': {
      textTransform: 'none',
      fontWeight: 400,
      fontSize: '13px',
      color: '#cccccc',
      '&:hover': {
        backgroundColor: '#2a2d2e',
      },
    },
  },
  breadcrumbs: {
    padding: '4px 12px',
    backgroundColor: '#1e1e1e',
    borderBottom: '1px solid #2d2d30',
    fontSize: '12px',
    color: '#969696',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  editorLineNumbers: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 50,
    backgroundColor: '#1e1e1e',
    color: '#858585',
    fontSize: '12px',
    lineHeight: '19.2px',
    textAlign: 'right',
    paddingRight: 8,
    userSelect: 'none',
    borderRight: '1px solid #2d2d30',
  },
  editorContent: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  codeEditorTextField: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        border: '1px solid #2d2d30', // Subtle border instead of thick default
        borderRadius: 0,
      },
      '&:hover fieldset': {
        border: '1px solid #464647', // Slightly brighter on hover
      },
      '&.Mui-focused fieldset': {
        border: '1px solid #007acc', // VS Code blue when focused
        boxShadow: '0 0 0 1px rgba(0, 122, 204, 0.3)',
      },
    },
    '& .MuiOutlinedInput-input': {
      padding: '12px 16px 12px 60px', // Left padding for line numbers
    },
  },
  viewModeContent: {
    '& pre': {
      margin: 0,
      padding: '12px 16px 12px 60px',
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4',
      border: 'none',
      borderRadius: 0,
      fontSize: '14px',
      lineHeight: '19.2px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      height: '100%',
      overflow: 'auto',
      fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
      position: 'relative',
      boxSizing: 'border-box',
      '&::-webkit-scrollbar': {
        width: 12,
        height: 12,
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: '#1e1e1e',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#424242',
        borderRadius: 6,
        '&:hover': {
          backgroundColor: '#565656',
        },
      },
    },
  },
  lineNumbers: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 50,
    height: '100%',
    backgroundColor: '#1e1e1e',
    color: '#858585',
    fontSize: '12px',
    lineHeight: '19.2px',
    textAlign: 'right',
    paddingRight: 8,
    paddingTop: 12,
    userSelect: 'none',
    borderRight: '1px solid #2d2d30',
    zIndex: 1,
  },
  // Enhanced tab styling with proper overflow handling
  enhancedTabsContainer: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    backgroundColor: '#252526',
    borderBottom: '1px solid #2d2d30',
    '& .MuiTabs-root': {
      minHeight: 35,
      maxWidth: '100%',
      '& .MuiTabs-flexContainer': {
        maxWidth: '100%',
      },
      '& .MuiTabs-scroller': {
        maxWidth: '100%',
        overflow: 'hidden',
      },
      '& .MuiTab-root': {
        minHeight: 35,
        minWidth: 80,
        maxWidth: 180,
        padding: '6px 12px',
        fontSize: '13px',
        fontWeight: 400,
        textTransform: 'none',
        color: '#cccccc',
        backgroundColor: '#2d2d30',
        border: '1px solid #2d2d30',
        borderBottom: 'none',
        marginRight: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        '&:hover': {
          backgroundColor: '#383838',
          color: '#ffffff',
        },
        '&.Mui-selected': {
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
          borderColor: '#007acc',
        },
      },
      '& .MuiTabs-scrollButtons': {
        color: '#969696',
        backgroundColor: '#252526',
        width: 32,
        '&:hover': {
          backgroundColor: '#37373d',
        },
        '&.Mui-disabled': {
          color: '#3c3c3c',
        },
      },
    },
    '& .MuiTabs-indicator': {
      display: 'none',
    },
  },
  // Enhanced toolbar styling
  enhancedToolbar: {
    backgroundColor: '#252526',
    borderBottom: '1px solid #2d2d30',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    '& .MuiButton-root': {
      minWidth: 'auto',
      padding: '4px 8px',
      fontSize: '12px',
      fontWeight: 500,
      textTransform: 'none',
      borderRadius: 3,
      '&.primary': {
        backgroundColor: '#007acc',
        color: '#ffffff',
        '&:hover': {
          backgroundColor: '#005a9e',
        },
      },
      '&.secondary': {
        backgroundColor: 'transparent',
        color: '#cccccc',
        border: '1px solid #464647',
        '&:hover': {
          backgroundColor: '#2d2d30',
        },
      },
    },
  },
  // Status indicators
  statusIndicator: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '11px',
    fontWeight: 500,
    padding: '2px 6px',
    borderRadius: 3,
    '&.modified': {
      backgroundColor: 'rgba(255, 193, 7, 0.1)',
      color: '#ffc107',
    },
    '&.saved': {
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      color: '#4caf50',
    },
    '&.new': {
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      color: '#2196f3',
    },
  },
  // Modern Unified Diff view styles
  unifiedDiffContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
    fontSize: '14px',
    backgroundColor: '#1e1e1e',
    overflow: 'hidden',
  },
  unifiedDiffContent: {
    flex: 1,
    overflow: 'auto',
    backgroundColor: '#1e1e1e',
    '&::-webkit-scrollbar': {
      width: 12,
      height: 12,
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: '#1e1e1e',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#424242',
      borderRadius: 6,
      '&:hover': {
        backgroundColor: '#565656',
      },
    },
  },
  unifiedDiffLine: {
    display: 'flex',
    minHeight: '20px',
    lineHeight: '20px',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    margin: 0,
    padding: 0,
    width: '100%',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
    },
  },
  diffLineNumbers: {
    display: 'flex',
    backgroundColor: '#252526',
    borderRight: '1px solid #2d2d30',
    flexShrink: 0,
    userSelect: 'none',
  },
  oldLineNumber: {
    color: '#858585',
    fontSize: '12px',
    width: '50px',
    textAlign: 'right',
    paddingRight: '8px',
    paddingLeft: '4px',
  },
  newLineNumber: {
    color: '#858585',
    fontSize: '12px',
    width: '50px',
    textAlign: 'right',
    paddingRight: '8px',
    paddingLeft: '4px',
    borderLeft: '1px solid #2d2d30',
  },
  linePrefix: {
    width: '20px',
    textAlign: 'center',
    fontWeight: 'bold',
    flexShrink: 0,
    userSelect: 'none',
  },
  lineContent: {
    flex: 1,
    paddingLeft: '12px',
    paddingRight: '8px',
    whiteSpace: 'pre',
    overflow: 'visible',
    minWidth: 0,
  },
  // Line type styles
  added: {
    backgroundColor: 'rgba(13, 245, 13, 0.15)',
    '& $linePrefix': {
      color: '#03be00ff',
    },
    '& $lineContent': {
      color: '#e6ffed',
    },
  },
  removed: {
    backgroundColor: 'rgba(243, 83, 75, 0.15)',
    '& $linePrefix': {
      color: '#ff0d00ff',
    },
    '& $lineContent': {
      color: '#ffeef0',
    },
  },
  unchanged: {
    '& $linePrefix': {
      color: '#858585',
    },
    '& $lineContent': {
      color: '#cccccc',
    },
  },
  diffViewHeader: {
    padding: '12px 16px',
    backgroundColor: '#252526',
    borderBottom: '1px solid #2d2d30',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& .MuiButton-root': {
      textTransform: 'none',
      fontSize: '13px',
    },
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
  aiGeneratedFiles?: Array<{ path: string; content: string; isNew: boolean; originalContent?: string }>;
  onCreatePR: (selectedFiles: FileState[]) => Promise<void>;
  onRequestAIEdit: (filePath: string, content: string, instruction: string) => Promise<string>;
  onFileSave?: (filePath: string, content: string, isNew: boolean) => void;
  githubToken?: string;
  hideSidebar?: boolean;
  hideToolbar?: boolean;
}

export type FileWorkspaceManagerHandle = {
  openFile: (path: string) => void;
  openDiffView: (path: string) => void;
  clearAllModifications?: () => void;
};

export const FileWorkspaceManager = forwardRef<FileWorkspaceManagerHandle, FileWorkspaceManagerProps>(({ 
  repository,
  existingFiles,
  aiGeneratedFiles = [],
  onCreatePR,
  onRequestAIEdit,
  onFileSave,
  hideSidebar = false,
  hideToolbar = false,
}, ref) => {
  const classes = useStyles();
  
  // File workspace state
  const [files, setFiles] = useState<Map<string, FileState>>(new Map());
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingContent, setEditingContent] = useState<string>('');
  const [currentRepository, setCurrentRepository] = useState<Entity | undefined>(repository);
  
  // Diff view state
  const [isDiffView, setIsDiffView] = useState<boolean>(false);
  const [diffFile, setDiffFile] = useState<string>('');
  
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

  // Diff-related functions
  const generateDiffLines = (originalContent: string, newContent: string) => {
    const originalLines = originalContent.split('\n');
    const newLines = newContent.split('\n');
    const diffLines: Array<{
      type: 'added' | 'removed' | 'unchanged';
      content: string;
      lineNumber: number;
      originalLineNumber?: number;
    }> = [];

    // Simple line-by-line diff (can be enhanced with more sophisticated diff algorithms)
    const maxLength = Math.max(originalLines.length, newLines.length);
    let originalIndex = 0;
    let newIndex = 0;

    for (let i = 0; i < maxLength; i++) {
      const originalLine = originalLines[originalIndex];
      const newLine = newLines[newIndex];

      if (originalIndex >= originalLines.length) {
        // Only new lines remaining
        diffLines.push({
          type: 'added',
          content: newLine || '',
          lineNumber: newIndex + 1,
        });
        newIndex++;
      } else if (newIndex >= newLines.length) {
        // Only original lines remaining
        diffLines.push({
          type: 'removed',
          content: originalLine || '',
          lineNumber: originalIndex + 1,
          originalLineNumber: originalIndex + 1,
        });
        originalIndex++;
      } else if (originalLine === newLine) {
        // Lines are the same
        diffLines.push({
          type: 'unchanged',
          content: originalLine || '',
          lineNumber: newIndex + 1,
          originalLineNumber: originalIndex + 1,
        });
        originalIndex++;
        newIndex++;
      } else {
        // Lines are different - show both as removed and added
        diffLines.push({
          type: 'removed',
          content: originalLine || '',
          lineNumber: originalIndex + 1,
          originalLineNumber: originalIndex + 1,
        });
        diffLines.push({
          type: 'added',
          content: newLine || '',
          lineNumber: newIndex + 1,
        });
        originalIndex++;
        newIndex++;
      }
    }

    return diffLines;
  };

  const openDiffView = useCallback((filePath: string) => {
    setDiffFile(filePath);
    setIsDiffView(true);
    setIsEditing(false);
    // Don't add to tabs for diff view, it's a special view
  }, []);

  const closeDiffView = useCallback(() => {
    setIsDiffView(false);
    setDiffFile('');
  }, []);

  // Close all tabs when repository changes
  useEffect(() => {
    if (currentRepository?.metadata?.name !== repository?.metadata?.name) {
      setOpenTabs([]);
      setActiveTab('');
      setIsEditing(false);
      setEditingContent('');
      setIsDiffView(false);
      setDiffFile('');
      setCurrentRepository(repository);
    }
  }, [repository, currentRepository]);

  // Initialize workspace with existing and AI-generated files
  useEffect(() => {
    setFiles(prevFiles => {
      const fileMap = new Map(prevFiles); // Start with existing files to preserve manual changes
      
      // Add/update existing files (only if not already manually modified)
      existingFiles.forEach(file => {
        const existingFile = fileMap.get(file.path);
        if (!existingFile || (!existingFile.isModified && !existingFile.isAIGenerated)) {
          // Only update if file doesn't exist or hasn't been modified
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
        } else if (existingFile && !existingFile.originalContent) {
          // Update original content if it's missing but preserve current content
          fileMap.set(file.path, {
            ...existingFile,
            originalContent: file.content || '',
          });
        }
      });

      // Add/update AI-generated files
      aiGeneratedFiles.forEach(file => {
        const existingFile = fileMap.get(file.path);
        if (existingFile) {
          // File exists - update it while preserving original content
          const trueOriginalContent = existingFile.originalContent || 
                                     file.originalContent || 
                                     existingFile.content;
          fileMap.set(file.path, {
            ...existingFile,
            content: file.content,
            originalContent: trueOriginalContent, // Preserve the true original
            isModified: true,
            isAIGenerated: true,
            isSelected: true,
            isNew: file.isNew && !trueOriginalContent, // Only new if no original content
            lastModified: new Date(),
          });
        } else {
          // New file - create fresh
          fileMap.set(file.path, {
            path: file.path,
            content: file.content,
            originalContent: file.originalContent || (file.isNew ? '' : file.content),
            isModified: true,
            isAIGenerated: true,
            isSelected: true,
            isNew: file.isNew,
            language: getLanguageFromPath(file.path),
            lastModified: new Date(),
          });
        }
      });

      return fileMap;
    });

    // Auto-open AI-generated files in tabs (add to existing tabs, don't replace)
    const aiFiles = aiGeneratedFiles.map(f => f.path);
    if (aiFiles.length > 0) {
      setOpenTabs(prevTabs => {
        const newTabs = [...prevTabs];
        aiFiles.forEach(path => {
          if (!newTabs.includes(path)) {
            newTabs.push(path);
          }
        });
        return newTabs;
      });
      // Set active tab to the first new AI file
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

  const clearAllModifications = useCallback(() => {
    setFiles(prevFiles => {
      const newFiles = new Map(prevFiles);
      newFiles.forEach((file, path) => {
        newFiles.set(path, {
          ...file,
          isModified: false,
          content: file.originalContent || file.content
        });
      });
      return newFiles;
    });
    setIsEditing(false);
    setEditingContent('');
  }, []);

  useImperativeHandle(ref, () => ({
    openFile,
    openDiffView,
    clearAllModifications,
  }), [openFile, openDiffView, clearAllModifications]);

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
        const modified = editingContent !== (file.originalContent || '');
        updateFile(activeTab, {
          content: editingContent,
          isModified: modified,
          isSelected: modified ? true : file.isSelected,
        });
        
        // Notify parent component about manual file save
        if (modified && onFileSave) {
          onFileSave(activeTab, editingContent, file.isNew || false);
        }
      }
      setIsEditing(false);
    }
  }, [activeTab, isEditing, editingContent, files, updateFile, onFileSave]);

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
      {!hideToolbar && (
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
      )}

      <div className={classes.content}>
        {/* File Tree Sidebar (optional) */}
        {!hideSidebar && (
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
        )}

        {/* Main Editor */}
        <div className={classes.mainEditor}>
          {/* Tabs with Enhanced Material-UI Scrolling */}
          {openTabs.length > 0 && (
            <div className={classes.enhancedTabsContainer}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                TabIndicatorProps={{
                  style: { 
                    backgroundColor: '#007acc',
                    height: '2px'
                  }
                }}
                style={{ 
                  minHeight: '35px',
                  maxWidth: '100%',
                  width: '100%'
                }}
              >
                {openTabs.map(path => {
                  const file = files.get(path);
                  return (
                    <Tab
                      key={path}
                      value={path}
                      className={`${classes.fileTab} ${file?.isModified ? 'modified' : ''} ${file?.isAIGenerated ? 'ai-generated' : ''}`}
                      style={{
                        minWidth: '80px',
                        maxWidth: '180px',
                        width: 'auto',
                        textTransform: 'none',
                        fontSize: '13px',
                        color: activeTab === path ? '#ffffff' : '#969696',
                        backgroundColor: activeTab === path ? '#1e1e1e' : '#2d2d30',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      label={
                        <Box 
                          display="flex" 
                          alignItems="center" 
                          style={{ 
                            gap: 6, 
                            maxWidth: '180px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          <span 
                            style={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1
                            }}
                          >
                            {path.split('/').pop()}
                          </span>
                          {file?.isModified && (
                            <span 
                              style={{ 
                                color: '#ff9800', 
                                fontSize: '16px',
                                lineHeight: 1,
                                flexShrink: 0
                              }}
                            >
                              ●
                            </span>
                          )}
                          <span
                            style={{ 
                              padding: '2px',
                              marginLeft: '2px',
                              color: '#969696',
                              flexShrink: 0,
                              cursor: 'pointer',
                              borderRadius: '3px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '18px',
                              height: '18px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              closeTab(path);
                            }}
                            title="Close tab"
                          >
                            <CloseIcon style={{ fontSize: '14px' }} />
                          </span>
                        </Box>
                      }
                    />
                  );
                })}
              </Tabs>
            </div>
          )}

          {/* Editor Content */}
          {isDiffView && diffFile ? (
            // Diff View
            (() => {
              const file = files.get(diffFile);
              if (!file) return null;
              
              // Ensure we have proper original content for diff
              const originalContent = file.originalContent || '';
              const currentContent = file.content || '';
              
              // Verify content synchronization (for debugging)
              const isContentInSync = currentContent === file.content;
              
              // Debug log to help identify issues
              console.log('Diff View Debug:', {
                filePath: file.path,
                hasOriginal: !!file.originalContent,
                originalLength: originalContent.length,
                currentLength: currentContent.length,
                isModified: file.isModified,
                isAIGenerated: file.isAIGenerated,
                isNew: file.isNew,
                contentInSync: isContentInSync
              });
              
              const diffLines = generateDiffLines(originalContent, currentContent);
              
              return (
                <div className={classes.editorContainer}>
                  {/* Diff View Header */}
                  <div className={classes.diffViewHeader}>
                    <Typography variant="h6" style={{ color: '#cccccc' }}>
                      Diff: {file.path}
                    </Typography>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Button
                        size="small"
                        onClick={closeDiffView}
                        style={{ color: '#cccccc' }}
                      >
                        Close Diff
                      </Button>
                    </div>
                  </div>
                  
                  {/* Diff Content */}
                  {file.isNew ? (
                    // New File View - Unified view showing all content as added
                    <div className={classes.unifiedDiffContainer}>
                      <div className={classes.unifiedDiffContent}>
                        {currentContent.split('\n').map((line, index) => (
                          <div
                            key={index}
                            className={`${classes.unifiedDiffLine} ${classes.added}`}
                          >
                            <div className={classes.diffLineNumbers}>
                              <span className={classes.oldLineNumber}></span>
                              <span className={classes.newLineNumber}>{index + 1}</span>
                            </div>
                            <div className={classes.linePrefix}>+</div>
                            <div className={classes.lineContent}>{line}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Modern Unified Diff View
                    <div className={classes.unifiedDiffContainer}>
                      <div className={classes.unifiedDiffContent}>
                        {diffLines.map((line, index) => (
                          <div
                            key={index}
                            className={`${classes.unifiedDiffLine} ${classes[line.type]}`}
                          >
                            <div className={classes.diffLineNumbers}>
                              <span className={classes.oldLineNumber}>
                                {line.originalLineNumber || ''}
                              </span>
                              <span className={classes.newLineNumber}>
                                {line.lineNumber || ''}
                              </span>
                            </div>
                            <div className={classes.linePrefix}>
                              {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                            </div>
                            <div className={classes.lineContent}>
                              {line.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          ) : activeFile ? (
            // Normal Editor View
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

              {/* Breadcrumbs */}
              <div className={classes.breadcrumbs}>
                <span>{activeFile.path}</span>
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
                    className={classes.codeEditorTextField}
                    InputProps={{
                      style: {
                        fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                        fontSize: '14px',
                        backgroundColor: '#1e1e1e',
                        color: '#d4d4d4',
                        height: '100%',
                      }
                    }}
                    style={{
                      height: '100%',
                    }}
                    inputProps={{
                      style: {
                        height: 'calc(100% - 16px)',
                        overflow: 'auto',
                        resize: 'none',
                      }
                    }}
                  />
                ) : (
                  <div className={`${classes.editorContent} ${classes.viewModeContent}`}>
                    <pre>
                      {/* Line numbers */}
                      <div className={classes.lineNumbers}>
                        {activeFile.content.split('\n').map((_, index) => (
                          <div key={index}>{index + 1}</div>
                        ))}
                      </div>
                      {activeFile.content}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Empty state when no files are open and not in diff view
            !isDiffView && (
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
            )
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
});
