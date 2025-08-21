# Manual Setup Requirements for .NET Templates PoC

## Overview

This document outlines all the manual setup steps required for your Backstage IDP with the new ASP.NET Web API and Web App templates.

## 1. Environment Variables Setup

You need to set the following environment variables before running Backstage:

### GitHub Integration
```bash
export GITHUB_TOKEN="your_github_personal_access_token"
export GITHUB_OAUTH_CLIENT_ID="your_github_oauth_client_id"
export GITHUB_OAUTH_CLIENT_SECRET="your_github_oauth_client_secret"
```

### Bitbucket Integration (optional)
```bash
export BITBUCKET_USERNAME="your_bitbucket_username"
export BITBUCKET_APP_PASSWORD="your_bitbucket_app_password"
export BITBUCKET_OAUTH_CLIENT_ID="your_bitbucket_oauth_client_id"
export BITBUCKET_OAUTH_CLIENT_SECRET="your_bitbucket_oauth_client_secret"
```

### Windows (Command Prompt)
```cmd
set GITHUB_TOKEN=your_github_personal_access_token
set GITHUB_OAUTH_CLIENT_ID=your_github_oauth_client_id
set GITHUB_OAUTH_CLIENT_SECRET=your_github_oauth_client_secret
```

## 2. Google Cloud Platform Setup

### 2.1 Prerequisites
- Google Cloud Project with billing enabled
- Google Cloud SDK (gcloud) installed
- Enable required APIs:
  ```bash
  gcloud services enable container.googleapis.com
  gcloud services enable run.googleapis.com
  gcloud services enable sql-component.googleapis.com
  gcloud services enable storage.googleapis.com
  gcloud services enable artifactregistry.googleapis.com
  ```

### 2.2 Create Service Account
```bash
# Create service account
gcloud iam service-accounts create backstage-demo-sa \
    --description="Service account for Backstage demo" \
    --display-name="Backstage Demo SA"

# Add required roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:backstage-demo-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/container.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:backstage-demo-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:backstage-demo-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:backstage-demo-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:backstage-demo-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.admin"

# Create and download key
gcloud iam service-accounts keys create backstage-demo-sa-key.json \
    --iam-account=backstage-demo-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 2.3 Create GKE Cluster (if using GKE)
```bash
# Create GKE cluster
gcloud container clusters create demo-cluster \
    --zone=us-central1-a \
    --num-nodes=2 \
    --machine-type=e2-medium \
    --enable-autorepair \
    --enable-autoupgrade

# Get credentials
gcloud container clusters get-credentials demo-cluster --zone=us-central1-a
```

### 2.4 Create Artifact Registry Repository
```bash
gcloud artifacts repositories create YOUR_REPO_NAME \
    --repository-format=docker \
    --location=us-central1 \
    --description="Docker repository for demo apps"
```

## 3. GitHub Repository Secrets

For each repository created by the templates, you'll need to set these secrets:

### Required Secrets
- `GOOGLE_CLOUD_CREDENTIALS` - Contents of the service account JSON key file
- `GCP_PROJECT_ID` - Your Google Cloud project ID
- `GCP_REGION` - Your deployment region (e.g., us-central1)

### For GKE Deployments
- `GKE_CLUSTER_NAME` - Your cluster name (e.g., demo-cluster)
- `GKE_ZONE` - Your cluster zone (e.g., us-central1-a)
- `K8S_NAMESPACE` - Kubernetes namespace (e.g., default)

### For Database (if selected)
These will be set automatically after infrastructure provisioning, but you can also set them manually:
- `DB_PASSWORD` - Database password

## 4. Demo Preparation Checklist

### Before the Demo
- [ ] Environment variables are set in your Backstage environment
- [ ] Google Cloud Project is set up with required APIs enabled
- [ ] Service account is created with proper permissions
- [ ] GKE cluster is created and accessible (if using GKE)
- [ ] Artifact Registry repository is created
- [ ] GitHub personal access token has repository creation permissions
- [ ] Your .NET hotel management application is ready to copy

### Demo Flow
1. **Start Backstage**: `yarn dev` (with environment variables set)
2. **Create Backend Component**: Use ASP.NET Web API template
   - Select GKE or Cloud Run
   - Choose MySQL database
   - Enable GCS bucket
   - Configure cluster details (if GKE)
3. **Create Frontend Component**: Use ASP.NET Web App template
   - Use same cluster/namespace as backend (if GKE)
   - Enable GCS bucket for assets
   - Usually no database for frontend
4. **Set GitHub Secrets**: In both repositories
5. **Copy Your Code**: Paste your hotel management code into respective repos
6. **Create Dockerfile**: Add appropriate Dockerfile for each app
7. **Push Code**: Infrastructure will provision automatically, then app will deploy

## 5. Troubleshooting

### Common Issues
- **Template not visible**: Check that templates are properly registered in app-config.yaml
- **GitHub integration fails**: Verify GITHUB_TOKEN has correct permissions
- **GCP authentication fails**: Ensure service account has required roles
- **Build fails**: Check that Dockerfile and .NET project files are properly configured

### Verification Commands
```bash
# Check if templates are loaded
curl http://localhost:7007/api/scaffolder/v2/templates

# Check GKE cluster access
kubectl cluster-info

# Check GCP authentication
gcloud auth list
```

## 6. Post-Demo Cleanup

```bash
# Delete GKE cluster
gcloud container clusters delete demo-cluster --zone=us-central1-a

# Delete service account
gcloud iam service-accounts delete backstage-demo-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Clean up any created databases and buckets through GCP Console
```

## 7. Security Notes

- **CRITICAL**: The hardcoded tokens in app-config.yaml have been moved to environment variables
- **IMPORTANT**: Rotate any exposed GitHub tokens immediately
- Keep service account keys secure and don't commit them to version control
- Use least-privilege access for all service accounts
- Consider using Workload Identity Federation instead of service account keys for production

## 8. Extensions for Future

- Add more database options (MongoDB, Redis)
- Add support for AWS and Azure
- Implement Workload Identity Federation
- Add monitoring and logging setup
- Create more sophisticated deployment strategies
- Add automated testing in pipelines
