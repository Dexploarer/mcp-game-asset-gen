/**
 * AI Gateway Configuration
 *
 * This module sets up the Vercel AI Gateway for unified model inference
 * across multiple providers (OpenAI, Google, etc.)
 */

import { createGateway } from '@ai-sdk/gateway';
import { generateText, streamText, embedMany } from 'ai';

/**
 * Gateway provider instance
 * Uses AI_GATEWAY_API_KEY environment variable by default
 */
export const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY || '',
  baseURL: process.env.AI_GATEWAY_BASE_URL || 'https://ai-gateway.vercel.sh/v1/ai',
});

/**
 * Hyperscape-specific model configurations
 * Tailored for game asset generation
 */
export const HYPERSCAPE_MODELS = {
  // Image generation models
  imageGeneration: {
    // Google Gemini for high-quality game concept art
    geminiProImage: 'google/gemini-3-pro-image',
    // OpenAI for character sheets and detailed assets
    openaiImage: 'openai/gpt-image-1',
  },

  // Text models for prompt enhancement
  textGeneration: {
    // For enhancing user prompts with game-specific details
    gpt4: 'openai/gpt-5',
    grok: 'xai/grok-3',
  },

  // Embedding models for asset similarity and search
  embeddings: {
    openai: 'openai/text-embedding-3-small',
  },
} as const;

/**
 * Asset generation styles specific to Hyperscape
 */
export const HYPERSCAPE_STYLES = {
  // Default RuneScape 2007 style
  runescapeLowPoly: {
    description: 'Low-poly RuneScape 2007 style with blocky geometry and flat-shaded surfaces',
    keywords: ['low-poly', 'blocky', 'flat-shaded', 'game-ready', 'simple textures', 'clean geometry'],
  },

  // Alternative styles
  marvelStyle: {
    description: 'Marvel-style comic book aesthetic with bold colors',
    keywords: ['marvel', 'comic', 'bold colors', 'stylized', 'heroic'],
  },

  skyrimStyle: {
    description: 'Elder Scrolls Skyrim-style medieval fantasy',
    keywords: ['skyrim', 'medieval', 'fantasy', 'realistic textures', 'detailed'],
  },

  stylized: {
    description: 'Stylized game art with exaggerated proportions',
    keywords: ['stylized', 'cartoon', 'exaggerated', 'vibrant'],
  },
} as const;

/**
 * Asset type configurations for Hyperscape
 */
export const HYPERSCAPE_ASSET_TYPES = {
  character: {
    defaultPromptSuffix: 'humanoid character in T-pose, game-ready, low-poly style, 1.7m height',
    imageSize: { width: 1024, height: 1024 },
  },

  weapon: {
    defaultPromptSuffix: 'game weapon asset, centered, with clear grip point, low-poly',
    imageSize: { width: 1024, height: 1024 },
  },

  armor: {
    defaultPromptSuffix: 'armor piece, game-ready, fitted to humanoid character, low-poly',
    imageSize: { width: 1024, height: 1024 },
  },

  tool: {
    defaultPromptSuffix: 'tool asset, game-ready, centered, low-poly',
    imageSize: { width: 1024, height: 1024 },
  },

  resource: {
    defaultPromptSuffix: 'resource item, game-ready, icon-style, low-poly',
    imageSize: { width: 512, height: 512 },
  },

  building: {
    defaultPromptSuffix: 'building structure, game-ready, with clear entry points, low-poly',
    imageSize: { width: 1024, height: 1024 },
  },
} as const;

/**
 * Material tier configurations for Hyperscape
 */
export const HYPERSCAPE_MATERIAL_TIERS = {
  bronze: {
    color: '#CD7F32',
    description: 'Bronze tier - basic starter equipment',
    keywords: ['bronze', 'copper-brown', 'weathered metal', 'basic'],
  },

  steel: {
    color: '#B0C4DE',
    description: 'Steel tier - intermediate equipment',
    keywords: ['steel', 'silver-gray', 'polished metal', 'refined'],
  },

  mithril: {
    color: '#9966CC',
    description: 'Mithril tier - advanced equipment',
    keywords: ['mithril', 'purple-blue', 'magical metal', 'enchanted', 'glowing'],
  },
} as const;

/**
 * Get available models from AI Gateway
 */
export async function getAvailableModels(): Promise<any> {
  try {
    return await gateway.getAvailableModels();
  } catch (error) {
    console.error('Error fetching available models:', error);
    throw error;
  }
}

/**
 * Get filtered models by type
 */
export async function getModelsByType(modelType: 'language' | 'embedding') {
  const { models } = await getAvailableModels();
  return models.filter((m: any) => m.modelType === modelType);
}

/**
 * Generate Hyperscape-specific enhanced prompt
 */
export function enhancePromptForHyperscape(
  userPrompt: string,
  assetType: keyof typeof HYPERSCAPE_ASSET_TYPES,
  style: keyof typeof HYPERSCAPE_STYLES = 'runescapeLowPoly',
  materialTier?: keyof typeof HYPERSCAPE_MATERIAL_TIERS
): string {
  const assetConfig = HYPERSCAPE_ASSET_TYPES[assetType];
  const styleConfig = HYPERSCAPE_STYLES[style];
  const materialConfig = materialTier ? HYPERSCAPE_MATERIAL_TIERS[materialTier] : null;

  let enhancedPrompt = userPrompt;

  // Add style keywords
  enhancedPrompt += `, ${styleConfig.keywords.join(', ')}`;

  // Add material tier if specified
  if (materialConfig) {
    enhancedPrompt += `, ${materialConfig.keywords.join(', ')}`;
  }

  // Add asset type suffix
  enhancedPrompt += `, ${assetConfig.defaultPromptSuffix}`;

  return enhancedPrompt;
}

export {
  generateText,
  streamText,
  embedMany,
};
