# Bitbucket Integration Setup

This document explains how to configure Bitbucket integration for the Backstage IDP platform.

## Prerequisites

1. **Bitbucket Workspace**: You should have access to the "zensaridp" workspace on Bitbucket
2. **App Password**: Generate an App Password with sufficient permissions

## Environment Variables

The following environment variables need to be set for Bitbucket integration:

```bash
BITBUCKET_USERNAME=your-bitbucket-username
BITBUCKET_APP_PASSWORD=your-app-password
```

## Creating a Bitbucket App Password

1. Go to [Bitbucket Account Settings](https://bitbucket.org/account/settings/)
2. Navigate to "App passwords" under "Access management"
3. Click "Create app password"
4. Give it a meaningful label (e.g., "Backstage IDP Integration")
5. Select the following permissions:
   - **Account**: Read
   - **Repositories**: Admin (needed for creating repositories)
   - **Pull requests**: Write
   - **Pipelines**: Write (for future CI/CD integration)

## Configuration Files Updated

The following files have been updated to support Bitbucket:

1. **app-config.yaml**: Added Bitbucket integration and scaffolder configuration
2. **Node.js Template**: Updated to support both GitHub and Bitbucket as repository hosts

## Template Changes

The Node.js service template now includes:

- Repository host selection (GitHub or Bitbucket)
- Conditional publishing to the selected platform
- Platform-specific setup scripts
- Updated documentation for both platforms

## Usage

When creating a new service:

1. Select "Bitbucket" as the repository host
2. Provide the repository URL (must be under bitbucket.org)
3. The template will automatically:
   - Create the repository in the zensaridp workspace
   - Include Bitbucket-specific setup scripts
   - Configure the catalog-info.yaml with Bitbucket annotations

## Future Enhancements

The following will be added in future updates:

- Bitbucket Pipelines configuration files
- Bitbucket-specific deployment scripts
- Enhanced branch protection and policies
- Automated discovery of Bitbucket repositories

## Troubleshooting

**Issue**: Template creation fails with Bitbucket
**Solution**: Ensure the environment variables are set correctly and the app password has sufficient permissions

**Issue**: Repository not found in catalog
**Solution**: Check that the catalog-info.yaml file has the correct Bitbucket annotations

For more help, contact the platform team.
