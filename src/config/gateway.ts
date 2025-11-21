/**
 * AI Gateway Configuration
 *
 * This module sets up the Vercel AI Gateway for unified model inference
 * across multiple providers (OpenAI, Google, etc.)
 *
 * Uses Hyperscape prompt system for modern, high-quality game assets
 */

import { createGateway } from '@ai-sdk/gateway';
import { generateText, streamText, embedMany } from 'ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Load Hyperscape prompts from JSON files
 */
function loadPrompts() {
  const promptsDir = path.join(__dirname, '../../prompts');

  try {
    const gameStyles = JSON.parse(fs.readFileSync(path.join(promptsDir, 'game-style-prompts.json'), 'utf-8'));
    const assetTypes = JSON.parse(fs.readFileSync(path.join(promptsDir, 'asset-type-prompts.json'), 'utf-8'));
    const materialPresets = JSON.parse(fs.readFileSync(path.join(promptsDir, 'material-presets.json'), 'utf-8'));
    const generationPrompts = JSON.parse(fs.readFileSync(path.join(promptsDir, 'generation-prompts.json'), 'utf-8'));
    const gpt4Prompts = JSON.parse(fs.readFileSync(path.join(promptsDir, 'gpt4-enhancement-prompts.json'), 'utf-8'));

    return { gameStyles, assetTypes, materialPresets, generationPrompts, gpt4Prompts };
  } catch (error) {
    console.error('[Gateway] Failed to load Hyperscape prompts:', error);
    // Return defaults if files don't exist
    return {
      gameStyles: { default: {}, custom: {} },
      assetTypes: { avatar: { default: {} }, item: { default: {} } },
      materialPresets: [],
      generationPrompts: {},
      gpt4Prompts: {},
    };
  }
}

const prompts = loadPrompts();

/**
 * Asset generation styles from Hyperscape
 * Modern high-quality styles are now the default
 */
export const HYPERSCAPE_STYLES = {
  // Modern stylized (NEW DEFAULT) - hand-painted game assets
  stylized: {
    id: 'stylized',
    name: 'Stylized Hand-Painted',
    description: prompts.gameStyles.custom?.stylized?.base || 'Stylized hand painted game asset',
    keywords: ['stylized', 'hand-painted', 'game-ready', 'modern', 'vibrant colors', 'clean topology'],
    isModern: true,
  },

  // Modern realistic - high-quality realistic rendering
  realistic: {
    id: 'realistic',
    name: 'Realistic',
    description: prompts.gameStyles.custom?.realistic?.base || 'Realistic modern game asset',
    keywords: ['realistic', 'PBR materials', 'high-detail', 'modern game', 'photorealistic', 'detailed textures'],
    isModern: true,
  },

  // Skyrim-style - fantasy RPG quality
  skyrimStyle: {
    id: 'skyrim-style',
    name: 'Skyrim Style',
    description: prompts.gameStyles.custom?.['skyrim-style']?.base || 'Skyrim style quality and design',
    keywords: ['skyrim-style', 'fantasy RPG', 'medieval', 'detailed', 'game-ready'],
    isModern: true,
  },

  // Marvel-style - cinematic game quality
  marvelStyle: {
    id: 'marvel',
    name: 'Marvel Cinematic',
    description: prompts.gameStyles.custom?.marvel?.base || 'Modern Marvel movie styled design and quality, high resolution, yet 3D game like',
    keywords: ['marvel-style', 'cinematic', 'high-quality', 'modern', 'heroic', 'detailed'],
    isModern: true,
  },

  // RuneScape low-poly (legacy option)
  runescapeLowPoly: {
    id: 'runescape',
    name: 'RuneScape 2007',
    description: prompts.gameStyles.default?.runescape?.base || 'Low-poly RuneScape 2007',
    keywords: ['low-poly', 'blocky', 'flat-shaded', 'runescape2007', 'simple geometry'],
    isModern: false,
    legacy: true,
  },

  // Generic low-poly (legacy option)
  genericLowPoly: {
    id: 'generic',
    name: 'Generic Low-Poly',
    description: prompts.gameStyles.default?.generic?.base || 'low-poly 3D game asset style',
    keywords: ['low-poly', 'game-asset', 'simple', 'basic geometry'],
    isModern: false,
    legacy: true,
  },
} as const;

