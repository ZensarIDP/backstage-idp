import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  Typography,
  IconButton,
  Chip,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  Close as CloseIcon,
  CloudQueue as TerraformIcon,
  Build as CicdIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  PlayArrow as UsePromptIcon,
} from '@material-ui/icons';
import { PredefinedPrompt, PredefinedPromptsService } from '../../services/predefinedPromptsService';

const useStyles = makeStyles(() => ({
  promptsPanel: {
    position: 'absolute',
    bottom: 60, // Position above the input (leaving space for input container)
    left: 0,
    right: 0,
    top: 0, // Extend to top for full height
    backgroundColor: '#252526',
    borderTop: '1px solid #2d2d30',
    borderRadius: '8px 8px 0 0',
    boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.3s ease-out',
    transform: 'translateY(100%)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    '&.open': {
      transform: 'translateY(0)',
    },
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 60, // Don't cover the input area
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    transition: 'opacity 0.3s ease-out',
    opacity: 0,
    pointerEvents: 'none',
    '&.open': {
      opacity: 1,
      pointerEvents: 'auto',
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #2d2d30',
    backgroundColor: '#252526',
    minHeight: 48,
  },
  headerTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#cccccc',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  closeButton: {
    color: '#cccccc',
    padding: 6,
    '&:hover': {
      backgroundColor: '#2a2d2e',
    },
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: 0,
  },
  categorySection: {
    marginBottom: 8,
  },
  categoryHeader: {
    padding: '8px 16px',
    backgroundColor: '#2d2d30',
    borderBottom: '1px solid #3e3e42',
    fontSize: '12px',
    fontWeight: 600,
    color: '#969696',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #2d2d30',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#2a2d2e',
    },
    '&:active': {
      backgroundColor: '#094771',
    },
  },
  promptIcon: {
    color: '#007acc',
    fontSize: 20,
    minWidth: 32,
  },
  promptContent: {
    flex: 1,
    marginLeft: 8,
  },
  promptTitle: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#cccccc',
    marginBottom: 4,
    lineHeight: 1.3,
  },
  promptDescription: {
    fontSize: '11px',
    color: '#969696',
    lineHeight: 1.4,
    marginBottom: 6,
  },
  promptCategory: {
    marginTop: 4,
  },
  categoryChip: {
    height: 18,
    fontSize: '10px',
    backgroundColor: '#007acc',
    color: '#ffffff',
    '& .MuiChip-label': {
      padding: '0 6px',
      fontWeight: 500,
    },
  },
  actionButton: {
    color: '#007acc',
    padding: 4,
    marginLeft: 8,
    '&:hover': {
      backgroundColor: 'rgba(0, 122, 204, 0.1)',
    },
  },
  emptyState: {
    padding: '32px 16px',
    textAlign: 'center',
    color: '#969696',
    fontSize: '13px',
  },
}));

interface PredefinedPromptsDrawerProps {
  open: boolean;
  onClose: () => void;
  onPromptSelect: (prompt: PredefinedPrompt) => void;
}

const getIconByName = (iconName: string) => {
  switch (iconName) {
    case 'CloudQueue':
      return <TerraformIcon />;
    case 'Build':
      return <CicdIcon />;
    case 'Security':
      return <SecurityIcon />;
    case 'Storage':
      return <StorageIcon />;
    default:
      return <CicdIcon />;
  }
};

export const PredefinedPromptsDrawer: React.FC<PredefinedPromptsDrawerProps> = ({
  open,
  onClose,
  onPromptSelect,
}) => {
  const classes = useStyles();
  const categories = PredefinedPromptsService.getCategories();

  const handlePromptClick = (prompt: PredefinedPrompt) => {
    onPromptSelect(prompt);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div 
        className={`${classes.overlay} ${open ? 'open' : ''}`}
        onClick={onClose}
      />
      <div className={`${classes.promptsPanel} ${open ? 'open' : ''}`}>
        <div className={classes.header}>
          <Typography className={classes.headerTitle}>
            <CicdIcon style={{ fontSize: 16 }} />
            DevOps Prompts
          </Typography>
          <IconButton
            onClick={onClose}
            className={classes.closeButton}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        <div className={classes.content}>
          {categories.length === 0 ? (
            <div className={classes.emptyState}>
              No predefined prompts available
            </div>
          ) : (
            categories.map((category) => {
              const categoryPrompts = PredefinedPromptsService.getPromptsByCategory(category);
              
              return (
                <div key={category} className={classes.categorySection}>
                  <div className={classes.categoryHeader}>
                    {category}
                  </div>
                  
                  <List dense>
                    {categoryPrompts.map((prompt) => (
                      <ListItem
                        key={prompt.id}
                        className={classes.promptItem}
                        onClick={() => handlePromptClick(prompt)}
                        component="div"
                      >
                        <ListItemIcon className={classes.promptIcon}>
                          {getIconByName(prompt.icon)}
                        </ListItemIcon>
                        
                        <div className={classes.promptContent}>
                          <Typography className={classes.promptTitle}>
                            {prompt.title}
                          </Typography>
                          <Typography className={classes.promptDescription}>
                            {prompt.description}
                          </Typography>
                          <Box className={classes.promptCategory}>
                            <Chip
                              label={prompt.category}
                              size="small"
                              className={classes.categoryChip}
                            />
                          </Box>
                        </div>
                        
                        <IconButton
                          className={classes.actionButton}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePromptClick(prompt);
                          }}
                        >
                          <UsePromptIcon fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
