# Template Fixes Applied

## Issues Fixed

### 1. ✅ Removed setup-branches workflow
- **Problem**: Unnecessary workflow causing complexity
- **Solution**: Deleted `setup-branches.yml` completely
- **Impact**: Simpler workflow setup, no branch creation automation

### 2. ✅ Fixed Node.js dependency installation
- **Problem**: `npm ci` requires `package-lock.json` but template doesn't generate one
- **Solution**: Changed from `npm ci` to `npm install` and removed cache dependency
- **Impact**: CI workflow will work without lock file

### 3. ✅ Made infrastructure provisioning automatic  
- **Problem**: Database setup required manual trigger
- **Solution**: Added automatic trigger on push to main branch
- **Impact**: Database will be provisioned automatically when repo is created (if setupDatabase=true)

### 4. ✅ Added conditional database provisioning
- **Problem**: Database workflow would run even if not requested
- **Solution**: Added `${{ values.setupDatabase }}` condition to both setup and destroy jobs
- **Impact**: Database workflows only run when user requested database setup

## Updated Workflows

### CI Workflow (`ci.yml`)
```yaml
# Before
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'
- name: Install dependencies
  run: npm ci

# After  
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
- name: Install dependencies
  run: npm install
```

### Infrastructure Workflow (`infrastructure.yml`)
```yaml
# Before
on:
  workflow_dispatch: # Manual only

# After
on:
  push:
    branches: [ main ]
    paths:
      - '.github/workflows/infrastructure.yml'
  workflow_dispatch: # Manual + Automatic

# Added conditions
if: ${{ values.setupDatabase }} && (conditions...)
```

## Expected Behavior Now

1. **When repo is created:**
   - CI workflow runs automatically on push
   - Database setup runs automatically IF setupDatabase=true
   - No lock file dependency issues

2. **Manual database management:**
   - Can still trigger database create/destroy manually
   - Only works if setupDatabase was enabled during template generation

3. **Simplified setup:**
   - No branch setup automation
   - Direct main branch deployment
   - Conditional database provisioning based on user choice

## Test Results Expected
- ✅ CI workflow should pass without package-lock.json errors  
- ✅ Database setup should run automatically for new repos (if enabled)
- ✅ No setup-branches workflow in generated repos
- ✅ Both Cloud Run and GKE deployments should work based on selection
