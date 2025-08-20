# ${{ values.component_id }}

${{ values.description }}

## 🏠 Repository Host

This service is hosted on **{%- if values.repoHost == 'github' %}GitHub{%- elif values.repoHost == 'bitbucket' %}Bitbucket{%- endif %}**.

{%- if values.repoHost == 'github' %}
🔗 **Repository**: [https://github.com/${{ values.destination.owner }}/${{ values.destination.repo }}](https://github.com/${{ values.destination.owner }}/${{ values.destination.repo }})
{%- elif values.repoHost == 'bitbucket' %}
🔗 **Repository**: [https://bitbucket.org/${{ values.destination.owner }}/${{ values.destination.repo }}](https://bitbucket.org/${{ values.destination.owner }}/${{ values.destination.repo }})
{%- endif %}

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

### Docker Development
```bash
# Build Docker image
npm run docker:build

# Run in container
npm run docker:run

# Stop container
npm run docker:stop
```

## 🔄 CI/CD Configuration

This repository includes a well-organized CI/CD setup that automatically deploys the appropriate configuration based on your chosen repository platform.

### 📂 CI/CD Organization

The template source maintains separate, organized CI/CD configurations:

```
ci-cd/
├── github/              # GitHub Actions workflows
│   ├── workflows/       # GitHub workflow files  
│   └── README.md       # GitHub-specific setup guide
└── bitbucket/          # Bitbucket Pipelines
    ├── bitbucket-pipelines.yml # Bitbucket configuration
    └── README.md       # Bitbucket-specific setup guide
```

### 🚀 Deployed Configuration

{%- if values.repoHost == 'github' %}
Your repository is hosted on **GitHub**, so **GitHub Actions** has been deployed:
- ✅ **Active**: `.github/workflows/` - GitHub Actions CI/CD pipelines
- 📖 **Documentation**: Platform-specific setup instructions included
- 🔧 **Setup Required**: Configure GitHub Secrets for GCP deployment

**GitHub Actions Features:**
- Comprehensive CI/CD with testing and deployment
- Multi-environment support (dev, staging, production)
- Automatic branch setup and protection
- GCP Cloud Run deployment integration

{%- elif values.repoHost == 'bitbucket' %}
Your repository is hosted on **Bitbucket**, so **Bitbucket Pipelines** has been deployed:
- ✅ **Active**: `bitbucket-pipelines.yml` - Bitbucket Pipelines configuration
- 📖 **Documentation**: Platform-specific setup instructions included  
- 🔧 **Setup Required**: Configure Bitbucket Repository Variables for GCP deployment

**Bitbucket Pipelines Features:**
- Complete CI/CD with testing and deployment
- Docker-based builds and testing
- Environment-specific deployments (development, staging, production)
- Manual production deployments for safety
{%- endif %}

### 🎯 Clean Repository Structure

Only the relevant CI/CD configuration for your chosen platform is deployed, ensuring:
- **No Clutter**: Only active CI/CD files in your repository
- **Platform-Optimized**: Configuration tailored for your chosen platform
- **Clear Documentation**: Platform-specific setup guides included

## 🌍 Environment Management

This service supports three environments with separate configurations and deployments:

### Environments

| Environment | Branch    | Auto-Deploy | Purpose           |
|------------|-----------|-------------|-------------------|
| Development| `dev` (default) | ✅ Yes      | Feature development and testing |
| Staging    | `staging` | ✅ Yes      | Pre-production testing |
| Production | `main`    | ✅ Yes      | Live production services |

### Environment Configuration

Each environment has its own configuration file:
- `.env.dev` - Development settings (low resources, debug logging)
- `.env.staging` - Staging settings (moderate resources, info logging)  
- `.env.prod` - Production settings (high resources, minimal logging)

### Development Workflow (Industry Standard)

```mermaid
graph LR
    A[Direct Push] --> B[dev branch]
    B --> C[staging branch]
    C --> D[main branch]
    
    B --> E[Dev Environment]
    C --> F[Staging Environment]
    D --> G[Production Environment]
```

1. **New Service**: Repository created with `dev` as default branch → Auto-deploy to dev
2. **Feature Development**: 
   - Push directly to `dev` branch (no PR required)
   - Push triggers dev deployment automatically
3. **Staging Release**: 
   - Create PR from `dev` to `staging`
   - Merge triggers staging deployment
4. **Production Release**: 
   - Create PR from `staging` to `main`
   - Merge triggers production deployment

### Branch Protection Rules

| Branch   | Direct Commits | PR Required | Purpose           |
|----------|----------------|-------------|-------------------|
| dev      | ✅ Allowed     | ❌ No       | Fast development iteration |
| staging  | ❌ Blocked     | ✅ Yes      | Pre-production testing |
| main     | ❌ Blocked     | ✅ Yes      | Production releases |

### Quick Start After Repo Creation

{%- if values.repoHost == 'github' %}

**Option 1: Automatic Setup (preferred)**
The repository should automatically set up environment branches via GitHub Actions.

**Option 2: Manual Setup (if automatic fails)**

```bash
# Clone your new repository
git clone https://github.com/${{ values.destination.owner }}/${{ values.destination.repo }}.git
cd ${{ values.component_id }}

# Run the branch setup script
chmod +x setup-branches.sh
./setup-branches.sh

# Start developing
git add .
git commit -m "Initial development"
git push origin dev  # This will deploy to development environment
```

{%- elif values.repoHost == 'bitbucket' %}

**Manual Setup Required**

```bash
# Clone your new repository
git clone https://bitbucket.org/${{ values.destination.owner }}/${{ values.destination.repo }}.git
cd ${{ values.component_id }}

# Run the branch setup script
chmod +x setup-branches.sh
./setup-branches.sh

# Start developing
git add .
git commit -m "Initial development"
git push origin dev  # This will deploy to development environment
```

**Note**: For Bitbucket, you'll need to manually configure branch permissions and deployment environments in the Bitbucket repository settings.

{%- endif %}

### Development Workflow

1. **Development**: Push directly to `dev` branch → Auto-deploy to dev environment
2. **Staging**: Create PR `dev → staging` → Auto-deploy to staging environment  
3. **Production**: Create PR `staging → main` → Auto-deploy to production environment

### Manual Deployment

You can also deploy manually to any environment:

```bash
# Deploy to development
npm run deploy:dev

# Deploy to staging  
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

### Environment Secrets

{%- if values.repoHost == 'github' %}

Each environment requires its own GitHub Secrets:

**Development:**
- `GCP_PROJECT_ID_DEV`: Your GCP project ID for development
- `GCP_SA_KEY_DEV`: Service Account Key (JSON) for development

**Staging:**
- `GCP_PROJECT_ID_STAGING`: Your GCP project ID for staging
- `GCP_SA_KEY_STAGING`: Service Account Key (JSON) for staging

**Production:**
- `GCP_PROJECT_ID_PROD`: Your GCP project ID for production
- `GCP_SA_KEY_PROD`: Service Account Key (JSON) for production

**How to set GitHub Secrets:**
1. Go to your repository settings
2. Navigate to "Secrets and variables" > "Actions"
3. Add the required secrets for each environment

{%- elif values.repoHost == 'bitbucket' %}

Each environment requires its own Bitbucket Repository Variables:

**Development:**
- `GCP_PROJECT_ID_DEV`: Your GCP project ID for development
- `GCP_SA_KEY_DEV`: Service Account Key (JSON) for development

**Staging:**
- `GCP_PROJECT_ID_STAGING`: Your GCP project ID for staging
- `GCP_SA_KEY_STAGING`: Service Account Key (JSON) for staging

**Production:**
- `GCP_PROJECT_ID_PROD`: Your GCP project ID for production
- `GCP_SA_KEY_PROD`: Service Account Key (JSON) for production

**How to set Bitbucket Variables:**
1. Go to your repository settings
2. Navigate to "Repository variables"
3. Add the required variables for each environment
4. Mark sensitive variables as "Secured"

{%- endif %}

## ☁️ Cloud Deployment

### Prerequisites
1. **Google Cloud Projects** - Separate projects for each environment (recommended)
2. **gcloud CLI** installed and authenticated
3. **Docker** installed locally
```bash
# Option 1: Use automated setup script
chmod +x setup-gcp.sh
./setup-gcp.sh

# Option 2: Manual setup
# Install gcloud CLI (if not already installed)
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set your project
gcloud config set project YOUR-PROJECT-ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Configure Docker for GCR
gcloud auth configure-docker
```

### GitHub Secrets Setup
**Required for automatic deployment:**

1. **Create Service Account Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to **IAM & Admin** → **Service Accounts**
   - Create service account with these roles:
     - Cloud Run Admin
     - Storage Admin  
     - Service Account User
   - Create JSON key and download it

2. **Add GitHub Secrets:**
   - Go to repository **Settings** → **Secrets and variables** → **Actions**
   - Add secrets:
     - `GCP_PROJECT_ID`: Your GCP project ID
     - `GCP_SA_KEY`: Complete JSON content of the service account key

### Manual Deployment
```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production  
npm run deploy:production
```

### Automatic Deployment (CI/CD)
When you push to the `main` branch, GitHub Actions will automatically:

1. ✅ Run tests
2. ✅ Build Docker image
3. ✅ Push to Google Container Registry
4. ✅ Deploy to Google Cloud Run

**Required GitHub Secrets:**
- `GCP_PROJECT_ID`: Your Google Cloud Project ID
- `GCP_SA_KEY`: Service Account Key (JSON)

## 📊 Service Information

- **Port:** 3001
- **Health Check:** `/health`
- **Main Endpoint:** `/`

## 🔗 Useful Links

- **Backstage Catalog:** [View in Backstage](http://localhost:3000)
- **GitHub Repository:** [View on GitHub](https://github.com/${{ values.owner }}/${{ values.component_id }})
- **Cloud Run Console:** [View in GCP Console](https://console.cloud.google.com/run)

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot reload |
| `npm test` | Run tests |
| `npm run docker:build` | Build Docker image |
| `npm run docker:run` | Run Docker container locally |
| `npm run docker:stop` | Stop Docker container |
| `npm run deploy:dev` | Deploy to development environment |
| `npm run deploy:staging` | Deploy to staging environment |
| `npm run deploy:production` | Deploy to production environment |
| `npm run env:dev` | Set development environment variables |
| `npm run env:staging` | Set staging environment variables |
| `npm run env:prod` | Set production environment variables |

## 🛠️ Development Guide

### Adding New Endpoints
```javascript
// Add to index.js
app.get('/api/new-endpoint', (req, res) => {
  res.json({ message: 'Hello from new endpoint!' });
});
```

### Environment Variables
Create a `.env` file for local development:
```
NODE_ENV=development
PORT=3001
```

### Testing
Add tests to `test.js` or create new test files.

## 📞 Support

Created with ❤️ using Backstage IDP

- **Owner:** ${{ values.owner }}
- **Component:** ${{ values.component_id }}
- **Template:** Node.js Microservice Template

The service will be available at `http://localhost:3000`

## API Endpoints

- `GET /` - Returns service information
- `GET /health` - Health check endpoint

## Owner

This service is owned by: ${{ values.owner }}
