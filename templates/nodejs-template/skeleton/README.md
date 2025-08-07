# ${{ values.component_id }}

${{ values.description }}

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

## ☁️ Cloud Deployment

### Prerequisites
1. **Google Cloud Project** with billing enabled
2. **gcloud CLI** installed and authenticated
3. **Docker** installed locally

### Setup GCP (One-time)
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
| `npm run deploy:staging` | Deploy to GCP staging |
| `npm run deploy:production` | Deploy to GCP production |

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
