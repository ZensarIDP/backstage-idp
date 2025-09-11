export interface PredefinedPrompt {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  template: string;
  systemPrompt: string;
}

export const PREDEFINED_PROMPTS: PredefinedPrompt[] = [
  {
    id: 'gae-terraform',
  title: 'Generate GAE Terraform Code',
  description: 'Create Terraform infrastructure code for Google App Engine deployment, including CI/CD pipeline orchestration',
  category: 'Infrastructure',
  icon: 'CloudQueue',
  template: `Generate comprehensive Terraform code to provision Google App Engine (GAE) with the following requirements:

- Include proper resource configuration for GAE service
- Add necessary IAM roles and permissions
- Include environment variables configuration
- Add scaling configuration
- Include health check settings
- Provide proper variable definitions
- Include output values for important resources
- Follow Terraform best practices and naming conventions
- Design and implement a CI/CD pipeline for orchestrating deployment and infrastructure changes
- Ensure the pipeline includes build, test, deploy, and rollback stages, and integrates with version control

Please provide complete, production-ready Terraform code and CI/CD pipeline configuration with comments explaining each section and orchestration logic.

REQUIRED FILES TO CREATE:
1. terraform/main.tf - Main GAE service configuration
2. terraform/variables.tf - Variable definitions
3. terraform/outputs.tf - Output values
4. terraform/provider.tf - Provider configuration
5. terraform/iam.tf - IAM roles and permissions (if needed)
6. .github/workflows/gae-deploy.yml - CI/CD pipeline orchestration workflow for deployment and infrastructure
7. docs/GAE_INFRASTRUCTURE_SETUP.md - Comprehensive documentation explaining all files, setup instructions, and usage guidelines

Each file should be complete and production-ready, with orchestration logic clearly explained.`,
    systemPrompt: `You are a DevOps expert specializing in Google Cloud Platform, Terraform, and CI/CD orchestration. Generate clean, well-documented, and production-ready Terraform code and CI/CD pipeline configuration following GCP, Terraform, and DevOps best practices. Include proper resource naming, variable definitions, comprehensive comments, and robust orchestration logic. Ensure the code and pipeline are secure and follow infrastructure as code and continuous delivery principles. Always create comprehensive documentation that explains the purpose, structure, and usage of all generated files.`
  },
  {
    id: 'gae-cicd-pipeline',
    title: 'Create GAE CI/CD Pipeline',
    description: 'Generate a complete CI/CD pipeline for Google App Engine deployments',
    category: 'CI/CD',
    icon: 'Build',
    template: `Create a comprehensive CI/CD pipeline to deploy applications on Google App Engine with the following features:

- Multi-stage pipeline (build, test, deploy)
- Automated testing integration
- Environment-based deployments (dev, staging, production)
- Proper secret management
- Build artifact management
- Deployment rollback capabilities
- Integration with version control
- Monitoring and notification setup

Please provide the complete pipeline configuration with detailed comments and best practices for GAE deployments.

REQUIRED FILES TO CREATE:
1. .github/workflows/gae-deploy.yml - Main deployment workflow
2. .github/workflows/gae-staging.yml - Staging deployment workflow (optional)
3. app.yaml - GAE application configuration file
4. docs/CICD_PIPELINE_DOCUMENTATION.md - Comprehensive documentation explaining the pipeline structure, workflow stages, and deployment process

Each file should be complete and production-ready.`,
    systemPrompt: `You are a DevOps engineer with expertise in CI/CD pipelines and Google App Engine. Create robust, scalable pipeline configurations following industry best practices. Include proper error handling, security measures, and deployment strategies. Ensure the pipeline is maintainable and follows DevOps principles. Always create comprehensive documentation that explains the pipeline workflow, configuration options, and usage instructions.`
  },
  {
    id: 'sonarqube-integration',
    title: 'Integrate SonarQube Scan',
    description: 'Update existing CI/CD pipeline to include SonarQube security scanning',
    category: 'Security',
    icon: 'Security',
    template: `Update an existing CI/CD pipeline to integrate SonarQube scan with the following requirements:

- Add security scanning stage to existing pipeline
- Configure vulnerability detection and reporting
- Set up scan result analysis and thresholds
- Implement pipeline failure/success criteria based on scan results
- Add proper error handling for scan failures
- Include scan report generation and archiving
- Configure notifications for security findings
- Ensure minimal impact on existing pipeline performance

Please provide the updated pipeline configuration with clear integration points and best practices for security scanning integration.

REQUIRED FILES TO CREATE:
1. Updated CI/CD pipeline files with SonarQube integration
2. sonar-project.properties - SonarQube configuration file
3. docs/SONARQUBE_INTEGRATION.md - Documentation explaining the integration, configuration, and usage of SonarQube scanning

Each file should be complete and production-ready.`,
    systemPrompt: `You are a DevSecOps specialist with expertise in SonarQube security scanning and CI/CD integration. Focus on seamless integration of security tools without disrupting existing workflows. Provide secure, efficient solutions that enhance pipeline security while maintaining performance and reliability. Always create comprehensive documentation that explains the security scanning setup, configuration details, and integration process.`
  },
  {
    id: 'artifact-registry-integration',
    title: 'Integrate Artifact Registry',
    description: 'Configure CI/CD pipeline for artifact management and registry integration',
    category: 'Artifact Management',
    icon: 'Storage',
    template: `Integrate Artifact Registry and configure uploading of artifacts through the CI/CD pipeline with the following features:

- Set up Google Artifact Registry repository
- Configure authentication and permissions
- Implement artifact build and packaging
- Add versioning strategy for artifacts
- Configure automated artifact upload
- Set up artifact cleanup and retention policies
- Implement artifact promotion between environments
- Add artifact scanning and validation
- Include proper tagging and metadata management

Please provide complete configuration for artifact registry integration with security best practices and efficient artifact management.

REQUIRED FILES TO CREATE:
1. Updated CI/CD pipeline files with Artifact Registry integration
2. Dockerfile - Container image configuration (if applicable)
3. artifact-registry-setup.sh - Setup script for Artifact Registry configuration
4. docs/ARTIFACT_REGISTRY_SETUP.md - Documentation explaining the artifact registry configuration, usage, and management processes

Each file should be complete and production-ready.`,
    systemPrompt: `You are a DevOps engineer specializing in artifact management and container registries. Create comprehensive solutions for artifact lifecycle management, including security, versioning, and efficient distribution. Follow best practices for artifact registry configuration and CI/CD integration. Always create comprehensive documentation that explains the artifact management setup, configuration procedures, and operational guidelines.`
  }
];

export class PredefinedPromptsService {
  static getAllPrompts(): PredefinedPrompt[] {
    return PREDEFINED_PROMPTS;
  }

  static getPromptById(id: string): PredefinedPrompt | undefined {
    return PREDEFINED_PROMPTS.find(prompt => prompt.id === id);
  }

  static getPromptsByCategory(category: string): PredefinedPrompt[] {
    return PREDEFINED_PROMPTS.filter(prompt => prompt.category === category);
  }

  static getCategories(): string[] {
    return [...new Set(PREDEFINED_PROMPTS.map(prompt => prompt.category))];
  }

  static formatPromptForAI(promptId: string, userInput?: string): {
    systemPrompt: string;
    userPrompt: string;
  } | null {
    const prompt = this.getPromptById(promptId);
    if (!prompt) {
      return null;
    }

    const userPrompt = userInput 
      ? `${prompt.template}\n\nAdditional requirements: ${userInput}`
      : prompt.template;

    return {
      systemPrompt: prompt.systemPrompt,
      userPrompt: userPrompt
    };
  }
}
