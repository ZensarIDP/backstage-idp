import OpenAI from 'openai';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';

export interface AIRequest {
  prompt: string;
  repository: {
    name: string;
    owner: string;
  };
  branch: string;
  existingFiles: Array<{
    path: string;
    type: string;
    content?: string;
  }>;
  context?: string;
}

export interface AIResponse {
  message: string;
  type: 'file_generation' | 'file_modification' | 'conversation' | 'error';
  files?: Array<{
    path: string;
    content: string;
    isNew: boolean;
    originalContent?: string;
  }>;
}

export class OpenAIService {
  private openai: OpenAI;
  private config: any;

  constructor(config: any) {
    this.config = config;
    let apiKey;
    try {
      // Try direct string access first (simplified structure)
      apiKey = config.getString('aiAssistant.openai.apiKey');
      console.info('[OpenAIService] API key found via direct path');
    } catch (error) {
      try {
        // Try optional string access
        apiKey = config.getOptionalString('aiAssistant.openai.apiKey');
        console.info('[OpenAIService] API key found via optional path');
      } catch (e) {
        console.error('[OpenAIService] Failed to read API key:', error, e);
        console.error('[OpenAIService] Available config:', JSON.stringify(config.get('aiAssistant'), null, 2));
      }
    }
    
    if (!apiKey || apiKey.length < 20) {
      console.error('[OpenAIService] API key missing or invalid. Length:', apiKey?.length || 0);
      console.error('[OpenAIService] Expected path: aiAssistant.openai.apiKey');
      throw new Error('OpenAI API key is missing or invalid. Please check your app-config.yaml.');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, calls should go through backend
    });
    // Log for troubleshooting
    console.info('[OpenAIService] Initialized with API key:', apiKey.slice(0, 8) + '...');
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      // Check if this is a conversation-only request (analysis, summary, explanation)
      const isConversationOnly = request.prompt.toLowerCase().includes('summarize') ||
                                 request.prompt.toLowerCase().includes('summary') ||
                                 request.prompt.toLowerCase().includes('what does') ||
                                 request.prompt.toLowerCase().includes('explain') ||
                                 request.prompt.toLowerCase().includes('analyze') ||
                                 request.prompt.toLowerCase().includes('check') ||
                                 request.prompt.toLowerCase().includes('review') ||
                                 request.prompt.toLowerCase().includes('describe') ||
                                 request.prompt.toLowerCase().includes('tell me') ||
                                 request.prompt.toLowerCase().includes('where does') ||
                                 request.prompt.toLowerCase().includes('how does') ||
                                 request.prompt.toLowerCase().includes('what is') ||
                                 request.prompt.toLowerCase().includes('why does');

      const systemPrompt = this.buildSystemPrompt(request, isConversationOnly);
      const userPrompt = this.buildUserPrompt(request);

      const model = this.config.getOptionalString('aiAssistant.openai.model') || 'gpt-4o';
      const maxTokens = this.config.getOptionalNumber('aiAssistant.openai.maxTokens') || 2000;
      const temperature = this.config.getOptionalNumber('aiAssistant.openai.temperature') || 0.3;

      // Log request for troubleshooting
      console.info('[OpenAIService] generateResponse:', { 
        model, 
        maxTokens, 
        temperature, 
        isConversationOnly,
        requestType: isConversationOnly ? 'CONVERSATION_ONLY' : 'POTENTIAL_FILE_GENERATION'
      });

      const completion = await this.openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // For conversation-only requests, return simple conversation response
      if (isConversationOnly) {
        console.log('[OpenAIService] Conversation-only response - no file parsing');
        return {
          message: response,
          type: 'conversation',
          files: []
        };
      }

