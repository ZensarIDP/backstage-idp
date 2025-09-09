import express from 'express';
import Router from 'express-promise-router';
import { OpenAIService } from './services/OpenAIService';

export async function createRouter({
  openAIService,
}: {
  openAIService: OpenAIService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  // Health check endpoint
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Get predefined prompts endpoint
  router.get('/predefined-prompts', (_req, res) => {
    try {
      // Return the predefined prompts configuration
      const prompts = [
        {
          id: 'gae-terraform',
          title: 'Generate GAE Terraform Code',
          description: 'Create Terraform infrastructure code for Google App Engine deployment',
          category: 'Infrastructure',
          icon: 'CloudQueue'
        },
        {
          id: 'gae-cicd-pipeline',
          title: 'Create GAE CI/CD Pipeline',
          description: 'Generate a complete CI/CD pipeline for Google App Engine deployments',
          category: 'CI/CD',
          icon: 'Build'
        },
        {
          id: 'sonarqube-integration',
          title: 'Integrate SonarQube Scan',
          description: 'Update existing CI/CD pipeline to include SonarQube security scanning',
          category: 'Security',
          icon: 'Security'
        },
        {
          id: 'artifact-registry-integration',
          title: 'Integrate Artifact Registry',
          description: 'Configure CI/CD pipeline for artifact management and registry integration',
          category: 'Artifact Management',
          icon: 'Storage'
        }
      ];
      
      res.json({ prompts });
    } catch (error) {
      console.error('Error fetching predefined prompts:', error);
      res.status(500).json({
        error: 'Failed to fetch predefined prompts'
      });
    }
  });

  // Predefined prompt execution endpoint
  router.post('/predefined-prompts/:promptId/execute', async (req, res) => {
    try {
      const { promptId } = req.params;
      const { userInput, repository, branch, context } = req.body;

      // Validate that OpenAI service is configured
      if (!openAIService.isConfigured()) {
        res.status(503).json({
          error: 'OpenAI service is not configured. Please set ai.openai.apiKey in your configuration.'
        });
        return;
      }

      // Get the predefined prompt template
      const promptTemplates = {
        'gae-terraform': {
          systemPrompt: 'You are a DevOps expert specializing in Google Cloud Platform and Terraform. Generate clean, well-documented, and production-ready Terraform code following GCP and Terraform best practices. Include proper resource naming, variable definitions, and comprehensive comments. Ensure the code is secure and follows infrastructure as code principles.',
          template: `Generate comprehensive Terraform code to provision Google App Engine (GAE) with the following requirements:

- Include proper resource configuration for GAE service
- Add necessary IAM roles and permissions
- Include environment variables configuration
- Add scaling configuration
- Include health check settings
- Provide proper variable definitions
- Include output values for important resources
- Follow Terraform best practices and naming conventions

Please provide complete, production-ready Terraform code with comments explaining each section.`
        },
        'gae-cicd-pipeline': {
          systemPrompt: 'You are a DevOps engineer with expertise in CI/CD pipelines and Google App Engine. Create robust, scalable pipeline configurations following industry best practices. Include proper error handling, security measures, and deployment strategies. Ensure the pipeline is maintainable and follows DevOps principles.',
          template: `Create a comprehensive CI/CD pipeline to deploy applications on Google App Engine with the following features:

- Multi-stage pipeline (build, test, deploy)
- Automated testing integration
- Environment-based deployments (dev, staging, production)
- Proper secret management
- Build artifact management
- Deployment rollback capabilities
- Integration with version control
- Monitoring and notification setup

Please provide the complete pipeline configuration with detailed comments and best practices for GAE deployments.`
        },
        'sonarqube-integration': {
          systemPrompt: 'You are a DevSecOps specialist with expertise in SonarQube security scanning and CI/CD integration. Focus on seamless integration of security tools without disrupting existing workflows. Provide secure, efficient solutions that enhance pipeline security while maintaining performance and reliability.',
          template: `Update an existing CI/CD pipeline to integrate SonarQube scan with the following requirements:

- Add security scanning stage to existing pipeline
- Configure vulnerability detection and reporting
- Set up scan result analysis and thresholds
- Implement pipeline failure/success criteria based on scan results
- Add proper error handling for scan failures
- Include scan report generation and archiving
- Configure notifications for security findings
- Ensure minimal impact on existing pipeline performance

Please provide the updated pipeline configuration with clear integration points and best practices for security scanning integration.`
        },
        'artifact-registry-integration': {
          systemPrompt: 'You are a DevOps engineer specializing in artifact management and container registries. Create comprehensive solutions for artifact lifecycle management, including security, versioning, and efficient distribution. Follow best practices for artifact registry configuration and CI/CD integration.',
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

Please provide complete configuration for artifact registry integration with security best practices and efficient artifact management.`
        }
      };

      const promptConfig = promptTemplates[promptId as keyof typeof promptTemplates];
      if (!promptConfig) {
        res.status(404).json({
          error: `Predefined prompt '${promptId}' not found`
        });
        return;
      }

      // Use the specialized predefined prompt method
      const response = await openAIService.generatePredefinedPromptResponse(
        promptId,
        promptConfig.template,
        promptConfig.systemPrompt,
        userInput
      );
      
      res.json({
        promptId,
        response,
        metadata: {
          timestamp: new Date().toISOString(),
          repository,
          branch,
          context: context || 'DevOps automation and infrastructure management'
        }
      });
    } catch (error) {
      console.error('Error in predefined prompt execution:', error);
      
      if (error instanceof Error) {
        // Handle OpenAI API errors
        if (error.message.includes('401')) {
          res.status(401).json({
            error: 'Invalid OpenAI API key'
          });
          return;
        }
        if (error.message.includes('429')) {
          res.status(429).json({
            error: 'OpenAI API rate limit exceeded'
          });
          return;
        }
        if (error.message.includes('500')) {
          res.status(500).json({
            error: 'OpenAI API server error'
          });
          return;
        }
      }
      
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });

  // OpenAI chat completions proxy endpoint
  router.post('/openai/chat/completions', async (req, res) => {
    try {
      // Validate that OpenAI service is configured
      if (!openAIService.isConfigured()) {
        res.status(503).json({
          error: 'OpenAI service is not configured. Please set ai.openai.apiKey in your configuration.'
        });
        return;
      }

      // Forward the request to OpenAI
      const response = await openAIService.generateResponse(req.body);
      
      res.json(response);
    } catch (error) {
      console.error('Error in OpenAI proxy:', error);
      
      if (error instanceof Error) {
        // Handle OpenAI API errors
        if (error.message.includes('401')) {
          res.status(401).json({
            error: 'Invalid OpenAI API key'
          });
          return;
        }
        if (error.message.includes('429')) {
          res.status(429).json({
            error: 'OpenAI API rate limit exceeded'
          });
          return;
        }
        if (error.message.includes('500')) {
          res.status(500).json({
            error: 'OpenAI API server error'
          });
          return;
        }
      }
      
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  });

  return router;
}
