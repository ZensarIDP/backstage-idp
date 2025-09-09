import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useApi, configApiRef, discoveryApiRef } from '@backstage/core-plugin-api';
import {
  Send as SendIcon,
  Refresh as RegenerateIcon,
  BubbleChart as ZenOpsAiIcon,
  Check as CreatedIcon,
  Settings as ModifyIcon,
  InsertDriveFile as FileIcon,
  FolderOpen as OpenIcon,
  ExpandLess as PromptsIcon,
} from '@material-ui/icons';
import { OpenAIService } from '../../services/openAIService';
import { intentClassificationService } from '../../services/intentClassificationService';
import { PredefinedPromptsDrawer } from '../PredefinedPromptsPanel';
import { PredefinedPrompt, PredefinedPromptsService } from '../../services/predefinedPromptsService';

const useStyles = makeStyles(() => ({
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#1e1e1e',
    color: '#cccccc',
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    position: 'relative', // Add relative positioning for the drawer
  },
  messagesContainer: {
    flex: 1,
    padding: '12px 16px',
    overflowY: 'auto',
    backgroundColor: '#1e1e1e',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  messageItem: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100%',
    marginBottom: 16,
    opacity: 0,
    animation: '$fadeInUp 0.3s ease-out forwards',
  },
  '@keyframes fadeInUp': {
    '0%': {
      opacity: 0,
      transform: 'translateY(10px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  userMessage: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    maxWidth: '95%',
  },
  messageContent: {
    padding: '12px 16px',
    borderRadius: 8,
    wordBreak: 'break-word',
    fontSize: '14px',
    lineHeight: 1.5,
    position: 'relative',
  },
  userMessageContent: {
    backgroundColor: '#007acc',
    color: '#ffffff',
    borderBottomRightRadius: 4,
  },
  aiMessageContent: {
    backgroundColor: '#252526',
    color: '#cccccc',
    border: '1px solid #2d2d30',
    borderBottomLeftRadius: 4,
  },
  codeBlock: {
    backgroundColor: '#1e1e1e',
    border: '1px solid #2d2d30',
    borderRadius: 4,
    padding: '8px 12px',
    margin: '8px 0',
    fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
    fontSize: '13px',
    color: '#d4d4d4',
    overflow: 'auto',
    position: 'relative',
    '&::before': {
      content: 'attr(data-language)',
      position: 'absolute',
      top: 4,
      right: 8,
      fontSize: '10px',
      color: '#858585',
      textTransform: 'uppercase',
    },
  },
  inputContainer: {
    padding: '8px 16px', // Reduced from 12px to 8px
    borderTop: '1px solid #2d2d30',
    backgroundColor: '#252526',
    display: 'flex',
    flexDirection: 'column',
    gap: 6, // Reduced from 8px to 6px
    position: 'relative', // Add relative positioning for button
  },
  inputWrapper: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-end',
  },
  inputField: {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#3c3c3c',
      color: '#cccccc',
      fontSize: '13px', // Reduced from 14px
      minHeight: '36px', // Set smaller minimum height
      '& fieldset': {
        border: '1px solid #464647',
      },
      '&:hover fieldset': {
        borderColor: '#007fd4',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#007fd4',
      },
      '& input::placeholder': {
        color: '#969696',
        fontWeight: 200, // Make placeholder thinner
        opacity: 0.8,
      },
    },
    '& .MuiOutlinedInput-input': {
      padding: '8px 12px',
    },
  },
  sendButton: {
    minWidth: 40,
    height: 40,
    backgroundColor: '#007acc',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#1177bb',
    },
    '&:disabled': {
      backgroundColor: '#2d2d30',
      color: '#656565',
    },
  },
  promptsButton: {
    position: 'absolute',
    top: -45,
    left: '50%',
    transform: 'translateX(-50%)',
    minWidth: 40,
    height: 32,
    backgroundColor: '#252526',
    color: '#cccccc',
    border: '1px solid #464647',
    borderRadius: '8px 8px 0 0',
    zIndex: 1001,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#2a2d2e',
      borderColor: '#007fd4',
    },
    '&.active': {
      backgroundColor: '#007acc',
      borderColor: '#007acc',
      color: '#ffffff',
    },
  },
  avatar: {
    width: 24,
    height: 24,
    fontSize: '12px',
  },
  userAvatar: {
    backgroundColor: '#007acc',
    color: '#ffffff',
  },
  aiAvatar: {
    backgroundColor: '#4fc3f7',
    color: '#000000',
  },
  thinkingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#969696',
    fontSize: '13px',
    fontStyle: 'italic',
    '& .dots': {
      display: 'inline-flex',
      '& span': {
        width: 4,
        height: 4,
        borderRadius: '50%',
        backgroundColor: '#10a37f',
        margin: '0 1px',
        animation: '$typing 1.4s infinite ease-in-out',
        '&:nth-child(1)': {
          animationDelay: '0s',
        },
        '&:nth-child(2)': {
          animationDelay: '0.2s',
        },
        '&:nth-child(3)': {
          animationDelay: '0.4s',
        },
      },
    },
  },
  '@keyframes typing': {
    '0%, 80%, 100%': {
      transform: 'scale(0.8)',
      opacity: 0.5,
    },
    '40%': {
      transform: 'scale(1)',
      opacity: 1,
    },
  },
  messageActions: {
    display: 'flex',
    gap: 4,
    marginTop: 8,
    '& button': {
      minWidth: 'auto',
      padding: '4px 8px',
      fontSize: '11px',
      backgroundColor: 'transparent',
      color: '#858585',
      border: '1px solid #464647',
      borderRadius: 3,
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#2d2d30',
        color: '#cccccc',
      },
    },
  },
  timestamp: {
    fontSize: '11px',
    color: '#b4b4b4', // Improved contrast from #858585 to #b4b4b4
    marginTop: 4,
    textAlign: 'right',
    fontWeight: 500, // Added weight for better visibility
  },
  userTimestamp: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.8)', // Better contrast for user messages on blue background
    marginTop: 4,
    textAlign: 'right',
    fontWeight: 500,
  },
  fileSummary: {
    marginTop: 8,
    padding: '6px 0',
    borderTop: '1px solid #2d2d30',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 6px',
    borderRadius: 3,
    backgroundColor: '#2d2d30',
    fontSize: '11px',
    color: '#cccccc',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid transparent',
    '&:hover': {
      backgroundColor: '#3e3e42',
      borderColor: '#007acc',
      '& $fileName': {
        color: '#58a6ff',
      },
    },
  },
  fileTag: {
    padding: '1px 4px',
    borderRadius: 2,
    fontSize: '9px',
    fontWeight: 600,
    textTransform: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    letterSpacing: '0.3px',
    backgroundColor: 'transparent',
  },
  createdTag: {
    color: '#7d8590',
  },
  modifiedTag: {
    color: '#7d8590',
  },
  fileName: {
    flex: 1,
    fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
    fontSize: '11px',
    color: '#e6edf3',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s ease',
  },
}));

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  thinking?: boolean;
  files?: Array<{
    path: string;
    content: string;
    isNew: boolean;
    originalContent?: string;
  }>;
}

