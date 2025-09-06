import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Typography,
  CircularProgress,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  Description as FileIcon,
  Build as DockerIcon,
  AccountTree as CicdIcon,
  Cloud as TerraformIcon,
  Settings as HelmIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    overflow: 'auto',
  },
  emptyState: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  listItem: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  typeChip: {
    marginLeft: 'auto',
  },
}));

interface ExistingFile {
  path: string;
  type: 'dockerfile' | 'ci-cd' | 'terraform' | 'helm' | 'other';
  content?: string;
}

interface ExistingFilesPanelProps {
  files: ExistingFile[];
  loading: boolean;
}

export const ExistingFilesPanel: React.FC<ExistingFilesPanelProps> = ({
  files,
  loading,
}) => {
  const classes = useStyles();

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'dockerfile':
        return <DockerIcon />;
      case 'ci-cd':
        return <CicdIcon />;
      case 'terraform':
        return <TerraformIcon />;
      case 'helm':
        return <HelmIcon />;
      default:
        return <FileIcon />;
    }
  };

  const getChipColor = (type: string): 'primary' | 'secondary' | 'default' => {
    switch (type) {
      case 'dockerfile':
        return 'primary';
      case 'ci-cd':
        return 'secondary';
      case 'terraform':
        return 'primary';
      case 'helm':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box className={classes.emptyState}>
        <CircularProgress size={24} />
        <Typography variant="body2" style={{ marginTop: 8 }}>
          Scanning repository...
        </Typography>
      </Box>
    );
  }

  if (files.length === 0) {
    return (
      <Box className={classes.emptyState}>
        <Typography variant="body2">
          No configuration files found in this repository.
        </Typography>
      </Box>
    );
  }

  return (
    <div className={classes.container}>
      <List dense>
        {files.map((file, index) => (
          <ListItem key={index} className={classes.listItem}>
            <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>
            <ListItemText
              primary={file.path}
              primaryTypographyProps={{ variant: 'body2' }}
            />
            <Chip
              label={file.type}
              size="small"
              color={getChipColor(file.type)}
              className={classes.typeChip}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
};
