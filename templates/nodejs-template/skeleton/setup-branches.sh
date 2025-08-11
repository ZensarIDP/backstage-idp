#!/bin/bash
# Post-creation script to set up environment branches and protection rules
# This script should be run after the repository is created

set -e

REPO_OWNER="${{ values.destination.owner }}"
REPO_NAME="${{ values.destination.repo }}"
SERVICE_NAME="${{ values.component_id }}"

echo "🚀 Setting up environment branches for $SERVICE_NAME"
echo "📋 Repository: $REPO_OWNER/$REPO_NAME"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found. Please install it first:"
    echo "   https://cli.github.com/"
    exit 1
fi

# Authenticate with GitHub CLI if not already done
echo "🔐 Checking GitHub CLI authentication..."
if ! gh auth status >/dev/null 2>&1; then
    echo "Please authenticate with GitHub CLI:"
    gh auth login
fi

echo "🌿 Creating environment branches..."

# Create staging branch from dev (dev is now the default branch)
gh api repos/$REPO_OWNER/$REPO_NAME/git/refs \
  --method POST \
  --field ref='refs/heads/staging' \
  --field sha="$(gh api repos/$REPO_OWNER/$REPO_NAME/git/refs/heads/dev --jq '.object.sha')" || echo "Staging branch might already exist"

# Create main branch from staging
gh api repos/$REPO_OWNER/$REPO_NAME/git/refs \
  --method POST \
  --field ref='refs/heads/main' \
  --field sha="$(gh api repos/$REPO_OWNER/$REPO_NAME/git/refs/heads/staging --jq '.object.sha')" || echo "Main branch might already exist"

echo "🛡️ Setting up branch protection rules..."

# Protect main branch
gh api repos/$REPO_OWNER/$REPO_NAME/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null || echo "Main branch protection might already be set"

# Protect staging branch
gh api repos/$REPO_OWNER/$REPO_NAME/branches/staging/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null || echo "Staging branch protection might already be set"

# Set main as the default branch for production releases
gh api repos/$REPO_OWNER/$REPO_NAME \
  --method PATCH \
  --field default_branch='dev'

echo "✅ Branch setup complete!"
echo ""
echo "📋 Branch Structure:"
echo "   🔹 dev (default) - Development environment"
echo "   🔹 staging - Staging environment" 
echo "   🔹 main - Production environment"
echo ""
echo "🔄 Workflow:"
echo "   1. Push directly to 'dev' branch for development deployment"
echo "   2. Create PR from 'dev' to 'staging' for staging deployment"
echo "   3. Create PR from 'staging' to 'main' for production deployment"
echo ""
echo "📋 Branch Protection:"
echo "   🔹 dev - No protection (direct commits allowed)"
echo "   🔹 staging - Protected (requires PR and review)"
echo "   🔹 main - Protected (requires PR and review)"
echo ""
echo "🌐 Repository: https://github.com/$REPO_OWNER/$REPO_NAME"
