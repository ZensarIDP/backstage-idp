#!/bin/bash
# Post-creation script to set up environment branches for Bitbucket
# This script should be run after the repository is created

set -e

WORKSPACE="${{ values.destination.owner }}"
REPO_NAME="${{ values.destination.repo }}"
SERVICE_NAME="${{ values.component_id }}"

echo "🚀 Setting up environment branches for $SERVICE_NAME"
echo "📋 Repository: $WORKSPACE/$REPO_NAME"

# Check if Bitbucket CLI or git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install it first."
    exit 1
fi

echo "🌿 Creating environment branches..."

# Note: Bitbucket branch management is typically done through the web interface
# or using the Bitbucket REST API. For now, we'll use git commands.

# Create staging branch from dev (dev is the default branch)
echo "Creating staging branch..."
git checkout -b staging
git push origin staging

# Create main branch from staging
echo "Creating main branch..."
git checkout -b main
git push origin main

# Switch back to dev
git checkout dev

echo "✅ Branches created successfully!"
echo ""
echo "📝 Next steps:"
echo "  1. Go to Bitbucket repository settings"
echo "  2. Set up branch permissions for main and staging branches"
echo "  3. Configure deployment environments in Bitbucket"
echo "  4. Set up required build pipelines"
echo ""
echo "🔗 Repository URL: https://bitbucket.org/$WORKSPACE/$REPO_NAME"
