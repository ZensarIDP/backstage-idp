import React, { useState } from 'react';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  TextField,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  Build as DockerIcon,
  AccountTree as CicdIcon,
  Cloud as TerraformIcon,
  Description as DescriptionIcon,
  Storage as ConfigIcon,
} from '@material-ui/icons';
import { VSCodeTheme, VSCodeLayout } from '../../theme/vscode';
import { Entity } from '@backstage/catalog-model';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    backgroundColor: VSCodeTheme.sidebarBackground,
    color: VSCodeTheme.foreground,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    borderRight: `1px solid ${VSCodeTheme.panelBorder}`,
  },
  header: {
    padding: VSCodeLayout.spacing.sm,
    borderBottom: `1px solid ${VSCodeTheme.panelBorder}`,
    backgroundColor: VSCodeTheme.sidebarBackground,
  },
  sectionTitle: {
    fontSize: VSCodeLayout.fontSize.xs,
    fontWeight: 600,
    color: VSCodeTheme.foreground,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: `${VSCodeLayout.spacing.sm}px ${VSCodeLayout.spacing.md}px`,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
    padding: VSCodeLayout.spacing.sm,
    '& .MuiTextField-root': {
      '& .MuiOutlinedInput-root': {
        backgroundColor: VSCodeTheme.inputBackground,
        color: VSCodeTheme.foreground,
        fontSize: VSCodeLayout.fontSize.sm,
        height: 28,
        '& fieldset': {
          border: `1px solid ${VSCodeTheme.inputBorder}`,
        },
        '&:hover fieldset': {
          borderColor: VSCodeTheme.focusBorder,
        },
        '&.Mui-focused fieldset': {
          borderColor: VSCodeTheme.focusBorder,
        },
      },
      '& .MuiOutlinedInput-input': {
        padding: '4px 8px',
        fontSize: VSCodeLayout.fontSize.sm,
      },
    },
  },
  repositorySection: {
    borderBottom: `1px solid ${VSCodeTheme.panelBorder}`,
  },
  repositoryInfo: {
    padding: VSCodeLayout.spacing.sm,
    backgroundColor: VSCodeTheme.inputBackground,
    margin: VSCodeLayout.spacing.sm,
    borderRadius: VSCodeLayout.borderRadius,
    border: `1px solid ${VSCodeTheme.inputBorder}`,
  },
  repositoryName: {
    fontSize: VSCodeLayout.fontSize.sm,
    fontWeight: 600,
    color: VSCodeTheme.foreground,
    marginBottom: 2,
  },
  branchInfo: {
    fontSize: VSCodeLayout.fontSize.xs,
    color: VSCodeTheme.secondaryForeground,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: VSCodeTheme.successForeground,
  },
  fileList: {
    flex: 1,
    overflow: 'auto',
    padding: 0,
    '& .MuiList-root': {
      padding: 0,
    },
  },
  fileItem: {
    padding: `2px ${VSCodeLayout.spacing.sm}px`,
    margin: 0,
    minHeight: 22,
    color: VSCodeTheme.foreground,
    cursor: 'pointer',
    borderRadius: 0,
    transition: `background-color ${VSCodeLayout.transition.fast}`,
    fontSize: VSCodeLayout.fontSize.sm,
    '&:hover': {
      backgroundColor: VSCodeTheme.explorerHover,
    },
    '&.selected': {
      backgroundColor: VSCodeTheme.explorerSelection,
      color: VSCodeTheme.foreground,
    },
    '&.focus': {
      backgroundColor: VSCodeTheme.explorerFocus,
      color: '#ffffff',
    },
  },
  fileIcon: {
    minWidth: 20,
    '& .MuiSvgIcon-root': {
      fontSize: 16,
    },
  },
  fileName: {
    fontSize: VSCodeLayout.fontSize.sm,
    '& .MuiListItemText-primary': {
      fontSize: VSCodeLayout.fontSize.sm,
      fontWeight: 400,
    },
  },
  folderItem: {
    padding: `1px ${VSCodeLayout.spacing.sm}px`,
  },
  nestedItem: {
    paddingLeft: theme.spacing(4),
  },
  fileTypeChip: {
    height: 16,
    fontSize: VSCodeLayout.fontSize.xs,
    backgroundColor: VSCodeTheme.buttonBackground,
    color: '#ffffff',
    marginLeft: 'auto',
  },
  emptyState: {
    padding: VSCodeLayout.spacing.lg,
    textAlign: 'center',
    color: VSCodeTheme.secondaryForeground,
    fontSize: VSCodeLayout.fontSize.sm,
  },
  actionButtons: {
    '& .MuiIconButton-root': {
      padding: 4,
      color: VSCodeTheme.secondaryForeground,
      '&:hover': {
        backgroundColor: VSCodeTheme.explorerHover,
        color: VSCodeTheme.foreground,
      },
    },
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
  type: 'dockerfile' | 'ci-cd' | 'terraform' | 'helm' | 'config' | 'other';
  content?: string;
}

interface FileExplorerProps {
  repository?: Repository;
  branch?: string;
  files: ExistingFile[];
  loading: boolean;
  onFileSelect: (file: ExistingFile) => void;
  onRefresh: () => void;
  selectedFile?: string;
}

