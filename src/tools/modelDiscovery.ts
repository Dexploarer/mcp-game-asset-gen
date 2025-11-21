/**
 * Model Discovery Tools
 *
 * Provides MCP tools for discovering and selecting AI models
 * available through the AI Gateway.
 */

import { getAvailableModels, getModelsByType } from '../config/gateway.js';

/**
 * Tool definitions for model discovery
 */
export const MODEL_DISCOVERY_TOOLS = [
  {
    name: 'gateway_list_models',
    description: `List all AI models available through the AI Gateway.
Returns detailed information about each model including:
- Model ID (e.g., 'openai/gpt-5', 'google/gemini-3-pro-image')
- Model name
- Description
- Pricing (input/output tokens, cache costs)
- Model type (language, embedding)

Use this to discover which models are available for image generation, text processing, or embeddings.`,
    inputSchema: {
      type: 'object',
      properties: {
        filterType: {
          type: 'string',
          enum: ['all', 'language', 'embedding'],
          description: 'Filter models by type (default: all)',
        },
        includePrice: {
          type: 'boolean',
          description: 'Include pricing information (default: true)',
        },
      },
    },
  },

  {
    name: 'gateway_get_model_info',
    description: `Get detailed information about a specific model.
Returns comprehensive details including capabilities, pricing, and usage guidelines.`,
    inputSchema: {
      type: 'object',
      properties: {
        modelId: {
          type: 'string',
          description: 'Model ID (e.g., "google/gemini-3-pro-image", "openai/gpt-5")',
        },
      },
      required: ['modelId'],
    },
  },

  {
    name: 'gateway_list_image_models',
    description: `List all image generation models available through AI Gateway.
Focuses specifically on models that can generate images from text prompts.
Perfect for discovering which models to use for game asset generation.`,
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  {
    name: 'gateway_recommend_model',
    description: `Get model recommendations based on your use case.
Analyzes available models and suggests the best options for your specific needs.`,
    inputSchema: {
      type: 'object',
      properties: {
        useCase: {
          type: 'string',
          description: 'Use case description (e.g., "character generation", "texture creation", "concept art")',
        },
        priority: {
          type: 'string',
          enum: ['quality', 'speed', 'cost'],
          description: 'Optimization priority (default: quality)',
        },
      },
      required: ['useCase'],
    },
  },
];

/**
 * Tool handlers for model discovery
 */
export const MODEL_DISCOVERY_HANDLERS: Record<string, (args: any) => Promise<string>> = {
  gateway_list_models: async (args) => {
    const filterType = args?.filterType || 'all';
    const includePrice = args?.includePrice !== false;

    try {
      let models;

      if (filterType === 'all') {
        const result = await getAvailableModels();
        models = result.models;
      } else {
        models = await getModelsByType(filterType as 'language' | 'embedding');
      }

      const formattedModels = models.map((model: any) => {
        const info: any = {
          id: model.id,
          name: model.name || model.id,
          type: model.modelType || 'unknown',
        };

        if (model.description) {
          info.description = model.description;
        }

        if (includePrice && model.pricing) {
          info.pricing = {
            input: `$${model.pricing.input}/token`,
            output: `$${model.pricing.output}/token`,
          };

          if (model.pricing.cachedInputTokens) {
            info.pricing.cachedInput = `$${model.pricing.cachedInputTokens}/token`;
          }

          if (model.pricing.cacheCreationInputTokens) {
            info.pricing.cacheCreation = `$${model.pricing.cacheCreationInputTokens}/token`;
          }
        }

        return info;
      });

      return JSON.stringify({
        totalModels: formattedModels.length,
        filterType: filterType,
        models: formattedModels,
      }, null, 2);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return JSON.stringify({
        error: `Failed to fetch models: ${errorMessage}`,
      });
    }
  },

  gateway_get_model_info: async (args) => {
    const modelId = args.modelId;

    if (!modelId) {
      return JSON.stringify({
        error: 'modelId is required',
      });
    }

    try {
      const { models } = await getAvailableModels();
      const model = models.find((m: any) => m.id === modelId);

      if (!model) {
        return JSON.stringify({
          error: `Model '${modelId}' not found`,
          availableModels: models.map((m: any) => m.id),
        });
      }

      return JSON.stringify({
        id: model.id,
        name: model.name || model.id,
        type: model.modelType || 'unknown',
        description: model.description || 'No description available',
        pricing: model.pricing || 'Pricing information not available',
        capabilities: extractCapabilities(model),
      }, null, 2);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return JSON.stringify({
        error: `Failed to fetch model info: ${errorMessage}`,
      });
    }
  },

  gateway_list_image_models: async () => {
    try {
      const { models } = await getAvailableModels();

      // Filter for models that likely support image generation
      // This is based on model ID patterns and naming conventions
      const imageModels = models.filter((model: any) => {
        const id = model.id.toLowerCase();
        const name = (model.name || '').toLowerCase();

        return (
          id.includes('image') ||
          id.includes('dall-e') ||
          id.includes('gemini') && (id.includes('image') || id.includes('pro-image')) ||
          name.includes('image') ||
          name.includes('vision')
        );
      });

      const formattedModels = imageModels.map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description || 'Image generation model',
        pricing: model.pricing ? {
          input: `$${model.pricing.input}/token`,
          output: `$${model.pricing.output}/token`,
        } : null,
      }));

      return JSON.stringify({
        totalImageModels: formattedModels.length,
        models: formattedModels,
        usage: 'Use these model IDs with gateway_generate_image or Hyperscape-specific tools',
      }, null, 2);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return JSON.stringify({
        error: `Failed to fetch image models: ${errorMessage}`,
      });
    }
  },

  gateway_recommend_model: async (args) => {
    const useCase = args.useCase?.toLowerCase() || '';
    const priority = args.priority || 'quality';

    try {
      const { models } = await getAvailableModels();

      // Simple recommendation logic based on use case
      const recommendations: any[] = [];

      if (useCase.includes('character') || useCase.includes('concept')) {
        recommendations.push({
          model: 'google/gemini-3-pro-image',
          reason: 'Excellent for detailed character and concept art with multi-modal support',
          priority: priority === 'quality' ? 'high' : 'medium',
        });

        recommendations.push({
          model: 'openai/gpt-image-1',
          reason: 'Good quality image generation with reliable results',
          priority: priority === 'speed' ? 'high' : 'medium',
        });
      }

      if (useCase.includes('texture') || useCase.includes('material')) {
        recommendations.push({
          model: 'google/gemini-3-pro-image',
          reason: 'Can generate detailed textures with precise control',
          priority: 'high',
        });
      }

      if (useCase.includes('embed') || useCase.includes('search') || useCase.includes('similar')) {
        recommendations.push({
          model: 'openai/text-embedding-3-small',
          reason: 'Efficient embeddings for similarity search and asset organization',
          priority: 'high',
        });
      }

      // If no specific recommendations, suggest general-purpose models
      if (recommendations.length === 0) {
        recommendations.push({
          model: 'google/gemini-3-pro-image',
          reason: 'General-purpose image generation with high quality',
          priority: 'high',
        });
      }

      // Sort by priority
      const sorted = recommendations.sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (a.priority !== 'high' && b.priority === 'high') return 1;
        return 0;
      });

      return JSON.stringify({
        useCase: args.useCase,
        priority: priority,
        recommendations: sorted,
        note: 'These recommendations are based on general capabilities. Test different models for your specific needs.',
      }, null, 2);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return JSON.stringify({
        error: `Failed to generate recommendations: ${errorMessage}`,
      });
    }
  },
};

/**
 * Extract capabilities from model metadata
 */
function extractCapabilities(model: any): string[] {
  const capabilities: string[] = [];

  if (model.modelType === 'language') {
    capabilities.push('text-generation');
  }

  if (model.modelType === 'embedding') {
    capabilities.push('embeddings');
  }

  const id = model.id.toLowerCase();
  const name = (model.name || '').toLowerCase();

  if (id.includes('image') || name.includes('image')) {
    capabilities.push('image-generation');
  }

  if (id.includes('vision') || name.includes('vision')) {
    capabilities.push('vision');
  }

  if (id.includes('edit') || name.includes('edit')) {
    capabilities.push('image-editing');
  }

  if (model.pricing?.cachedInputTokens) {
    capabilities.push('prompt-caching');
  }

  return capabilities.length > 0 ? capabilities : ['general'];
}