      return this.parseAIResponse(response, request);
    } catch (error: any) {
      // More helpful error message
      let msg = 'Sorry, I encountered an error.';
      if (error?.status === 401 || error?.status === 403) {
        msg = 'OpenAI API key is invalid or unauthorized. Please check your key.';
      } else if (error?.status === 429) {
        msg = 'OpenAI rate limit exceeded. Please wait and try again.';
      } else if (error?.status === 400) {
        msg = 'OpenAI request was malformed. Please check your configuration.';
      } else if (error?.message) {
        msg += ' ' + error.message;
      }
      console.error('[OpenAIService] API Error:', error);
      return {
        message: msg,
        type: 'error',
      };
    }
  }

  private buildSystemPrompt(request: AIRequest, isConversationOnly: boolean = false): string {
    const repoInfo = `${request.repository.owner}/${request.repository.name}`;
    const existingFilesInfo = request.existingFiles.length > 0 
      ? `Existing files: ${request.existingFiles.map(f => `${f.path} (${f.type})`).join(', ')}`
      : 'No existing configuration files found';

    if (isConversationOnly) {
      // Conversation-only system prompt - NEVER generates files
      return `You are an expert DevOps and software engineer AI assistant integrated into Backstage. 
You are helping analyze repository: ${repoInfo} on branch: ${request.branch}.

${existingFilesInfo}

IMPORTANT: You are in CONVERSATION-ONLY mode. Your role is to:
1. Analyze and explain existing files and configurations
2. Answer questions about code, deployments, and DevOps practices  
3. Provide summaries and explanations
4. Offer guidance and best practices
5. NEVER generate, create, or modify any files

You should respond with conversational text only - no file content, no code blocks for files.
Focus on explaining, analyzing, and providing helpful information about the user's question.

Respond naturally as if having a conversation with a developer who wants to understand their codebase.`;
    }

    // Original system prompt for file generation
    return `You are an expert DevOps and software engineer AI assistant integrated into Backstage. 
You are helping with repository: ${repoInfo} on branch: ${request.branch}.

${existingFilesInfo}

Your role:
1. Generate high-quality configuration files (Dockerfile, CI/CD pipelines, Terraform, Helm charts, etc.)
2. Modify existing files when requested
3. Follow best practices for security, performance, and maintainability
4. Provide clear explanations for your suggestions
5. Consider the existing repository context

Response format:
- For file generation/modification, provide the complete file content
- Use clear, commented code
- Explain what you're doing and why
- Consider the existing files to avoid conflicts

Always respond in JSON format:
{
  "message": "Explanation of what you're providing",
  "type": "file_generation|file_modification|conversation",
  "files": [
    {
      "path": "relative/path/to/file",
      "content": "complete file content",
      "isNew": true/false
    }
  ]
}`;
  }

  private buildUserPrompt(request: AIRequest): string {
    let prompt = `Repository: ${request.repository.owner}/${request.repository.name}\n`;
    prompt += `Branch: ${request.branch}\n\n`;
    
    if (request.existingFiles.length > 0) {
      prompt += `Existing configuration files:\n`;
      request.existingFiles.forEach(file => {
        prompt += `- ${file.path} (${file.type})\n`;
      });
      prompt += '\n';
    }

    prompt += `Request: ${request.prompt}\n\n`;
    
    if (request.context) {
      prompt += `Additional context: ${request.context}\n\n`;
    }

    prompt += `Please provide your response in the specified JSON format.`;
    
    return prompt;
  }

  private parseAIResponse(response: string, request: AIRequest): AIResponse {
    try {
      // Try to parse as JSON first
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          message: parsed.message || 'Generated response',
          type: parsed.type || 'conversation',
          files: parsed.files || [],
        };
      }
    } catch (error) {
      console.warn('Failed to parse AI response as JSON, falling back to text parsing');
    }

    // Fallback: Try to extract code blocks
    const codeBlocks = this.extractCodeBlocks(response, request.existingFiles);
    if (codeBlocks.length > 0) {
      // Extract the explanatory text (everything before the first FILE_START)
      const fileStartIndex = response.indexOf('FILE_START:');
      let explanatoryText = '';
      
      if (fileStartIndex > 0) {
        explanatoryText = response.substring(0, fileStartIndex).trim();
      } else {
        // Fallback to text before first code block
        explanatoryText = response.split('```')[0].trim();
      }
      
      return {
        message: explanatoryText || 'Generated files based on your request',
        type: 'file_generation',
        files: codeBlocks,
      };
    }

    // Plain conversation response
    return {
      message: response,
      type: 'conversation',
    };
  }

  private extractCodeBlocks(response: string, existingFiles: Array<{path: string, type: string, content?: string}> = []): Array<{path: string, content: string, isNew: boolean}> {
    const files: Array<{path: string, content: string, isNew: boolean}> = [];
    
    // First try to extract FILE_START/FILE_END blocks
    const fileBlockRegex = /FILE_START:\s*(.+?)\s*\n```(\w+)?\n([\s\S]*?)\n```\s*\nFILE_END/g;
    let match;
    while ((match = fileBlockRegex.exec(response)) !== null) {
      const [, path, , content] = match;
      const trimmedPath = path.trim();
      const isExistingFile = existingFiles.some(ef => ef.path === trimmedPath);
      files.push({
        path: trimmedPath,
        content: content.trim(),
        isNew: !isExistingFile,
      });
    }
    
    // If no FILE_START blocks found, fall back to regular code blocks
    if (files.length === 0) {
      const codeBlockRegex = /```(\w+)?\s*(?:\/\/\s*(.+))?\n([\s\S]*?)```/g;
      
      while ((match = codeBlockRegex.exec(response)) !== null) {
        const [, language, possiblePath, content] = match;
        
        // Try to determine file path from context
        let path = possiblePath || this.guessFilePathFromContent(content, language);
        const isExistingFile = existingFiles.some(ef => ef.path === path);
        
        files.push({
          path: path,
          content: content.trim(),
          isNew: !isExistingFile,
        });
      }
    }
    
    return files;
  }

  private guessFilePathFromContent(content: string, language?: string): string {
    // Simple heuristics to guess file paths
    if (content.includes('FROM ') && content.includes('WORKDIR')) {
      return 'Dockerfile';
    }
    if (content.includes('name:') && content.includes('on:') && content.includes('jobs:')) {
      return '.github/workflows/ci.yml';
    }
    if (content.includes('resource "aws_') || content.includes('provider "aws"')) {
      return 'main.tf';
    }
    if (content.includes('apiVersion:') && content.includes('kind:')) {
      return 'deployment.yaml';
    }
    
    // Default based on language
    switch (language) {
      case 'dockerfile': return 'Dockerfile';
      case 'yaml': case 'yml': return 'config.yml';
      case 'terraform': case 'hcl': return 'main.tf';
      case 'json': return 'config.json';
      case 'javascript': case 'js': return 'index.js';
      case 'typescript': case 'ts': return 'index.ts';
      default: return 'generated-file.txt';
    }
  }

  /**
   * Generate file analysis without file modification
   * Optimized for reading and understanding existing files
   */
  async generateFileAnalysis(
    request: string,
    repository?: Entity,
    existingFiles?: { [key: string]: string },
    projectContext?: {
      githubSecrets: { [key: string]: string };
      instructions: {
        codeGeneration: string;
        contextAwareness: string;
        gcpIntegration: string;
        fileFormats: string;
        devopsPattern: string;
      };
      capabilities: string[];
    }
  ): Promise<string> {
    console.log('[OpenAIService] generateFileAnalysis called:', {
      requestLength: request.length,
      hasRepository: !!repository,
      existingFilesCount: existingFiles ? Object.keys(existingFiles).length : 0,
      hasProjectContext: !!projectContext,
    });
    
    try {
      // Build analysis-specific context
      let contextPrompt = '';
      
      if (repository) {
        const repoInfo = repository.metadata?.annotations?.['github.com/project-slug'];
        if (repoInfo) {
          const [owner, repo] = repoInfo.split('/');
          contextPrompt += `
# Repository Analysis: ${owner}/${repo}

## Project Information:
- Repository: ${repository.metadata?.name}
- Description: ${repository.metadata?.description || 'No description available'}
- Primary Language: ${repository.metadata?.annotations?.['github.com/language'] || 'Unknown'}
- Topics: ${repository.metadata?.annotations?.['github.com/topics'] || 'None'}

`;
        }
      }

      // Add project context if provided
      if (projectContext) {
        contextPrompt += `
## GitHub Secrets Available
${Object.entries(projectContext.githubSecrets).map(([key, desc]) => `- **${key}**: ${desc}`).join('\n')}

## Project Guidelines
${projectContext.instructions.contextAwareness}
${projectContext.instructions.gcpIntegration}
${projectContext.instructions.devopsPattern}

`;
      }

      // Add existing files context for analysis
      if (existingFiles && Object.keys(existingFiles).length > 0) {
        contextPrompt += `
## Repository Files for Analysis:
`;
        Object.entries(existingFiles).forEach(([filepath, content]) => {
          const fileExtension = this.getFileExtension(filepath);
          contextPrompt += `
### File: ${filepath}
\`\`\`${fileExtension}
${content.substring(0, 3000)}${content.length > 3000 ? '\n... (content truncated for context)' : ''}
\`\`\`

`;
        });
      }

      // Analysis-specific system prompt
      const systemPrompt = `You are an expert DevOps and infrastructure analyst with deep knowledge of CI/CD, cloud platforms, and software architecture.

${contextPrompt}

## Your Role - FILE ANALYSIS MODE:
You are in ANALYSIS MODE - your job is to read, understand, and explain existing files and configurations.

### What you should do:
1. **Analyze file contents** thoroughly and provide specific insights
2. **Answer specific questions** about deployment targets, configurations, and setup
3. **Explain what files do** in detail with specific examples from the actual content
4. **Identify deployment targets** (AWS, GCP, Azure, etc.) by examining the actual configuration
5. **Provide actionable insights** about the infrastructure and CI/CD setup
6. **Reference specific lines or configurations** from the files when explaining

### What you should NOT do:
- Do not generate or modify any files
- Do not provide file content or code blocks
- Do not suggest creating new files
- Focus purely on analysis and explanation

### Response Style:
- Be specific and reference actual file contents
- Answer questions directly with evidence from the files
- Provide clear, actionable insights
- Use a conversational, helpful tone
- When asked "where does this deploy", examine the files and tell exactly where

Remember: You have access to the actual file contents above. Use them to provide specific, accurate answers.

User Request: ${request}`;

      const model = this.config.getOptionalString('aiAssistant.openai.model') || 'gpt-4o';
      const maxTokens = this.config.getOptionalNumber('aiAssistant.openai.maxTokens') || 3000;
      const temperature = this.config.getOptionalNumber('aiAssistant.openai.temperature') || 0.3;

      console.log('[OpenAIService] Analysis request:', {
        model,
        maxTokens,
        temperature,
        hasFiles: !!(existingFiles && Object.keys(existingFiles).length > 0)
      });

      const completion = await this.openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      });

      const content = completion.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI API');
      }

      console.log('[OpenAIService] File analysis completed:', {
        contentLength: content.length,
        tokensUsed: completion.usage?.total_tokens || 'unknown'
      });

      return content;
      
    } catch (error) {
      console.error('[OpenAIService] Error in file analysis:', error);
      throw error;
    }
  }

  async generateCodeWithContext(
    request: string,
    repository?: Entity,
    existingFiles?: { [key: string]: string },
    projectContext?: {
      githubSecrets: { [key: string]: string };
      instructions: {
        codeGeneration: string;
        contextAwareness: string;
        gcpIntegration: string;
        fileFormats: string;
        devopsPattern: string;
      };
      capabilities: string[];
    },
    conversationHistory?: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>,
    generatedFilesContext?: string
  ): Promise<string> {
    
    // Trust the intelligent intent classification system instead of using unreliable keyword detection
    // The intent classification service has already determined this should use generateCodeWithContext
    console.log('[OpenAIService] Using AI-powered intent classification result. Proceeding with context generation.');
    
    console.log('[OpenAIService] generateCodeWithContext called with:', {
      requestLength: request.length,
      hasRepository: !!repository,
      existingFilesCount: existingFiles ? Object.keys(existingFiles).length : 0,
      hasProjectContext: !!projectContext,
      projectContextSecrets: projectContext ? Object.keys(projectContext.githubSecrets) : [],
      conversationHistoryLength: conversationHistory ? conversationHistory.length : 0,
      hasGeneratedFilesContext: !!generatedFilesContext
    });
    
    try {
      // Build enhanced context with repository analysis and existing files
      let contextPrompt = '';
      
      if (repository) {
        // Add repository context from our repository service
        const repoInfo = repository.metadata?.annotations?.['github.com/project-slug'];
        if (repoInfo) {
          const [owner, repo] = repoInfo.split('/');
          contextPrompt += `
# Repository Context: ${owner}/${repo}

## Project Information:
- Repository: ${repository.metadata?.name}
- Description: ${repository.metadata?.description || 'No description available'}
- Primary Language: ${repository.metadata?.annotations?.['github.com/language'] || 'Unknown'}
- Topics: ${repository.metadata?.annotations?.['github.com/topics'] || 'None'}

`;
        }
      }

      // Add project context (GitHub secrets and instructions) if provided
      if (projectContext) {
        contextPrompt += `
## GitHub Secrets Configuration
The following GitHub secrets are available for use in CI/CD workflows and deployment scripts:

`;
        Object.entries(projectContext.githubSecrets).forEach(([secretName, description]) => {
          contextPrompt += `- **${secretName}**: ${description}\n`;
        });

        contextPrompt += `

**IMPORTANT**: Always use these EXACT secret names in your generated files. Do not modify or assume different names.

## Code Generation Guidelines
${projectContext.instructions.codeGeneration}

## Context Awareness
${projectContext.instructions.contextAwareness}

## GCP Integration Guidelines
${projectContext.instructions.gcpIntegration}

## File Format Requirements
${projectContext.instructions.fileFormats}

## DevOps Patterns
${projectContext.instructions.devopsPattern}

## AI Assistant Capabilities
You can generate the following types of files and configurations:
${projectContext.capabilities.map(cap => `- ${cap}`).join('\n')}

`;
      }

      // Add generated files context if provided
      if (generatedFilesContext) {
        contextPrompt += generatedFilesContext;
      }

      // Add existing files context if provided
      if (existingFiles && Object.keys(existingFiles).length > 0) {
        contextPrompt += `
## Existing Files in Repository:
`;
        Object.entries(existingFiles).forEach(([filepath, content]) => {
          contextPrompt += `
### File: ${filepath}
\`\`\`${this.getFileExtension(filepath)}
${content.substring(0, 2000)}${content.length > 2000 ? '\n... (truncated)' : ''}
\`\`\`

`;
        });

        contextPrompt += `
## Instructions for File Modifications:
- When modifying existing files, preserve the existing structure and style
- Only change the specific parts requested
- Maintain existing imports, dependencies, and configuration
- Follow the coding patterns established in the existing files
- Do not recreate files from scratch unless explicitly requested

`;
      }

      // Enhanced system prompt with context awareness
      const systemPrompt = `You are an expert AI developer assistant with full access to the repository context and conversation history.

${contextPrompt}

## Conversation Memory Guidelines:
- You maintain context from previous messages in this conversation
- If you just generated a file and the user asks about it, refer to the specific file you created
- When asked "Is this file ready to use?" after generating a file, review the file you just created
- Remember files you've generated, their names, and their purposes
- Provide specific answers about files you've created rather than generic responses

## Iterative Development Guidelines:
- When asked to modify a file you previously generated, update the existing content rather than creating a new file
- Reference previous versions and explain what changes you're making
- For pipeline/deployment files, always include repository creation steps for Artifact Registry
- When improving files, maintain existing structure while adding enhancements
- Always provide complete, production-ready files that can be used immediately
- If user asks to change something in a file (like "use X instead of Y"), modify the existing file, don't create a new one

## GCP Best Practices (ALWAYS FOLLOW):
- **NEVER use Google Container Registry (GCR)** - always use Google Artifact Registry
- **ALWAYS check if Artifact Registry repository exists** before pushing images
- **ALWAYS create repository if it doesn't exist** using gcloud commands
- **Repository name should match the GitHub repository name** exactly
- **Include repository creation step in all GCP deployment pipelines**
- **Use format: REGION-docker.pkg.dev/PROJECT_ID/REPO_NAME/IMAGE_NAME**

## Docker Image Best Practices for GCP:
- Always use Artifact Registry instead of GCR
- Always include repository creation step with gcloud artifacts repositories create command
- Always check if repository exists before creating
- Use exact GitHub repository name for Artifact Registry repository name
- Follow format: REGION-docker.pkg.dev/PROJECT_ID/REPO_NAME/IMAGE_NAME:TAG

## Your Capabilities:
- Generate new files following project conventions
- Modify existing files while preserving structure
- Create production-ready code with proper error handling
- Follow best practices and industry standards
- Generate comprehensive documentation and comments

## Response Format:
Always respond with structured file information in this format:

FILE_START: path/to/file.ext
[file content here]
FILE_END

Multiple files should be separated with blank lines.

## Guidelines:
- Use the repository's existing patterns and technologies
- When modifying existing files, only change what's necessary
- Include proper imports and dependencies
- Add meaningful comments and documentation
- Ensure code is production-ready
- Follow the project's coding style and conventions

User Request: ${request}`;

      const model = this.config.getOptionalString('aiAssistant.openai.model') || 'gpt-4o';
      const maxTokens = this.config.getOptionalNumber('aiAssistant.openai.maxTokens') || 4000;
      const temperature = this.config.getOptionalNumber('aiAssistant.openai.temperature') || 0.3;

      // Build messages array with conversation history
      const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
        {
          role: 'system',
          content: systemPrompt
        }
      ];

      // Add conversation history if provided (excluding system messages)
      if (conversationHistory && conversationHistory.length > 0) {
        // Take last 10 messages to avoid token limits
        const recentHistory = conversationHistory.slice(-10);
        recentHistory.forEach(msg => {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        });
      }

      // Add current request
      messages.push({
        role: 'user',
        content: request
      });

      console.log('[OpenAIService] Sending messages:', {
        messageCount: messages.length,
        hasHistory: !!(conversationHistory && conversationHistory.length > 0),
        historyLength: conversationHistory ? conversationHistory.length : 0
      });

      const completion = await this.openai.chat.completions.create({
        model: model,
        messages: messages,
        max_tokens: maxTokens,
        temperature: temperature,
      });

      const content = completion.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI API');
      }

      console.log('[OpenAIService] generateCodeWithContext response:', {
        contentLength: content.length,
        hasFileContent: content.includes('FILE_START'),
        model: model,
        tokensUsed: completion.usage?.total_tokens || 'unknown'
      });

      // Validate response quality to prevent repetitive responses
      if (content.length < 50) {
        console.warn('[OpenAIService] Response too short, may be low quality');
      }
      
      if (content.includes('Created') && content.includes('Regenerate')) {
        console.warn('[OpenAIService] Detected potentially repetitive response pattern');
      }

      console.log('[OpenAIService] Code generation successful with context');
      return content;
      
    } catch (error) {
      console.error('[OpenAIService] Error generating code with context:', error);
      throw error;
    }
  }

  private getFileExtension(filepath: string): string {
    const ext = filepath.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'yml': 'yaml',
      'yaml': 'yaml',
      'json': 'json',
      'xml': 'xml',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'md': 'markdown',
      'dockerfile': 'dockerfile',
      'sql': 'sql',
    };
    return languageMap[ext || ''] || 'text';
  }
}

export const useOpenAIService = () => {
  const config = useApi(configApiRef);
  return new OpenAIService(config);
};