const getFileIcon = (file: ExistingFile) => {
  const ext = file.path.split('.').pop()?.toLowerCase();
  
  switch (file.type) {
    case 'dockerfile':
      return <DockerIcon style={{ color: '#2496ed' }} />;
    case 'ci-cd':
      return <CicdIcon style={{ color: '#4caf50' }} />;
    case 'terraform':
      return <TerraformIcon style={{ color: '#623ce4' }} />;
    case 'helm':
      return <SettingsIcon style={{ color: '#0f1689' }} />;
    case 'config':
      return <ConfigIcon style={{ color: '#ff9800' }} />;
    default:
      switch (ext) {
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
          return <CodeIcon style={{ color: '#f7df1e' }} />;
        case 'json':
          return <DescriptionIcon style={{ color: '#ffca28' }} />;
        case 'yaml':
        case 'yml':
          return <DescriptionIcon style={{ color: '#ff5722' }} />;
        case 'md':
          return <DescriptionIcon style={{ color: '#1976d2' }} />;
        default:
          return <FileIcon style={{ color: VSCodeTheme.secondaryForeground }} />;
      }
  }
};

const getFileTypeLabel = (file: ExistingFile) => {
  switch (file.type) {
    case 'dockerfile': return 'Docker';
    case 'ci-cd': return 'CI/CD';
    case 'terraform': return 'Terraform';
    case 'helm': return 'Helm';
    case 'config': return 'Config';
    default: return '';
  }
};

export const FileExplorer: React.FC<FileExplorerProps> = ({
  repository,
  branch,
  files,
  loading,
  onFileSelect,
  onRefresh,
  selectedFile,
}) => {
  const classes = useStyles();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; file?: ExistingFile } | null>(null);

  // Filter files based on search term
  const filteredFiles = files.filter(file =>
    file.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group files by directory
  const fileTree = React.useMemo(() => {
    const tree: { [key: string]: ExistingFile[] } = {};
    
    filteredFiles.forEach(file => {
      const parts = file.path.split('/');
      if (parts.length === 1) {
        // Root level file
        if (!tree['root']) tree['root'] = [];
        tree['root'].push(file);
      } else {
        // File in subdirectory
        const dir = parts.slice(0, -1).join('/');
        if (!tree[dir]) tree[dir] = [];
        tree[dir].push(file);
      }
    });
    
    return tree;
  }, [filteredFiles]);

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const handleContextMenu = (event: React.MouseEvent, file?: ExistingFile) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      file,
    });
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  return (
    <div className={classes.root}>
      {/* Repository Info Section */}
      <div className={classes.repositorySection}>
        <div className={classes.sectionTitle}>
          <span>Explorer</span>
          <div className={classes.actionButtons}>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={onRefresh}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        
        {repository && (
          <div className={classes.repositoryInfo}>
            <div className={classes.repositoryName}>
              {repository.owner}/{repository.name}
            </div>
            <div className={classes.branchInfo}>
              <div className={classes.statusDot} />
              <span>{branch || 'main'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className={classes.searchContainer}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{ fontSize: 16, color: VSCodeTheme.secondaryForeground }} />
              </InputAdornment>
            ),
          }}
        />
      </div>

      {/* File List */}
      <div className={classes.fileList}>
        {loading ? (
          <div className={classes.emptyState}>
            Loading files...
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className={classes.emptyState}>
            {files.length === 0 ? 'No files found' : 'No files match your search'}
          </div>
        ) : (
          <List dense>
            {Object.entries(fileTree).map(([folderPath, folderFiles]) => (
              <div key={folderPath}>
                {folderPath !== 'root' && (
                  <ListItem
                    button
                    className={`${classes.fileItem} ${classes.folderItem}`}
                    onClick={() => toggleFolder(folderPath)}
                  >
                    <ListItemIcon className={classes.fileIcon}>
                      {expandedFolders.has(folderPath) ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                    </ListItemIcon>
                    <ListItemIcon className={classes.fileIcon}>
                      {expandedFolders.has(folderPath) ? <FolderOpenIcon /> : <FolderIcon />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={folderPath.split('/').pop()} 
                      className={classes.fileName}
                    />
                  </ListItem>
                )}
                
                <Collapse in={folderPath === 'root' || expandedFolders.has(folderPath)} timeout="auto">
                  {folderFiles.map((file) => (
                    <ListItem
                      key={file.path}
                      button
                      className={`${classes.fileItem} ${folderPath !== 'root' ? classes.nestedItem : ''} ${
                        selectedFile === file.path ? 'selected' : ''
                      }`}
                      onClick={() => onFileSelect(file)}
                      onContextMenu={(e) => handleContextMenu(e, file)}
                    >
                      <ListItemIcon className={classes.fileIcon}>
                        {getFileIcon(file)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={file.path.split('/').pop()} 
                        className={classes.fileName}
                      />
                      {getFileTypeLabel(file) && (
                        <Chip
                          label={getFileTypeLabel(file)}
                          size="small"
                          className={classes.fileTypeChip}
                        />
                      )}
                    </ListItem>
                  ))}
                </Collapse>
              </div>
            ))}
          </List>
        )}
      </div>

      {/* Context Menu */}
      <Menu
        keepMounted
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleClose}>
          <FileIcon fontSize="small" style={{ marginRight: 8 }} />
          Open
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <CodeIcon fontSize="small" style={{ marginRight: 8 }} />
          Open to the Side
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <RefreshIcon fontSize="small" style={{ marginRight: 8 }} />
          Reveal in File Explorer
        </MenuItem>
      </Menu>
    </div>
  );
};

export default FileExplorer;
