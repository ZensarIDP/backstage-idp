# CRITICAL FIX: GitHub Actions Template Variable Escaping

## Issue Identified
The Backstage template engine was interpreting GitHub Actions syntax `${{ ... }}` as template variables instead of literal syntax, causing:

1. **Authentication Failure**: `credentials_json:` was empty instead of `${{ secrets.GCP_SA_KEY }}`
2. **Environment Variable Failure**: All `${{ env.* }}` references were being stripped out
3. **GitHub Context Failure**: `${{ github.sha }}` was not being preserved

## Root Cause
Backstage's template engine processes `${{ variable }}` syntax as its own templating, conflicting with GitHub Actions workflow syntax.

## Solution Applied
**Escaped all GitHub Actions syntax** using `${{ '${{' }}` pattern:

### Before (Broken)
```yaml
credentials_json: ${{ secrets.GCP_SA_KEY }}
docker build -t gcr.io/${{ env.PROJECT_ID }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
```

### After (Fixed)  
```yaml
credentials_json: ${{ '${{' }} secrets.GCP_SA_KEY }}
docker build -t gcr.io/${{ '${{' }} env.PROJECT_ID }}/${{ '${{' }} env.IMAGE_NAME }}:${{ '${{' }} github.sha }}
```

## Files Fixed

### 1. `infrastructure.yml`
- ✅ Fixed authentication: `credentials_json: ${{ '${{' }} secrets.GCP_SA_KEY }}`
- ✅ Fixed all environment variables: `${{ '${{' }} env.DB_NAME }}`, `${{ '${{' }} env.PROJECT_ID }}`, etc.
- ✅ Fixed both setup and destroy jobs

### 2. `ci.yml`  
- ✅ Fixed authentication: `credentials_json: ${{ '${{' }} secrets.GCP_SA_KEY }}`
- ✅ Fixed Docker commands: `${{ '${{' }} env.PROJECT_ID }}`, `${{ '${{' }} github.sha }}`
- ✅ Fixed Cloud Run deployment: `${{ '${{' }} env.SERVICE_NAME }}`
- ✅ Fixed GKE deployment: All kubectl commands with proper variable escaping

## Expected Result
After this fix, generated workflows will have proper GitHub Actions syntax:

```yaml
# Generated workflow will contain:
credentials_json: ${{ secrets.GCP_SA_KEY }}
docker build -t gcr.io/${{ env.PROJECT_ID }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
```

## Testing Required
1. Generate a new repository using the template
2. Verify the `.github/workflows/*.yml` files have correct `${{ ... }}` syntax
3. Add `GCP_SA_KEY` secret to the repository  
4. Workflows should now authenticate properly

## Impact
- 🔧 **Authentication**: Will work with proper secret reference
- 🔧 **Environment Variables**: Will resolve correctly in workflows
- 🔧 **Docker Operations**: Will use correct project ID and image tags
- 🔧 **Database Operations**: Will use correct database names and instances

This was the **primary blocker** preventing the workflows from functioning correctly!
