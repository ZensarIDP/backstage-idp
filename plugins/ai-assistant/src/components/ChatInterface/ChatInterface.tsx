import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  Button,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import {
  Send as SendIcon,
  Refresh as RegenerateIcon,
  BubbleChart as ZenOpsAiIcon,
} from '@material-ui/icons';
import { OpenAIService } from '../../services/openAIService';

const useStyles = makeStyles(() => ({
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#1e1e1e',
    color: '#cccccc',
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
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
}));

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  thinking?: boolean;
}

interface ChatInterfaceProps {
  repository: any;
  branch: string;
  existingFiles: any[];
  onResponse: (response: any) => void;
  onFilesGenerated?: (files: any[], request: any) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  repository,
  branch,
  existingFiles,
  onResponse,
  onFilesGenerated,
}) => {
  const classes = useStyles();
  const configApi = useApi(configApiRef);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [openAIService, setOpenAIService] = useState<OpenAIService | null>(null);

  // Initialize OpenAI service
  useEffect(() => {
    const initOpenAI = () => {
      try {
        const service = new OpenAIService(configApi);
        setOpenAIService(service);
      } catch (error) {
        console.error('Failed to initialize OpenAI service:', error);
      }
    };
    
    initOpenAI();
  }, [configApi]);

  // Helper function to extract files from context response
  const extractFilesFromContextResponse = (response: string): Array<{path: string, content: string, isNew: boolean}> => {
    const files: Array<{path: string, content: string, isNew: boolean}> = [];
    
    // Extract FILE_START/FILE_END blocks
    const fileBlockRegex = /FILE_START:\s*(.+?)\s*\n```(\w+)?\n([\s\S]*?)\n```\s*\nFILE_END/g;
    let match;
    while ((match = fileBlockRegex.exec(response)) !== null) {
      const [, path, , content] = match;
      files.push({
        path: path.trim(),
        content: content.trim(),
        isNew: true,
      });
    }
    
    // If no FILE_START blocks found, fall back to regular code blocks
    if (files.length === 0) {
      const codeBlockRegex = /```(\w+)?\s*(?:\/\/\s*(.+))?\n([\s\S]*?)```/g;
      
      while ((match = codeBlockRegex.exec(response)) !== null) {
        const [, language, possiblePath, content] = match;
        
        // Try to determine file path from context
        let path = possiblePath || guessFilePathFromContent(content, language);
        
        files.push({
          path: path,
          content: content.trim(),
          isNew: true,
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
      
      // Use generateCodeWithContext for requests that involve modifying existing files
      const shouldUseContext = content.toLowerCase().includes('modify') || 
                              content.toLowerCase().includes('update') || 
                              content.toLowerCase().includes('change') ||
                              content.toLowerCase().includes('fix') ||
                              existingFiles.length > 0;
      
      let response;
      if (shouldUseContext && repository.entity) {
        // Build existing files context
        const existingFilesContext: { [key: string]: string } = {};
        existingFiles.forEach(f => {
          if (f.content) {
            existingFilesContext[f.path] = f.content;
          }
        });
        
        const contextResponse = await openAIService.generateCodeWithContext(
          content,
          repository.entity,
          existingFilesContext
        );
        
        // Parse the context response for files using the same logic
        const files = extractFilesFromContextResponse(contextResponse);
        const messageText = extractMessageFromContextResponse(contextResponse);
        
        response = {
          message: messageText,
          type: files.length > 0 ? 'file_generation' : 'conversation',
          files: files,
        };
      } else {
        response = await openAIService.generateResponse(aiRequest);
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
        <div className={classes.inputWrapper}>
          <TextField
            fullWidth
            multiline
            maxRows={3} // Reduced from 4 to 3
            placeholder="Ask ZenOps AI"
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
    </div>
  );
};
