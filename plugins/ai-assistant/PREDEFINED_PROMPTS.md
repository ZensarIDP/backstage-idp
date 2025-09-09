# Predefined Prompts Feature

## Overview

The AI Assistant now includes a set of curated, predefined prompts for common DevOps tasks. These prompts are designed to provide consistent, high-quality responses for specific infrastructure and CI/CD scenarios.

## Features

### Available Prompts

1. **Generate GAE Terraform Code**
   - Category: Infrastructure
   - Creates comprehensive Terraform code for Google App Engine deployment
   - Includes IAM roles, scaling, health checks, and best practices

2. **Create GAE CI/CD Pipeline**
   - Category: CI/CD
   - Generates complete CI/CD pipeline for Google App Engine
   - Includes multi-stage deployment, testing, and monitoring

3. **Integrate Sooner Cubes Scan**
   - Category: Security
   - Updates existing CI/CD pipelines to include security scanning
   - Provides vulnerability detection and reporting configuration

4. **Integrate Artifact Registry**
   - Category: Artifact Management
   - Configures artifact management and registry integration
   - Includes versioning, cleanup policies, and artifact promotion

### User Interface

- **Prompts Button**: Located in the chat interface, opens the predefined prompts drawer
- **Drawer Interface**: Clean, categorized list of available prompts
- **One-Click Selection**: Click any prompt to immediately execute it
- **VS Code Theme**: Consistent with the existing design system

### Backend Architecture

- **Dedicated Endpoints**: Separate API endpoints for predefined prompts
- **Structured Templates**: Each prompt has a specific system message and template
- **Enhanced Processing**: Lower temperature and higher token limits for consistent results
- **Error Handling**: Robust error handling and logging

## Usage

1. Click the "Build" icon (prompts button) in the chat interface
2. Browse the categorized list of predefined prompts
3. Click on any prompt to execute it immediately
4. The AI will generate a comprehensive response using the curated template

## Technical Implementation

### Frontend Components

- `PredefinedPromptsDrawer`: Main UI component for prompt selection
- `PredefinedPromptsService`: Service for managing prompt configurations
- Enhanced `ChatInterface`: Integrated drawer and prompt handling

### Backend Services

- `/predefined-prompts`: GET endpoint to retrieve available prompts
- `/predefined-prompts/:promptId/execute`: POST endpoint to execute prompts
- Enhanced `OpenAIService`: Specialized method for predefined prompt processing

### Configuration

Prompts are defined in `predefinedPromptsService.ts` with:
- Unique ID and metadata
- System prompt for AI behavior
- Template with structured requirements
- Category and icon configuration

## Benefits

1. **Consistency**: Standardized prompts ensure consistent outputs
2. **Quality**: Curated templates follow industry best practices
3. **Efficiency**: Quick access to common DevOps tasks
4. **Maintainability**: Centralized prompt management
5. **Scalability**: Easy to add new prompts without affecting existing functionality

## Future Enhancements

- User-customizable prompts
- Prompt versioning and history
- Analytics and usage tracking
- Additional DevOps categories
- Integration with external knowledge bases
