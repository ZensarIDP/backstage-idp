# Node.js Template - Enhanced Modular Configuration

## 🎯 Overview

The Node.js template has been completely redesigned to be more modular and provide flexible deployment options with infrastructure provisioning capabilities.

## ✨ Key Features

### 🚀 **Deployment Options**
- **Cloud Run**: Serverless container deployment (default)
- **Google Kubernetes Engine (GKE)**: Container orchestration
- Pre-configured for your GKE cluster: `zenhotel-cluster` in `asia-south1`

### 🏗️ **Infrastructure Provisioning**
- **Optional automated infrastructure setup**
- **Database options**: MySQL, PostgreSQL, or none
- **Cloud Storage**: Optional bucket provisioning
- **Terraform-based** infrastructure as code

### 🔧 **Modular Codebase**
- **Clear separation** between boilerplate and custom code
- **Easy replacement** of application logic
- **Comprehensive middleware** setup (security, logging, CORS)

### 🌍 **Multi-Environment Support**
- **Development**, **Staging**, and **Production** environments
- **Environment-specific** configurations and secrets
- **Automatic deployment** based on branch (dev/staging/main)

## 📋 Template Configuration

When creating a new service, users will be prompted for:

### 1. Basic Information
- **Component ID**: Service name
- **Description**: Service description  
- **Owner**: Team or individual owner

### 2. Cloud Configuration
- **Cloud Provider**: GCP (default, others disabled)
- **Deployment Type**: Cloud Run or GKE
- **GKE Settings** (if GKE selected):
  - Cluster: `zenhotel-cluster` (default)
  - Region: `asia-south1` (default)
  - Namespace: `default` (default)

### 3. Infrastructure Provisioning (Optional)
- **Enable Infrastructure**: Yes/No checkbox
- **Database Type**: MySQL, PostgreSQL, or None
- **Cloud Storage**: Enable bucket creation

## 📁 Generated Project Structure

```
my-service/
├── 📄 index.js                     # Main app (modular, easy to replace)
├── 📦 package.json                 # Enhanced dependencies & scripts
├── 🐳 Dockerfile                   # Container configuration
├── 📝 README.md                    # Comprehensive documentation
├── ⚙️ .eslintrc.js                 # Code quality rules
├── 🌍 .env.*                       # Environment configurations
├── 
├── 🔄 .github/workflows/           # CI/CD Pipelines
│   ├── ci-cd.yml                   # Main deployment workflow
│   └── infrastructure.yml          # Infrastructure provisioning
├── 
├── ☸️ k8s/ (GKE only)             # Kubernetes manifests
│   ├── deployment.yaml            # K8s deployment config
│   └── service.yaml               # K8s service config
├── 
├── 🏗️ infrastructure/ (if enabled) # Terraform IaC
│   ├── main.tf                    # Provider configuration
│   ├── variables.tf               # Input variables
│   ├── resources.tf               # Infrastructure resources
│   └── outputs.tf                 # Resource outputs
└── 
└── 📜 deploy/                      # Deployment scripts
    ├── dev.sh
    ├── staging.sh
    └── prod.sh
```

## 🔄 Modular Application Code

The `index.js` file is designed for easy customization:

```javascript
// ========================================
// YOUR APPLICATION CODE STARTS HERE  
// ========================================

// Replace this section with your actual API endpoints
// Keep the health check endpoint above
// Keep the error handling below

// ========================================
// YOUR APPLICATION CODE ENDS HERE
// ========================================
```

### 🛡️ Built-in Features
- **Health check endpoint** (`/health`) - Required for cloud deployments
- **Security middleware** (Helmet, CORS)
- **Request logging** (Morgan)
- **Error handling** with environment-aware responses
- **404 handling** for undefined routes

## 🚀 Deployment Flow

### **Automatic Deployment**
1. **Push to `dev`** → Deploys to development environment
2. **Push to `staging`** → Deploys to staging environment
3. **Push to `main`** → Deploys to production environment

### **Infrastructure Provisioning** (if enabled)
1. **Triggers immediately** on repository creation
2. **Manual trigger** available via GitHub Actions
3. **Environment-specific** resource creation
4. **Terraform state** managed per environment

### **Required GitHub Secrets**
- **Authentication**: `GCP_SA_KEY` or environment-specific keys
- **Project IDs**: `GCP_PROJECT_ID` or environment-specific IDs

## 🏗️ Infrastructure Resources (When Enabled)

### **Database Options**
- **MySQL 8.0** Cloud SQL instance with auto-generated credentials
- **PostgreSQL 15** Cloud SQL instance with auto-generated credentials
- Automatic database and user creation

### **Storage Options** 
- **Cloud Storage bucket** with versioning enabled
- Proper IAM permissions configured
- Globally unique naming with random suffix

### **Networking**
- Public IP access for databases (configurable)
- Load balancer for GKE services
- Cloud Run with public access

## 🎯 Deployment Targets

### **Cloud Run** (Default)
- **Serverless** container deployment
- **Auto-scaling** based on traffic
- **Pay-per-use** pricing model
- **Environment-specific** resource allocation

### **Google Kubernetes Engine** 
- **Container orchestration** on your existing cluster
- **Horizontal pod autoscaling**
- **Load balancer** service exposure
- **Namespace isolation** per environment

## 🔧 Developer Experience

### **Local Development**
```bash
npm install          # Install dependencies
npm run dev         # Start with auto-reload
npm test           # Run test suite
npm run lint       # Check code quality
```

### **Container Development**  
```bash
npm run docker:build    # Build image
npm run docker:run      # Run container
npm run docker:stop     # Stop container
```

### **Infrastructure Management**
```bash
npm run infra:init      # Initialize Terraform
npm run infra:plan      # Plan infrastructure changes  
npm run infra:apply     # Apply infrastructure changes
```

## 📊 Monitoring & Observability

- **Health check endpoint** for readiness/liveness probes
- **Structured logging** with request correlation
- **Environment-aware** error responses
- **Cloud-native** monitoring integration

## 🛡️ Security Features

- **Helmet.js** for security headers
- **CORS** configuration
- **Input validation** middleware ready
- **Environment-based** secret management
- **IAM** properly configured for infrastructure

## 🔄 Migration Path

To replace the boilerplate application:

1. **Keep required endpoints** (`/health`)
2. **Replace marked sections** in `index.js`
3. **Update dependencies** in `package.json` as needed
4. **Modify environment** variables for your needs
5. **Test locally** before deploying

---

This enhanced template provides a production-ready foundation that scales from simple APIs to complex microservices with minimal configuration overhead.
