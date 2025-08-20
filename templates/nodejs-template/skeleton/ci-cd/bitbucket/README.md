# Bitbucket Pipelines

This directory contains Bitbucket Pipelines configuration for the ${{ values.component_id }} service.

## Configuration

### bitbucket-pipelines.yml
- **Purpose**: Complete CI/CD pipeline with testing, building, and deployment
- **Triggers**: Push to `main`, `staging`, `dev` branches and pull requests
- **Features**:
  - Node.js testing and building
  - Docker image creation and testing
  - Multi-environment deployment support
  - Manual production deployments for safety

## Pipeline Structure

### Definitions
- **test**: Runs tests, builds Docker image, and validates functionality
- **build-and-deploy-dev**: Deploys to development environment
- **build-and-deploy-staging**: Deploys to staging environment  
- **build-and-deploy-prod**: Deploys to production environment (manual trigger)

### Branch Pipelines

| Branch   | Pipeline Steps           | Auto-Deploy | Manual Steps |
|----------|--------------------------|-------------|--------------|
| dev      | test → deploy-dev        | ✅ Yes      | None         |
| staging  | test → deploy-staging    | ✅ Yes      | None         |
| main     | test → deploy-prod       | ❌ No       | deploy-prod  |

## Usage

When your repository is hosted on **Bitbucket**, these pipelines will automatically execute based on the defined triggers.

## Environment Setup

Configure the following Bitbucket Repository Variables for proper deployment:

### Required Variables
- `GCP_PROJECT_ID_DEV` - GCP project ID for development environment
- `GCP_PROJECT_ID_STAGING` - GCP project ID for staging environment
- `GCP_PROJECT_ID_PROD` - GCP project ID for production environment
- `GCP_SA_KEY_DEV` - Service account key for development (base64 encoded)
- `GCP_SA_KEY_STAGING` - Service account key for staging (base64 encoded)
- `GCP_SA_KEY_PROD` - Service account key for production (base64 encoded)

### Setting Up Variables
1. Go to Repository Settings → Repository variables
2. Add each variable with appropriate values
3. Mark sensitive variables (like SA keys) as secured

## Features

- **Docker Support**: Built-in Docker service for containerized builds
- **Environment Deployments**: Separate deployment environments
- **Manual Production**: Production deployments require manual approval
- **Pull Request Testing**: All PRs automatically run tests
- **Tag Deployments**: Version tags trigger production deployments
