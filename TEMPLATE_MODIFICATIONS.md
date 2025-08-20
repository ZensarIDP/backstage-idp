# Node.js Template Modifications Summary

This document summarizes the changes made to support both GitHub and Bitbucket as repository hosting options for the Node.js service template.

## Changes Made

### 1. Template Configuration (`template.yaml`)

**Added Repository Host Selection:**
- New parameter `repoHost` allowing users to choose between GitHub and Bitbucket
- Updated `allowedHosts` in RepoUrlPicker to include both `github.com` and `bitbucket.org`

**Conditional Steps:**
- `template-github-workflows`: Fetches GitHub-specific files only when GitHub is selected
- `template-bitbucket-workflows`: Fetches Bitbucket-specific files only when Bitbucket is selected
- `publish-github`: Publishes to GitHub only when GitHub is selected
- `publish-bitbucket`: Publishes to Bitbucket only when Bitbucket is selected (using workspace "zensaridp")

**Updated Output Links:**
- Repository URL now dynamically resolves based on the chosen platform

### 2. Directory Structure Changes

**Before:**
```
skeleton/
├── .github/
│   └── workflows/
├── other files...
```

**After:**
```
skeleton/
├── github-workflows/
│   ├── workflows/
│   └── setup-branches.sh
├── bitbucket-workflows/
│   ├── setup-branches.sh
│   └── README.md
├── other files...
```

### 3. File Modifications

**catalog-info.yaml:**
- Added conditional annotations based on repository host
- GitHub: Uses `github.com/project-slug` and `github.com/workflows` annotations
- Bitbucket: Uses `bitbucket.org/project-key` annotation

**README.md:**
- Added repository host information section
- Platform-specific setup instructions
- Conditional environment secrets configuration
- Updated clone URLs based on platform

### 4. Platform-Specific Scripts

**GitHub (`github-workflows/setup-branches.sh`):**
- Uses GitHub CLI (`gh`) for branch management
- Sets up branch protection rules automatically
- Requires GitHub authentication

**Bitbucket (`bitbucket-workflows/setup-branches.sh`):**
- Uses git commands for branch creation
- Provides manual guidance for Bitbucket-specific configurations
- Includes instructions for setting up branch permissions

### 5. Backstage Configuration (`app-config.yaml`)

**Integrations:**
- Added Bitbucket integration configuration
- Uses environment variables for credentials: `BITBUCKET_USERNAME` and `BITBUCKET_APP_PASSWORD`

**Scaffolder:**
- Added Bitbucket scaffolder configuration
- Configured allowed workspace: "zensaridp"
- Set default visibility to public

## Environment Variables Required

For Bitbucket integration to work, set these environment variables:

```bash
BITBUCKET_USERNAME=your-bitbucket-username
BITBUCKET_APP_PASSWORD=your-app-password
```

## User Experience

When creating a new Node.js service:

1. **Step 1**: Provide basic service information (name, description, owner)
2. **Step 2**: Choose repository host (GitHub or Bitbucket)
3. **Step 3**: Provide repository location

The template will automatically:
- Include appropriate platform-specific files
- Publish to the selected repository host
- Configure catalog annotations correctly
- Provide platform-specific setup instructions

## Current Limitations

1. **Bitbucket Pipelines**: Not yet implemented (GitHub Actions are available for GitHub)
2. **Branch Protection**: Manual setup required for Bitbucket (automatic for GitHub)
3. **Discovery**: Bitbucket repository discovery not yet configured

## Future Enhancements

1. Add Bitbucket Pipelines configuration
2. Implement Bitbucket repository discovery
3. Add automated branch protection for Bitbucket
4. Create platform-specific deployment scripts

## Testing

To test the modifications:

1. Ensure Bitbucket environment variables are set
2. Create a new service using the Node.js template
3. Select Bitbucket as the repository host
4. Verify the service is created in the zensaridp workspace
5. Check that only platform-appropriate files are included

## Backward Compatibility

✅ **GitHub functionality remains unchanged**
✅ **Existing GitHub repositories are unaffected**
✅ **Default selection is GitHub to maintain current behavior**
