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
    description: 'Create Terraform infrastructure code for Google App Engine deployment',
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

Please provide complete, production-ready Terraform code with comments explaining each section.

REQUIRED FILES TO CREATE:
1. terraform/main.tf - Main GAE service configuration
2. terraform/variables.tf - Variable definitions
3. terraform/outputs.tf - Output values
4. terraform/provider.tf - Provider configuration
5. terraform/iam.tf - IAM roles and permissions (if needed)

Each file should be complete and production-ready.`,
    systemPrompt: `You are a DevOps expert specializing in Google Cloud Platform and Terraform. Generate clean, well-documented, and production-ready Terraform code following GCP and Terraform best practices. Include proper resource naming, variable definitions, and comprehensive comments. Ensure the code is secure and follows infrastructure as code principles.`
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

Each file should be complete and production-ready.`,
    systemPrompt: `You are a DevOps engineer with expertise in CI/CD pipelines and Google App Engine. Create robust, scalable pipeline configurations following industry best practices. Include proper error handling, security measures, and deployment strategies. Ensure the pipeline is maintainable and follows DevOps principles.`
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

Please provide the updated pipeline configuration with clear integration points and best practices for security scanning integration.`,
    systemPrompt: `You are a DevSecOps specialist with expertise in SonarQube security scanning and CI/CD integration. Focus on seamless integration of security tools without disrupting existing workflows. Provide secure, efficient solutions that enhance pipeline security while maintaining performance and reliability.`
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

Please provide complete configuration for artifact registry integration with security best practices and efficient artifact management.`,
    systemPrompt: `You are a DevOps engineer specializing in artifact management and container registries. Create comprehensive solutions for artifact lifecycle management, including security, versioning, and efficient distribution. Follow best practices for artifact registry configuration and CI/CD integration.`
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