interface GeneratedFile {
  path: string;
  content: string;
  isNew: boolean;
  originalContent?: string;
  generatedAt: Date;
  lastModified: Date;
  version: number;
}

interface ChatInterfaceProps {
  repository: any;
  branch: string;
  existingFiles: any[];
  onResponse: (response: any) => void;
  onFilesGenerated?: (files: any[], request: any) => void;
  onOpenFile?: (filePath: string) => void;
  projectContext?: {
    githubSecrets: {
      [key: string]: string;
    };
    instructions: {
      codeGeneration: string;
      contextAwareness: string;
      gcpIntegration: string;
      fileFormats: string;
      devopsPattern: string;
    };
    capabilities: string[];
  };
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  repository,
  branch,
  existingFiles,
  onResponse,
  onFilesGenerated,
  onOpenFile,
  projectContext,
}) => {
  const classes = useStyles();
  const configApi = useApi(configApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [promptsDrawerOpen, setPromptsDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [openAIService, setOpenAIService] = useState<OpenAIService | null>(null);

  // Initialize OpenAI service
  useEffect(() => {
    const initOpenAI = () => {
      try {
        const service = new OpenAIService(configApi, discoveryApi);
        setOpenAIService(service);
      } catch (error) {
        console.error('Failed to initialize OpenAI service:', error);
      }
    };
    
    initOpenAI();
  }, [configApi, discoveryApi]);

  // Helper function to extract files from context response
  // File memory management functions
const addOrUpdateGeneratedFile = (file: {path: string, content: string, isNew: boolean}) => {
    const now = new Date();
    setGeneratedFiles(prev => {
      const existing = prev.find(f => f.path === file.path);
      if (existing) {
        // Update existing file
        return prev.map(f => 
          f.path === file.path 
            ? { ...f, content: file.content, lastModified: now, version: f.version + 1 }
            : f
        );
      } else {
        // Add new file
        return [...prev, {
          path: file.path,
          content: file.content,
          isNew: file.isNew,
          generatedAt: now,
          lastModified: now,
          version: 1
        }];
      }
    });
  };

  const getGeneratedFileContext = (): string => {
    if (generatedFiles.length === 0) return '';
    
    let context = '\n## Previously Generated Files in This Session:\n';
    
    generatedFiles.forEach(file => {
      const fileExt = file.path.split('.').pop() || 'txt';
      const content = file.content.length > 1000 
        ? file.content.substring(0, 1000) + '\n... (truncated)' 
        : file.content;
      
      context += `
### ${file.path} (v${file.version})
- Generated: ${file.generatedAt.toLocaleTimeString()}
- Last Modified: ${file.lastModified.toLocaleTimeString()}
- Type: ${file.isNew ? 'New file' : 'Modified existing file'}

\`\`\`${fileExt}
${content}
\`\`\`
`;
    });
    
    context += '\n**IMPORTANT FOR AI**: When asked to modify any of these files, update the existing content rather than creating a new file. Reference these files by their exact paths when discussing them. If user says "use X instead of Y" or "don\'t use Z", modify the existing file.\n';
    
    return context;
  };

const extractFilesFromContextResponse = (response: string): Array<{path: string, content: string, isNew: boolean}> => {

    const files: Array<{path: string, content: string, isNew: boolean}> = [];
    
    // Extract FILE_START/FILE_END blocks
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
        let path = possiblePath || guessFilePathFromContent(content, language);
        const isExistingFile = existingFiles.some(ef => ef.path === path);
        
        files.push({
          path: path,
          content: content.trim(),
          isNew: !isExistingFile,
        });
      }
    }
    
    return files;
  };

  // Helper function to extract message from context response
  const extractMessageFromContextResponse = (response: string): string => {
    const fileStartIndex = response.indexOf('FILE_START:');
    
    if (fileStartIndex > 0) {
      return response.substring(0, fileStartIndex).trim();
    } else {
      // Fallback to text before first code block
      return response.split('```')[0].trim() || 'Generated files based on your request';
    }
  };

  // Helper function to guess file paths
  const guessFilePathFromContent = (content: string, language?: string): string => {
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
  };

  // Helper function to render file summary
  const renderFileSummary = (files: Array<{path: string, content: string, isNew: boolean, originalContent?: string}>) => {
    if (!files || files.length === 0) return null;

    return (
      <div className={classes.fileSummary}>
        {files.map((file, index) => {
          const isNewFile = file.isNew;
          
          // Extract just the file name from the path
          const fileName = file.path.split('/').pop() || file.path;

          return (
            <div 
              key={index} 
              className={classes.fileItem}
              onClick={() => onOpenFile?.(file.path)}
              title={`Click to open ${file.path}`}
            >
              <div className={`${classes.fileTag} ${isNewFile ? classes.createdTag : classes.modifiedTag}`}>
                {isNewFile ? (
                  <>
                    <CreatedIcon style={{ fontSize: 10 }} />
                    Created
                  </>
                ) : (
                  <>
                    <ModifyIcon style={{ fontSize: 10 }} />
                    Modified
                  </>
                )}
              </div>
              
              <div className={classes.fileName}>
                <FileIcon style={{ fontSize: 12, color: '#7d8590', marginRight: 4 }} />
                {fileName}
              </div>
              
              <OpenIcon style={{ fontSize: 12, color: '#7d8590' }} />
            </div>
          );
        })}
      </div>
    );
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processAiRequest = async (content: string) => {
    if (!openAIService) {
      return {
        message: "AI service is not available. Please check your OpenAI configuration.",
        type: 'error',
      };
    }

    try {
      const aiRequest = {
        prompt: content,
        repository: {
          name: repository.name,
          owner: repository.owner,
        },
        branch: branch,
        existingFiles: existingFiles.map(f => ({ 
          path: f.path, 
          type: f.type,
          content: f.content 
        })),
      };
      
      // 🧠 UNBREAKABLE AI-POWERED INTENT CLASSIFICATION
      // This replaces fragile keyword matching with robust semantic understanding
      console.log('[ChatInterface] 🤖 Starting AI-powered intent classification...');
      
      const classificationContext = {
        userMessage: content,
        hasRepository: !!repository.entity,
        availableFiles: existingFiles.map(f => f.path),
        generatedFiles: generatedFiles.map(f => f.path),
        conversationHistory: messages.slice(-6).map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        currentFile: undefined // TODO: Add current file context if available
      };

      const intentResult = await intentClassificationService.classifyIntent(classificationContext);
      
      console.log('[ChatInterface] 🎯 INTENT CLASSIFICATION RESULT:', {
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        reasoning: intentResult.reasoning,
        context: intentResult.context,
        originalMessage: content
      });

      // Route based on AI-determined intent
      const shouldUseAnalysisMode = intentResult.intent === 'ANALYZE';
      const shouldUseModificationMode = intentResult.intent === 'MODIFY';
      const shouldUseGenerationMode = intentResult.intent === 'GENERATE';
      const shouldUseContextMode = shouldUseModificationMode || shouldUseGenerationMode;

      console.log('[ChatInterface] 🧠 INTELLIGENT REQUEST CLASSIFICATION:', {
        request: content,
        classification: {
          intent: intentResult.intent,
          confidence: intentResult.confidence,
          reasoning: intentResult.reasoning
        },
        routing: {
          shouldUseAnalysisMode,
          shouldUseContextMode,
          shouldUseModificationMode,
          shouldUseGenerationMode,
          willReadFiles: shouldUseAnalysisMode,
          willModifyFiles: shouldUseContextMode
        },
        context: intentResult.context,
        hasRepository: !!repository.entity,
        hasGeneratedFiles: generatedFiles.length > 0,
        expectedBehavior: shouldUseAnalysisMode ? 'READ FILES + ANALYZE' : 
                         shouldUseContextMode ? 'GENERATE/MODIFY FILES' : 'BASIC CONVERSATION'
      });
      
      // VALIDATION: Check for classification conflicts (should be rare with AI classification)
      if (shouldUseAnalysisMode && shouldUseContextMode) {
        console.warn('[ChatInterface] ⚠️ CLASSIFICATION CONFLICT: Both analysis and context modes triggered');
        console.warn('[ChatInterface] Request:', content);
        console.warn('[ChatInterface] Intent:', intentResult.intent, 'Confidence:', intentResult.confidence);
      }
      
      let response;
      
      // INTELLIGENT ROUTING SYSTEM
      if (shouldUseAnalysisMode && repository.entity) {
        // FILE ANALYSIS MODE: Read files and provide intelligent insights
        console.log('[ChatInterface] � ANALYSIS MODE: Reading files for intelligent analysis');
        
        // Build comprehensive file context for analysis
        const analysisContext: { [key: string]: string } = {};
        existingFiles.forEach(f => {
          if (f.content) {
            analysisContext[f.path] = f.content;
          }
        });
        
        // Use analysis-specific AI service call with conversation history
        const conversationHistory = messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));
        
        const analysisResponse = await openAIService.generateFileAnalysis(
          content,
          repository.entity,
          analysisContext,
          projectContext,
          conversationHistory // Pass converted conversation history for context
        );
        
        response = {
          message: analysisResponse,
          type: 'analysis',
          files: []
        };
        
      } else if (shouldUseContextMode && repository.entity) {
        // FILE MODIFICATION/GENERATION MODE: Create or modify files
        console.log('[ChatInterface] 🔧 CONTEXT MODE: Using enhanced context for file operations');
        
        // Build existing files context
        const existingFilesContext: { [key: string]: string } = {};
        existingFiles.forEach(f => {
          if (f.content) {
            existingFilesContext[f.path] = f.content;
          }
        });
        
        // Build conversation history for context
        const conversationHistory = messages.slice(-8).map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));
        
        // Get generated files context for file memory
        const generatedFilesContext = getGeneratedFileContext();
        
        const contextResponse = await openAIService.generateCodeWithContext(
          content,
          repository.entity,
          existingFilesContext,
          projectContext,
          conversationHistory,
          generatedFilesContext
        );
        
        // Parse the context response for files
        const files = extractFilesFromContextResponse(contextResponse);
        const messageText = extractMessageFromContextResponse(contextResponse);
        
        // Update generated files memory
        files.forEach(file => {
          addOrUpdateGeneratedFile(file);
        });
        
        response = {
          message: messageText,
          type: files.length > 0 ? 'file_generation' : 'conversation',
          files: files,
        };
        
      } else {
        // BASIC CONVERSATION MODE: Simple AI chat without file operations
        console.log('[ChatInterface] 💬 CONVERSATION MODE: Basic AI response without file operations');
        response = await openAIService.generateResponse(aiRequest);
      }
      
      // Update generated files memory for any response that includes files
      if (response.files && response.files.length > 0) {
        response.files.forEach((file: any) => {
          addOrUpdateGeneratedFile(file);
        });
      }
      
      return {
        message: response.message || response,
        type: response.type === 'error' ? 'error' : (response.files && response.files.length > 0 ? 'file_generation' : 'conversation'),
        files: response.files || [],
      };
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return {
        message: "I encountered an error while processing your request. Please try again or check your OpenAI configuration.",
        type: 'error',
      };
    }
  };

  const handlePredefinedPromptSelect = async (prompt: PredefinedPrompt) => {
    // Format the prompt for AI with structured template
    const formattedPrompt = PredefinedPromptsService.formatPromptForAI(prompt.id);
    if (!formattedPrompt) {
      console.error('Failed to format predefined prompt');
      return;
    }

    // Add user message showing ONLY the selected prompt title
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: `Selected: ${prompt.title}`,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add thinking message immediately for loading state
    const thinkingMessage: Message = {
      id: `thinking-${Date.now()}`,
      content: '',
      sender: 'ai',
      timestamp: new Date(),
      thinking: true,
    };

    setMessages(prev => [...prev, userMessage, thinkingMessage]);
    setLoading(true);

    try {
      if (!openAIService) {
        throw new Error('OpenAI service not initialized');
      }

      // Create enhanced prompt that FORCES file generation
      // Format the predefined prompt with enhanced context
      const enhancedPrompt = `${formattedPrompt.systemPrompt}

${formattedPrompt.userPrompt}

PREDEFINED TEMPLATE ENHANCEMENT:
- Template: ${prompt.title}
- This is a specialized DevOps workflow template with curated best practices
- Repository: "${repository.name}" on branch "${branch}"
- Current structure: ${existingFiles?.map(f => f.path).join(', ') || 'basic structure'}
- Generate production-ready, complete code files following best practices`;

      console.log('[PredefinedPrompt] Using context-aware generation like normal prompts:', {
        promptId: prompt.id,
        title: prompt.title,
        requestType: 'CONTEXT_AWARE_GENERATION'
      });

      // Get existing files context like normal prompts
      const existingFilesContext = existingFiles?.reduce((acc, file) => {
        acc[file.path] = file.content || '';
        return acc;
      }, {} as { [key: string]: string }) || {};

      // Get project context like normal prompts
      const projectContext = {
        githubSecrets: {},
        instructions: {
          codeGeneration: 'Generate production-ready code with best practices',
          contextAwareness: 'Consider existing project structure and files',
          gcpIntegration: 'Include GCP service configurations when applicable',
          fileFormats: 'Use appropriate file extensions and naming conventions',
          devopsPattern: 'Follow DevOps best practices and patterns'
        },
        capabilities: ['terraform', 'github-actions', 'docker', 'gcp']
      };

      // Get conversation history like normal prompts
      const conversationHistory = messages
        .filter(msg => msg.sender === 'user' || msg.sender === 'ai')
        .slice(-5) // Last 5 messages for context
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));

      // Get generated files context for file memory
      const generatedFilesContext = getGeneratedFileContext();

      // Use the same context-aware generation as normal prompts, but with predefined enhancement
      const contextResponse = await openAIService.generateCodeWithContext(
        enhancedPrompt,
        repository.entity,
        existingFilesContext,
        projectContext,
        conversationHistory,
        generatedFilesContext
      );

      // Parse the context response for files (same as normal prompts)
      const files = extractFilesFromContextResponse(contextResponse);
      const messageText = extractMessageFromContextResponse(contextResponse);

      // Update generated files memory
      files.forEach(file => {
        addOrUpdateGeneratedFile(file);
      });

      const response = {
        message: messageText,
        type: files.length > 0 ? 'file_generation' : 'conversation',
        files: files,
      };

      // Create assistant message like normal prompts do
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: response.message,
        sender: 'ai',
        timestamp: new Date(),
        files: response.files,
      };

      // Remove thinking message and add response message (same as normal prompts)
      setMessages(prev => prev.filter(msg => !msg.thinking).concat(assistantMessage));

      // Call onResponse like normal prompts do - pass the entire response object
      if (onResponse) {
        onResponse(response);
      }

      // Handle generated files - trigger the enhanced preview like normal prompts
      if (response.files && response.files.length > 0) {
        console.log('[PredefinedPrompt] Files generated:', response.files.length);
        
        if (onFilesGenerated) {
          onFilesGenerated(response.files, { prompt: prompt.title, timestamp: new Date() });
        }
      } else {
        console.warn('[PredefinedPrompt] No files generated in response');
      }
    } catch (error) {
      console.error('Error with predefined prompt:', error);
      
      // Remove thinking message
      setMessages(prev => prev.filter(msg => !msg.thinking));
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error processing this predefined prompt. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    // Add thinking message immediately
    const thinkingMessage: Message = {
      id: `thinking-${Date.now()}`,
      content: '',
      sender: 'ai',
      timestamp: new Date(),
      thinking: true,
    };

    setMessages(prev => [...prev, userMessage, thinkingMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await processAiRequest(content);
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: typeof response.message === 'string' ? response.message : (response as any).message || 'Response received',
        sender: 'ai',
        timestamp: new Date(),
        files: response.files || [],
      };

      // Replace thinking message with actual response
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id).concat(aiMessage));
      onResponse(response);
      
      // If the response includes files and we have a handler, trigger the enhanced preview
      if (response.files && response.files.length > 0 && onFilesGenerated) {
        onFilesGenerated(response.files, { prompt: content, timestamp: new Date() });
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `ai-error-${Date.now()}`,
        content: 'Sorry, I encountered an error processing your request.',
        sender: 'ai',
        timestamp: new Date(),
      };
      // Replace thinking message with error message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id).concat(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render message content with syntax highlighting
  const renderMessageContent = (content: string) => {
    // Split content by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code
        const lines = part.slice(3, -3).split('\n');
        const language = lines[0].trim();
        const code = lines.slice(1).join('\n');
        
        return (
          <div key={index} className={classes.codeBlock} data-language={language}>
            <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>
              {code}
            </pre>
          </div>
        );
      } else {
        // Regular text
        return part ? (
          <div key={index} style={{ whiteSpace: 'pre-wrap' }}>
            {part}
          </div>
        ) : null;
      }
    });
  };

  // Helper function to regenerate AI response
  const regenerateResponse = (message: Message) => {
    // Find the previous user message
    const messageIndex = messages.findIndex(m => m.id === message.id);
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1];
      if (userMessage.sender === 'user') {
        // Remove the AI message and regenerate
        setMessages(prev => prev.slice(0, messageIndex));
        handleSendMessage(userMessage.content);
      }
    }
  };

  return (
    <div className={classes.chatContainer}>
      <div className={classes.messagesContainer}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: 32,
            textAlign: 'center',
            color: '#969696'
          }}>
            <ZenOpsAiIcon style={{ fontSize: 64, marginBottom: 16, color: '#10a37f' }} />
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#cccccc', marginBottom: 8 }}>
              ZenOps AI Ready
            </div>
            <div style={{ fontSize: '14px', lineHeight: 1.5, maxWidth: 300, color: '#969696' }}>
              Ask for help with generating configuration files, CI/CD pipelines, 
              infrastructure code, and get AI-powered development assistance.
            </div>
          </div>
        ) : (
          messages.map((message) => (
          <div
            key={message.id}
            className={[
              classes.messageItem,
              message.sender === 'user' ? classes.userMessage : classes.aiMessage
            ].join(' ')}
          >
            <div
              className={[
                classes.messageContent,
                message.sender === 'user' ? classes.userMessageContent : classes.aiMessageContent
              ].join(' ')}
            >
              {/* Render message content with proper formatting */}
              {renderMessageContent(message.content)}
              
              {message.thinking && (
                <div className={classes.thinkingIndicator}>
                  <div className="dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              
              {/* File Summary for AI responses with files */}
              {message.sender === 'ai' && !message.thinking && message.files && message.files.length > 0 && (
                renderFileSummary(message.files)
              )}
              
              {/* Message actions for AI responses */}
              {message.sender === 'ai' && !message.thinking && (
                <div className={classes.messageActions}>
                  <button onClick={() => regenerateResponse(message)}>
                    <RegenerateIcon style={{ fontSize: 14, marginRight: 6 }} />
                    Regenerate
                  </button>
                </div>
              )}
              
              {/* Timestamp */}
              <div className={message.sender === 'user' ? classes.userTimestamp : classes.timestamp}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={classes.inputContainer}>
        <Tooltip title="DevOps Prompts">
          <IconButton
            className={`${classes.promptsButton} ${promptsDrawerOpen ? 'active' : ''}`}
            onClick={() => setPromptsDrawerOpen(!promptsDrawerOpen)}
            disabled={loading}
          >
            <PromptsIcon style={{ transform: promptsDrawerOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
          </IconButton>
        </Tooltip>
        
        <div className={classes.inputWrapper}>          
          <TextField
            fullWidth
            multiline
            maxRows={3} // Reduced from 4 to 3
            placeholder="Ask ZenOps AI or use predefined prompts"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputValue);
              }
            }}
            className={classes.inputField}
            disabled={loading}
            variant="outlined"
            InputProps={{
              style: { 
                padding: '8px 12px', // Reduced padding
                minHeight: '36px' // Set consistent min height
              }
            }}
          />
          
          <Button
            variant="contained"
            className={classes.sendButton}
            onClick={() => handleSendMessage(inputValue)}
            disabled={loading || !inputValue.trim()}
          >
            {loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
          </Button>
        </div>
      </div>

      <PredefinedPromptsDrawer
        open={promptsDrawerOpen}
        onClose={() => setPromptsDrawerOpen(false)}
        onPromptSelect={handlePredefinedPromptSelect}
      />
    </div>
  );
};
