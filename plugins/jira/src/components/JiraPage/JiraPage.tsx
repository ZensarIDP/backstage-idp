import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fab,
} from '@material-ui/core';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Comment as CommentIcon,
} from '@material-ui/icons';
import {
  Header,
  Page,
  Content,
  InfoCard,
  Progress,
  ErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { 
  jiraApiRef, 
  JiraIssue, 
  JiraProject, 
  JiraIssueType, 
  CreateIssueRequest, 
  UpdateIssueRequest,
  type JiraApi 
} from '../../apis';

const getStatusColor = (statusCategory: string) => {
  switch (statusCategory.toLowerCase()) {
    case 'new':
    case 'indeterminate':
      return 'default';
    case 'done':
      return 'primary';
    default:
      return 'secondary';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'highest':
    case 'high':
      return '#ff5252';
    case 'medium':
      return '#ff9800';
    case 'low':
    case 'lowest':
      return '#4caf50';
    default:
      return '#9e9e9e';
  }
};

export const JiraPage = () => {
  const jiraApi = useApi(jiraApiRef) as JiraApi;
  
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [issueTypes, setIssueTypes] = useState<JiraIssueType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  
  // Create/Edit Issue Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<JiraIssue | null>(null);
  const [issueForm, setIssueForm] = useState({
    projectKey: '',
    summary: '',
    description: '',
    issueType: '',
    priority: '',
    assignee: '',
  });
  
  // Comment Dialog
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [comment, setComment] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [projectsData, issuesData] = await Promise.all([
        jiraApi.getProjects(),
        jiraApi.getIssues(selectedProject || undefined, selectedStatus || undefined, selectedAssignee || undefined),
      ]);
      
      setProjects(projectsData);
      setIssues(issuesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadIssueTypes = async (projectKey: string) => {
    try {
      const types = await jiraApi.getIssueTypes(projectKey);
      setIssueTypes(types);
    } catch (err) {
      console.error('Error loading issue types:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProject, selectedStatus, selectedAssignee]);

  const handleCreateIssue = async () => {
    try {
      const request: CreateIssueRequest = {
        projectKey: issueForm.projectKey,
        summary: issueForm.summary,
        description: issueForm.description,
        issueType: issueForm.issueType,
        priority: issueForm.priority || undefined,
        assignee: issueForm.assignee || undefined,
      };
      
      await jiraApi.createIssue(request);
      setCreateDialogOpen(false);
      setIssueForm({
        projectKey: '',
        summary: '',
        description: '',
        issueType: '',
        priority: '',
        assignee: '',
      });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
    }
  };

  const handleEditIssue = async () => {
    if (!selectedIssue) return;
    
    try {
      const request: UpdateIssueRequest = {
        summary: issueForm.summary || undefined,
        description: issueForm.description || undefined,
        assignee: issueForm.assignee || undefined,
        priority: issueForm.priority || undefined,
      };
      
      await jiraApi.updateIssue(selectedIssue.key, request);
      setEditDialogOpen(false);
      setSelectedIssue(null);
      setIssueForm({
        summary: '',
        description: '',
        issueType: '',
        assignee: '',
        priority: '',
        projectKey: '',
      });
      loadData();
    } catch (err) {
      console.error('Error updating issue:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update issue';
      setError(errorMessage);
      // Don't close the dialog so user can try again with correct values
    }
  };

  const handleAddComment = async () => {
    if (!selectedIssue || !comment.trim()) return;
    
    try {
      await jiraApi.addComment(selectedIssue.key, comment);
      setCommentDialogOpen(false);
      setComment('');
      setSelectedIssue(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  };

  const openEditDialog = (issue: JiraIssue) => {
    setSelectedIssue(issue);
    setIssueForm({
      projectKey: issue.project.key,
      summary: issue.summary,
      description: issue.description || '',
      issueType: issue.issuetype?.name || 'Task',
      priority: issue.priority?.name || 'Medium',
      assignee: issue.assignee?.emailAddress || '',
    });
    setEditDialogOpen(true);
  };

  const openCommentDialog = (issue: JiraIssue) => {
    setSelectedIssue(issue);
    setCommentDialogOpen(true);
  };

  const openCreateDialog = () => {
    setIssueForm({
      projectKey: selectedProject,
      summary: '',
      description: '',
      issueType: '',
      priority: '',
      assignee: '',
    });
    if (selectedProject) {
      loadIssueTypes(selectedProject);
    }
    setCreateDialogOpen(true);
  };

  if (loading) {
    return (
      <Page themeId="tool">
        <Header title="Jira Issues" />
        <Content>
          <Progress />
        </Content>
      </Page>
    );
  }

  if (error) {
    return (
      <Page themeId="tool">
        <Header title="Jira Issues" />
        <Content>
          <ErrorPanel title="Jira Error" error={new Error(error)} />
        </Content>
      </Page>
    );
  }

  return (
    <Page themeId="tool">
      <Header title="Jira Issues">
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={loadData}
        >
          Refresh
        </Button>
      </Header>
      
      <Content>
        <Grid container spacing={3}>
          {/* Filters */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Filters
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Project</InputLabel>
                      <Select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value as string)}
                        label="Project"
                      >
                        <MenuItem value="">
                          <em>All Projects</em>
                        </MenuItem>
                        {projects.map((project) => (
                          <MenuItem key={project.key} value={project.key}>
                            {project.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as string)}
                        label="Status"
                      >
                        <MenuItem value="">
                          <em>All Statuses</em>
                        </MenuItem>
                        <MenuItem value="To Do">To Do</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Done">Done</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Assignee Email"
                      value={selectedAssignee}
                      onChange={(e) => setSelectedAssignee(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Issues Table */}
          <Grid item xs={12}>
            <InfoCard title={`Issues (${issues.length})`}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Key</TableCell>
                      <TableCell>Summary</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Assignee</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {issues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell>{issue.key}</TableCell>
                        <TableCell>
                          <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                            {issue.summary}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={issue.status?.name || 'Unknown'}
                            color={getStatusColor(issue.status?.statusCategory?.key || 'unknown')}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Box
                              width={12}
                              height={12}
                              borderRadius="50%"
                              bgcolor={getPriorityColor(issue.priority?.name || 'Unknown')}
                              marginRight={1}
                            />
                            {issue.priority?.name || 'No Priority'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {issue.assignee ? issue.assignee.displayName : 'Unassigned'}
                        </TableCell>
                        <TableCell>{issue.issuetype?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(issue)}
                            title="Edit Issue"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openCommentDialog(issue)}
                            title="Add Comment"
                          >
                            <CommentIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </InfoCard>
          </Grid>
        </Grid>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          style={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={openCreateDialog}
        >
          <AddIcon />
        </Fab>

        {/* Create Issue Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Issue</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={issueForm.projectKey}
                    onChange={(e) => {
                      setIssueForm({ ...issueForm, projectKey: e.target.value as string });
                      loadIssueTypes(e.target.value as string);
                    }}
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.key} value={project.key}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Issue Type</InputLabel>
                  <Select
                    value={issueForm.issueType}
                    onChange={(e) => setIssueForm({ ...issueForm, issueType: e.target.value as string })}
                  >
                    {issueTypes.map((type) => (
                      <MenuItem key={type.id} value={type.name}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Summary"
                  value={issueForm.summary}
                  onChange={(e) => setIssueForm({ ...issueForm, summary: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Description"
                  multiline
                  rows={4}
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={issueForm.priority}
                    onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value as string })}
                  >
                    <MenuItem value="Highest">Highest</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Lowest">Lowest</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Assignee Email"
                  value={issueForm.assignee}
                  onChange={(e) => setIssueForm({ ...issueForm, assignee: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateIssue} color="primary" variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Issue Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Issue</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Summary"
                  value={issueForm.summary}
                  onChange={(e) => setIssueForm({ ...issueForm, summary: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Description"
                  multiline
                  rows={4}
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={issueForm.priority}
                    onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value as string })}
                  >
                    <MenuItem value="Highest">Highest</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Lowest">Lowest</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Assignee Email"
                  value={issueForm.assignee}
                  onChange={(e) => setIssueForm({ ...issueForm, assignee: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditIssue} color="primary" variant="contained">
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Comment Dialog */}
        <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Comment</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              label="Comment"
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comment..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddComment} color="primary" variant="contained">
              Add Comment
            </Button>
          </DialogActions>
        </Dialog>
      </Content>
    </Page>
  );
};