/**
 * Asset type configurations for Hyperscape
 */
export const HYPERSCAPE_ASSET_TYPES = {
  character: {
    category: 'avatar',
    type: 'character',
    defaultPromptSuffix: 'standing in T-pose with arms stretched out horizontally, front view on neutral background, modern game-ready quality',
    posePrompt: prompts.generationPrompts.posePrompts?.avatar?.tpose || 'standing in T-pose with arms stretched out horizontally',
    imageSize: { width: 1024, height: 1024 },
    placeholder: prompts.assetTypes.avatar?.default?.character?.placeholder,
  },

  humanoid: {
    category: 'avatar',
    type: 'humanoid',
    defaultPromptSuffix: 'humanoid character in T-pose with clear proportions, front view, modern game-ready quality',
    posePrompt: prompts.generationPrompts.posePrompts?.avatar?.tpose || 'standing in T-pose with arms stretched out horizontally',
    imageSize: { width: 1024, height: 1024 },
    placeholder: prompts.assetTypes.avatar?.default?.humanoid?.placeholder,
  },

  npc: {
    category: 'avatar',
    type: 'npc',
    defaultPromptSuffix: 'NPC character in T-pose, ready for animation, modern game-ready quality',
    posePrompt: prompts.generationPrompts.posePrompts?.avatar?.tpose || 'standing in T-pose with arms stretched out horizontally',
    imageSize: { width: 1024, height: 1024 },
    placeholder: prompts.assetTypes.avatar?.default?.npc?.placeholder,
  },

  creature: {
    category: 'avatar',
    type: 'creature',
    defaultPromptSuffix: 'creature in a neutral pose displaying its features, modern game-ready quality',
    imageSize: { width: 1024, height: 1024 },
    placeholder: prompts.assetTypes.avatar?.default?.creature?.placeholder,
  },

  weapon: {
    category: 'item',
    type: 'weapon',
    defaultPromptSuffix: 'full weapon clearly displayed on neutral background, centered composition, modern game-ready quality',
    imageSize: { width: 1024, height: 1024 },
    placeholder: prompts.assetTypes.item?.default?.weapon?.placeholder,
  },

  armor: {
    category: 'item',
    type: 'armor',
    defaultPromptSuffix: 'floating armor piece shaped for T-pose body fitting, openings positioned at correct angles for T-pose (horizontal for shoulders), hollow openings, no armor stand or mannequin, modern game-ready quality',
    posePrompt: prompts.generationPrompts.posePrompts?.armor?.generic,
    imageSize: { width: 1024, height: 1024 },
    placeholder: prompts.assetTypes.item?.default?.armor?.placeholder,
    critical: 'CRITICAL: armor must be SHAPED FOR T-POSE BODY - shoulder openings pointing straight sideways at 90 degrees',
  },

  tool: {
    category: 'item',
    type: 'tool',
    defaultPromptSuffix: 'tool from a clear angle displaying its functionality, centered on neutral background, modern game-ready quality',
    imageSize: { width: 1024, height: 1024 },
    placeholder: prompts.assetTypes.item?.default?.tool?.placeholder,
  },

  resource: {
    category: 'item',
    type: 'resource',
    defaultPromptSuffix: 'resource material or item in detail, icon-style presentation, modern game-ready quality',
    imageSize: { width: 512, height: 512 },
    placeholder: prompts.assetTypes.item?.default?.resource?.placeholder,
  },

  consumable: {
    category: 'item',
    type: 'consumable',
    defaultPromptSuffix: 'consumable item clearly displayed with recognizable features, modern game-ready quality',
    imageSize: { width: 512, height: 512 },
    placeholder: prompts.assetTypes.item?.default?.consumable?.placeholder,
  },

  building: {
    category: 'item',
    type: 'building',
    defaultPromptSuffix: 'building structure from an isometric view, clear architecture, modern game-ready quality',
    imageSize: { width: 1024, height: 1024 },
    placeholder: prompts.assetTypes.item?.default?.building?.placeholder,
  },
} as const;

