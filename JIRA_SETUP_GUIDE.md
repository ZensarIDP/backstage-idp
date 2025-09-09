# Jira Integration for Backstage IDP

This document provides complete setup instructions for integrating Jira with your Backstage IDP for ticket tracking and issue management.

## 🎯 Features

- **Issue Management**: View, create, edit, and update Jira issues
- **Project Support**: Filter issues by project and status
- **Real-time Updates**: Refresh and sync with Jira data
- **Comment System**: Add comments to existing issues
- **Priority & Status**: Visual indicators for issue priority and status
- **Assignee Management**: Assign issues to team members
- **Issue Types**: Support for different issue types (Bug, Task, Story, etc.)

## 📋 Prerequisites

Before setting up the Jira integration, ensure you have:

1. **Jira Instance**: Access to a Jira instance (Jira Cloud or Server)
2. **Administrative Access**: Ability to create API tokens and configure permissions
3. **Backstage IDP**: A running Backstage instance with the plugins installed

## 🔧 Jira Setup (Outside Codebase)

### Step 1: Create a Jira API Token

1. **Login to Jira**:
   - Go to your Jira instance (e.g., `https://your-company.atlassian.net`)
   - Login with your account

2. **Access Account Settings**:
   - Click on your profile picture in the top-right corner
   - Select "Account settings" or "Manage account"

3. **Generate API Token**:
   - Go to the "Security" tab
   - Click on "Create and manage API tokens"
   - Click "Create API token"
   - Give it a descriptive name like "Backstage Integration"
   - Copy the generated token (you won't see it again!)

### Step 2: Configure Jira Permissions

1. **Project Permissions**:
   - Ensure your user account has the following permissions in the projects you want to integrate:
     - Browse Projects
     - Create Issues
     - Edit Issues
     - Add Comments
     - Assign Issues
     - Transition Issues

2. **Global Permissions** (if needed):
   - For organization-wide integration, ensure your account has:
     - Browse Users and Groups
     - View Project Details

### Step 3: Identify Your Jira Configuration

Collect the following information:
- **Base URL**: Your Jira instance URL (e.g., `https://your-company.atlassian.net`)
- **Email**: The email address associated with your Jira account
- **API Token**: The token generated in Step 1

## 🚀 Backstage Configuration

### Step 1: Environment Variables

Create or update your `.env` file in the Backstage root directory:

\`\`\`bash
# Jira Integration
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token-here
\`\`\`

### Step 2: Update app-config.yaml

The Jira configuration is already added to your `app-config.yaml`. Verify it looks like this:

\`\`\`yaml
# Jira integration configuration
jira:
  baseUrl: "\${JIRA_BASE_URL}" # e.g., https://your-company.atlassian.net
  email: "\${JIRA_EMAIL}"      # Your Jira email address
  apiToken: "\${JIRA_API_TOKEN}" # Your Jira API token
\`\`\`

### Step 3: Install Dependencies

The plugins have been added to your workspace. Run the following to ensure all dependencies are installed:

\`\`\`bash
yarn install
\`\`\`

### Step 4: Start Backstage

Start your Backstage instance:

\`\`\`bash
yarn start
\`\`\`

## 🎯 Usage Guide

### Accessing the Jira Interface

1. **Navigate to Issues**:
   - In the Backstage sidebar, click on "Issues/Tickets"
   - You'll be redirected to `/jira` path

2. **View Issues**:
   - See all issues in a table format
   - Filter by project, status, or assignee
   - View issue details including priority, type, and assignee

### Creating New Issues

1. **Click the "+" Button**:
   - Click the floating action button (blue plus icon) in the bottom-right corner

2. **Fill Issue Details**:
   - Select a project
   - Choose issue type (Bug, Task, Story, etc.)
   - Enter summary and description
   - Set priority and assignee (optional)

3. **Submit**:
   - Click "Create" to create the issue in Jira

### Editing Existing Issues

1. **Edit Button**:
   - Click the edit icon (pencil) next to any issue in the table

2. **Update Fields**:
   - Modify summary, description, priority, or assignee
   - Status changes are handled through the update form

3. **Save Changes**:
   - Click "Update" to save changes to Jira

### Adding Comments

1. **Comment Button**:
   - Click the comment icon next to any issue

2. **Enter Comment**:
   - Type your comment in the dialog box

3. **Submit**:
   - Click "Add Comment" to post to Jira

## 🔍 Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Verify your API token is correct
   - Ensure your email matches the Jira account
   - Check that the base URL is correct

2. **Permission Errors**:
   - Verify your Jira account has necessary permissions
   - Check project-level permissions for the projects you're accessing

3. **Network Issues**:
   - Ensure your Backstage backend can reach your Jira instance
   - Check firewall settings if using Jira Server
   - Verify CORS settings if needed

4. **Plugin Not Loading**:
   - Check console for errors
   - Verify all dependencies are installed
   - Restart Backstage after configuration changes

### Debug Mode

To enable detailed logging for the Jira plugin:

1. **Backend Logs**:
   - Check the backend console for Jira API request/response logs
   - Look for error messages related to Jira connectivity

2. **Frontend Logs**:
   - Open browser developer tools
   - Check console for frontend errors
   - Monitor network tab for API calls

## 📊 Integration Benefits

### For Development Teams

- **Centralized View**: Access Jira issues directly from your development portal
- **Context Switching**: Reduce context switching between tools
- **Project Alignment**: Link issues to code repositories and deployments

### For Project Management

- **Real-time Updates**: Get live status updates on issues
- **Cross-team Visibility**: See issues across different projects and teams
- **Workflow Integration**: Connect issues to CI/CD pipelines and deployments

## 🔐 Security Considerations

1. **API Token Security**:
   - Store API tokens in environment variables
   - Never commit tokens to version control
   - Rotate tokens regularly

2. **Network Security**:
   - Use HTTPS for all Jira communications
   - Consider VPN or firewall rules for additional security

3. **Access Control**:
   - Limit Jira permissions to only what's needed
   - Review user access regularly

## 🚀 Next Steps

1. **Test the Integration**:
   - Create a test issue to verify connectivity
   - Test filtering and editing capabilities

2. **Train Your Team**:
   - Show team members how to use the new interface
   - Document any team-specific workflows

3. **Monitor Usage**:
   - Track adoption and usage patterns
   - Gather feedback for improvements

4. **Extend Integration**:
   - Consider linking issues to specific services or components
   - Add automation for issue creation from monitoring alerts

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Backstage and Jira logs
3. Verify your Jira configuration and permissions
4. Consult your organization's DevOps or IT team

---

**Note**: This integration requires proper Jira permissions and network connectivity. Ensure your organization's security policies are followed when setting up the integration.
