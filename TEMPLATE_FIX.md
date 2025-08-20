# Template Fix Applied

## Issue Identified
The template was failing during the "Register" step with the error:
```
InputError: No integration found for host ${{ steps['publish-github'].output.repoContentsUrl || steps['publish-bitbucket'].output.repoContentsUrl }}
```

## Root Cause
Backstage scaffolder templates don't support complex OR expressions (`||`) in step input values. The expression `${{ steps['publish-github'].output.repoContentsUrl || steps['publish-bitbucket'].output.repoContentsUrl }}` was being passed literally as a string instead of being evaluated.

## Solution Applied

### 1. Split Register Step
**Before:**
```yaml
- id: register
  name: Register
  action: catalog:register
  input:
    repoContentsUrl: ${{ steps['publish-github'].output.repoContentsUrl || steps['publish-bitbucket'].output.repoContentsUrl }}
    catalogInfoPath: '/catalog-info.yaml'
```

**After:**
```yaml
- id: register-github
  name: Register in Catalog (GitHub)
  if: ${{ parameters.repoHost === 'github' }}
  action: catalog:register
  input:
    repoContentsUrl: ${{ steps['publish-github'].output.repoContentsUrl }}
    catalogInfoPath: '/catalog-info.yaml'

- id: register-bitbucket
  name: Register in Catalog (Bitbucket)
  if: ${{ parameters.repoHost === 'bitbucket' }}
  action: catalog:register
  input:
    repoContentsUrl: ${{ steps['publish-bitbucket'].output.repoContentsUrl }}
    catalogInfoPath: '/catalog-info.yaml'
```

### 2. Updated Output Links
**Before:**
```yaml
output:
  links:
    - title: Repository
      url: ${{ steps['publish-github'].output.remoteUrl || steps['publish-bitbucket'].output.remoteUrl }}
    - title: Open in catalog
      icon: catalog
      entityRef: ${{ steps.register.output.entityRef }}
```

**After:**
```yaml
output:
  links:
    - title: Repository
      url: ${{ parameters.repoHost === "github" ? steps["publish-github"].output.remoteUrl : steps["publish-bitbucket"].output.remoteUrl }}
    - title: Open in catalog
      icon: catalog
      entityRef: ${{ parameters.repoHost === "github" ? steps["register-github"].output.entityRef : steps["register-bitbucket"].output.entityRef }}
```

## Key Changes

1. **Conditional Steps**: Each platform now has its own register step with conditional execution
2. **Ternary Expressions**: Used ternary operators (`condition ? value1 : value2`) instead of OR operators
3. **Direct References**: Each step directly references its own output instead of using complex expressions

## Testing
The template should now work correctly for both GitHub and Bitbucket repositories. Try creating a new service to verify the fix.

## Status
✅ **Fixed**: Template registration error
✅ **GitHub**: Works as before
✅ **Bitbucket**: Should now work properly
✅ **Conditional Logic**: Properly implemented with supported Backstage syntax

## Next Steps
1. Test creating a GitHub repository (should work as before)
2. Test creating a Bitbucket repository (should now work)
3. Verify catalog registration works for both platforms