/**
 * Material tier configurations from Hyperscape
 * Loaded from material-presets.json and modernized
 */
export const HYPERSCAPE_MATERIAL_TIERS = prompts.materialPresets.reduce((acc: any, preset: any) => {
  acc[preset.id] = {
    id: preset.id,
    name: preset.name,
    displayName: preset.displayName,
    category: preset.category,
    tier: preset.tier,
    color: preset.color,
    description: preset.description,
    // Remove "RuneScape 2007 style" and make it modern
    stylePrompt: preset.stylePrompt.replace(/,?\s*RuneScape 2007 style/gi, ', modern game-ready quality, PBR materials'),
    keywords: [preset.displayName.toLowerCase(), preset.category, `tier-${preset.tier}`, 'modern', 'game-ready'],
  };
  return acc;
}, {});

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
 * Now defaults to modern, high-quality asset style
 */
export function enhancePromptForHyperscape(
  userPrompt: string,
  assetType: keyof typeof HYPERSCAPE_ASSET_TYPES,
  style: keyof typeof HYPERSCAPE_STYLES = 'stylized', // Changed default to 'stylized' (modern)
  materialTier?: string
): string {
  const assetConfig = HYPERSCAPE_ASSET_TYPES[assetType];
  const styleConfig = HYPERSCAPE_STYLES[style];
  const materialConfig = materialTier ? HYPERSCAPE_MATERIAL_TIERS[materialTier] : null;

  let enhancedPrompt = userPrompt;

  // Add style keywords
  enhancedPrompt += `, ${styleConfig.keywords.join(', ')}`;

  // Add material tier with modern quality if specified
  if (materialConfig) {
    enhancedPrompt += `, ${materialConfig.stylePrompt}`;
  }

  // Add critical requirements for armor (if present)
  if ('critical' in assetConfig && assetConfig.critical) {
    enhancedPrompt += `, ${(assetConfig as any).critical}`;
  }

  // Add asset type suffix
  enhancedPrompt += `, ${assetConfig.defaultPromptSuffix}`;

  // Add modern quality indicators (unless using legacy style)
  if (styleConfig.isModern) {
    enhancedPrompt += ', high polygon count, detailed geometry, modern game quality';
  }

  return enhancedPrompt;
}

/**
 * Get style configuration by ID
 */
export function getStyle(styleId: string) {
  const style = Object.values(HYPERSCAPE_STYLES).find((s) => s.id === styleId);
  return style || HYPERSCAPE_STYLES.stylized; // Default to stylized if not found
}

/**
 * Get material configuration by ID
 */
export function getMaterial(materialId: string) {
  return HYPERSCAPE_MATERIAL_TIERS[materialId];
}

/**
 * Get all available styles
 */
export function getAllStyles() {
  return Object.values(HYPERSCAPE_STYLES);
}

/**
 * Get all available materials
 */
export function getAllMaterials() {
  return Object.values(HYPERSCAPE_MATERIAL_TIERS);
}

/**
 * Get modern (non-legacy) styles only
 */
export function getModernStyles() {
  return Object.values(HYPERSCAPE_STYLES).filter((s) => s.isModern);
}

/**
 * Get materials by category
 */
export function getMaterialsByCategory(category: string) {
  return Object.values(HYPERSCAPE_MATERIAL_TIERS).filter((m: any) => m.category === category);
}

export {
  generateText,
  streamText,
  embedMany,
};
