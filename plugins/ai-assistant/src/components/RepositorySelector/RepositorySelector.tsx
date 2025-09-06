import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(2),
  },
}));

interface Repository {
  name: string;
  owner: string;
  defaultBranch: string;
}

interface RepositorySelectorProps {
  repositories: Repository[];
  selectedRepo: Repository | null;
  selectedBranch: string;
  branches: string[];
  onRepositorySelect: (repo: Repository, branch: string) => void;
  loading: boolean;
}

export const RepositorySelector: React.FC<RepositorySelectorProps> = ({
  repositories,
  selectedRepo,
  selectedBranch,
  branches,
  onRepositorySelect,
  loading,
}) => {
  const classes = useStyles();

  const handleRepoChange = (event: any) => {
    const repoName = event.target.value;
    const repo = repositories.find(r => `${r.owner}/${r.name}` === repoName);
    if (repo) {
      onRepositorySelect(repo, repo.defaultBranch);
    }
  };

  const handleBranchChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const branch = event.target.value as string;
    if (selectedRepo) {
      onRepositorySelect(selectedRepo, branch);
    }
  };

  // Use actual branches from props

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <FormControl fullWidth className={classes.formControl}>
            <InputLabel>Repository</InputLabel>
            <Select
              value={selectedRepo ? `${selectedRepo.owner}/${selectedRepo.name}` : ''}
              onChange={handleRepoChange}
              disabled={loading}
            >
              {repositories.map((repo) => (
                <MenuItem key={`${repo.owner}/${repo.name}`} value={`${repo.owner}/${repo.name}`}>
                  {repo.owner}/{repo.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={4}>
          <FormControl fullWidth className={classes.formControl}>
            <InputLabel>Branch</InputLabel>
            <Select
              value={branches.length > 0 ? selectedBranch : ''}
              onChange={handleBranchChange}
              disabled={!selectedRepo || loading || !branches.length}
            >
              {branches.length === 0 ? (
                <MenuItem value="" disabled>
                  Loading branches...
                </MenuItem>
              ) : (
                branches.map((branch) => (
                  <MenuItem key={branch} value={branch}>
                    {branch}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CircularProgress size={16} />
          <Typography variant="body2">Loading repository contents...</Typography>
        </div>
      )}
    </div>
  );
};
