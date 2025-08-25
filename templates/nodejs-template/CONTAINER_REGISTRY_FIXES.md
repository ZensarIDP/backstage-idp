# Production Fixes - Container Registry & Database Issues

## Issues Fixed

### 1. ✅ Container Registry Deprecation
- **Problem**: Container Registry (gcr.io) is deprecated and shutting down
- **Solution**: Migrated to Artifact Registry
- **Changes**:
  - Updated CI workflow to use `$REGION-docker.pkg.dev`
  - Added automatic repository creation
  - Updated Kubernetes deployment manifests
  - Updated image references in all workflows

### 2. ✅ Cloud SQL Invalid Arguments
- **Problem**: `gcloud sql instances create` had invalid arguments
- **Root Cause**: `--no-backup` flag is not valid, should use backup scheduling
- **Solution**: 
  - Replaced `--no-backup` with `--backup-start-time=01:00`
  - Added `--storage-auto-increase` for better storage management
  - Removed "cheapest" references from comments and names

### 3. ✅ Missing DEPLOYMENT_TYPE Environment Variable
- **Problem**: Conditional deployment logic wasn't working
- **Solution**: Added `DEPLOYMENT_TYPE: ${{ values.deploymentType }}` to CI workflow

### 4. ✅ Automatic Artifact Registry Setup
- **Problem**: Manual repository creation required for each component
- **Solution**: 
  - Added automatic repository creation in CI workflow
  - Created `setup-gcp-component.sh` helper script
  - Includes error handling for existing repositories

## Updated Workflow Behavior

### CI/CD Pipeline
```yaml
# NEW: Artifact Registry
- Configure Docker: asia-south1-docker.pkg.dev
- Create Repository: automatically for each component
- Build & Push: asia-south1-docker.pkg.dev/zenhotels-428004/COMPONENT/COMPONENT:TAG

# OLD: Container Registry (deprecated)
- Configure Docker: gcr.io  
- Build & Push: gcr.io/zenhotels-428004/COMPONENT:TAG
```

### Database Setup
```yaml
# NEW: Valid Cloud SQL creation
gcloud sql instances create DB_NAME-instance \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=asia-south1 \
  --storage-size=10GB \
  --storage-type=HDD \
  --storage-auto-increase \
  --backup-start-time=01:00 \
  --no-deletion-protection

# OLD: Invalid arguments (caused failure)
gcloud sql instances create DB_NAME-instance \
  --no-backup  # ❌ Invalid flag
```

## Required GCP APIs
The setup script now enables:
- ✅ `run.googleapis.com` (Cloud Run)
- ✅ `sql-component.googleapis.com` (Cloud SQL)
- ✅ `artifactregistry.googleapis.com` (Artifact Registry)
- ✅ `container.googleapis.com` (GKE)

## For New Components

### Automatic Setup (in CI)
1. Repository creates Artifact Registry repo automatically
2. Configures Docker authentication
3. Builds and pushes to correct location
4. Deploys to Cloud Run or GKE based on selection

### Manual Setup (optional)
Run the helper script: `./setup-gcp-component.sh <component-name>`

## Image Paths Changed

### Before (GCR - deprecated)
```
gcr.io/zenhotels-428004/component-name:tag
```

### After (Artifact Registry - current)
```
asia-south1-docker.pkg.dev/zenhotels-428004/component-name/component-name:tag
```

## Expected Results
- ✅ No more Container Registry deprecation warnings
- ✅ Cloud SQL instances create successfully
- ✅ Automatic Artifact Registry repository creation
- ✅ Proper conditional deployment (Cloud Run vs GKE)
- ✅ Cleaner workflow output without "cheapest" references

The template now uses modern GCP services and should work reliably!
