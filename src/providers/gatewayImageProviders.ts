/**
 * AI Gateway Image Providers
 *
 * This module provides image generation using Vercel AI Gateway
 * instead of direct API calls to individual providers.
 */

import { generateText, streamText } from 'ai';
import { gateway, HYPERSCAPE_MODELS, enhancePromptForHyperscape } from '../config/gateway.js';
import path from 'path';
import fs from 'fs';
import { saveBase64Image } from '../utils/imageUtils.js';

/**
 * Gateway-based image generation options
 */
export interface GatewayImageOptions {
  prompt: string;
  outputPath: string;
  model?: string;
  inputImagePath?: string;
  size?: { width: number; height: number };
  n?: number;
  streaming?: boolean;
  assetType?: 'character' | 'weapon' | 'armor' | 'tool' | 'resource' | 'building';
  style?: 'runescapeLowPoly' | 'marvelStyle' | 'skyrimStyle' | 'stylized';
  materialTier?: 'bronze' | 'steel' | 'mithril';
}

/**
 * Generate image using AI Gateway (non-streaming)
 *
 * Supports both OpenAI and Google Gemini models through unified interface
 */
export async function gatewayGenerateImage(options: GatewayImageOptions): Promise<string> {
  const {
    prompt,
    outputPath,
    model = HYPERSCAPE_MODELS.imageGeneration.geminiProImage,
    n = 1,
    assetType,
    style,
    materialTier,
  } = options;

  // Enhance prompt if Hyperscape asset type is specified
  let enhancedPrompt = prompt;
  if (assetType) {
    enhancedPrompt = enhancePromptForHyperscape(prompt, assetType, style, materialTier);
  }

  console.error(`[Gateway] Generating image with model: ${model}`);
  console.error(`[Gateway] Enhanced prompt: ${enhancedPrompt}`);

  try {
    const result = await generateText({
      model: gateway(model),
      prompt: enhancedPrompt,
    });

    // Save generated images
    const savedPaths: string[] = [];
    const imageFiles = result.files?.filter((f) => f.mediaType?.startsWith('image/')) || [];

    if (imageFiles.length === 0) {
      throw new Error('No images were generated');
    }

    // Create output directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      let finalOutputPath = outputPath;

      // If multiple images, add index to filename
      if (imageFiles.length > 1) {
        const ext = path.extname(outputPath) || '.png';
        const baseName = path.basename(outputPath, ext);
        const outputDir = path.dirname(outputPath);
        finalOutputPath = path.join(outputDir, `${baseName}_${i + 1}${ext}`);
      }

      // Save the image
      if (file.base64) {
        saveBase64Image(file.base64, finalOutputPath);
        savedPaths.push(finalOutputPath);
      } else if (file.uint8Array) {
        fs.writeFileSync(finalOutputPath, file.uint8Array);
        savedPaths.push(finalOutputPath);
      }
    }

    return JSON.stringify({
      provider: 'AI Gateway',
      model: model,
      operation: 'generate',
      savedPaths: savedPaths,
      prompt_used: enhancedPrompt,
      original_prompt: prompt,
      text_response: result.text || null,
      usage: result.usage,
      providerMetadata: result.providerMetadata,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Gateway image generation failed: ${errorMessage}`);
  }
}

/**
 * Generate image using AI Gateway with streaming
 *
 * Allows real-time progress updates and partial results
 */
export async function gatewayGenerateImageStreaming(options: GatewayImageOptions): Promise<string> {
  const {
    prompt,
    outputPath,
    model = HYPERSCAPE_MODELS.imageGeneration.geminiProImage,
    assetType,
    style,
    materialTier,
  } = options;

  // Enhance prompt if Hyperscape asset type is specified
  let enhancedPrompt = prompt;
  if (assetType) {
    enhancedPrompt = enhancePromptForHyperscape(prompt, assetType, style, materialTier);
  }

  console.error(`[Gateway Streaming] Generating image with model: ${model}`);
  console.error(`[Gateway Streaming] Enhanced prompt: ${enhancedPrompt}`);

  try {
    const result = streamText({
      model: gateway(model),
      prompt: enhancedPrompt,
    });

    const savedPaths: string[] = [];
    let textContent = '';

    // Create output directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Process the stream
    for await (const delta of result.fullStream) {
      switch (delta.type) {
        case 'text-delta':
          // Accumulate text chunks
          textContent += delta.text;
          process.stderr.write(delta.text);
          break;

        case 'file':
          // Handle generated files (images)
          if (delta.file.mediaType?.startsWith('image/')) {
            const timestamp = Date.now();
            const ext = delta.file.mediaType.split('/')[1] || 'png';
            const baseName = path.basename(outputPath, path.extname(outputPath));
            const outputDir = path.dirname(outputPath);
            const finalPath = path.join(outputDir, `${baseName}_${timestamp}.${ext}`);

            if (delta.file.uint8Array) {
              fs.writeFileSync(finalPath, delta.file.uint8Array);
              savedPaths.push(finalPath);
              console.error(`\n[Gateway] Saved image to ${finalPath}`);
            } else if (delta.file.base64) {
              saveBase64Image(delta.file.base64, finalPath);
              savedPaths.push(finalPath);
              console.error(`\n[Gateway] Saved image to ${finalPath}`);
            }
          }
          break;
      }
    }

    console.error('\n');

    const usage = await result.usage;
    const finishReason = await result.finishReason;

    return JSON.stringify({
      provider: 'AI Gateway (Streaming)',
      model: model,
      operation: 'generate',
      savedPaths: savedPaths,
      prompt_used: enhancedPrompt,
      original_prompt: prompt,
      text_response: textContent || null,
      usage: usage,
      finishReason: finishReason,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Gateway streaming image generation failed: ${errorMessage}`);
  }
}

/**
 * Generate multiple image variations using AI Gateway
 *
 * Useful for creating asset variants (e.g., bronze, steel, mithril versions)
 */
export async function gatewayGenerateImageVariations(
  basePrompt: string,
  variations: Array<{ suffix: string; outputPath: string; materialTier?: 'bronze' | 'steel' | 'mithril' }>,
  options: Omit<GatewayImageOptions, 'prompt' | 'outputPath'> = {}
): Promise<string> {
  const results = [];

  for (const variation of variations) {
    const fullPrompt = `${basePrompt} ${variation.suffix}`;
    const result = await gatewayGenerateImage({
      ...options,
      prompt: fullPrompt,
      outputPath: variation.outputPath,
      materialTier: variation.materialTier,
    });

    results.push({
      variation: variation.suffix,
      result: JSON.parse(result),
    });
  }

  return JSON.stringify({
    provider: 'AI Gateway',
    operation: 'generate_variations',
    basePrompt: basePrompt,
    variations: results,
  });
}

/**
 * Generate Hyperscape character concept art
 */
export async function gatewayGenerateCharacter(
  characterDescription: string,
  outputPath: string,
  materialTier?: 'bronze' | 'steel' | 'mithril'
): Promise<string> {
  return gatewayGenerateImage({
    prompt: characterDescription,
    outputPath,
    assetType: 'character',
    style: 'runescapeLowPoly',
    materialTier,
  });
}

/**
 * Generate Hyperscape weapon asset
 */
export async function gatewayGenerateWeapon(
  weaponDescription: string,
  outputPath: string,
  materialTier?: 'bronze' | 'steel' | 'mithril'
): Promise<string> {
  return gatewayGenerateImage({
    prompt: weaponDescription,
    outputPath,
    assetType: 'weapon',
    style: 'runescapeLowPoly',
    materialTier,
  });
}

/**
 * Generate Hyperscape armor asset
 */
export async function gatewayGenerateArmor(
  armorDescription: string,
  outputPath: string,
  materialTier?: 'bronze' | 'steel' | 'mithril'
): Promise<string> {
  return gatewayGenerateImage({
    prompt: armorDescription,
    outputPath,
    assetType: 'armor',
    style: 'runescapeLowPoly',
    materialTier,
  });
}

/**
 * Generate Hyperscape building/structure
 */
export async function gatewayGenerateBuilding(
  buildingDescription: string,
  outputPath: string
): Promise<string> {
  return gatewayGenerateImage({
    prompt: buildingDescription,
    outputPath,
    assetType: 'building',
    style: 'runescapeLowPoly',
  });
}

/**
 * Generate complete equipment set with variants
 *
 * Creates bronze, steel, and mithril versions of an equipment piece
 */
export async function gatewayGenerateEquipmentSet(
  baseDescription: string,
  baseOutputPath: string,
  assetType: 'weapon' | 'armor',
  model?: string
): Promise<string> {
  const tiers: Array<'bronze' | 'steel' | 'mithril'> = ['bronze', 'steel', 'mithril'];
  const ext = path.extname(baseOutputPath) || '.png';
  const baseName = path.basename(baseOutputPath, ext);
  const dir = path.dirname(baseOutputPath);

  const variations = tiers.map((tier) => ({
    suffix: `(${tier} tier material)`,
    outputPath: path.join(dir, `${baseName}_${tier}${ext}`),
    materialTier: tier,
  }));

  return gatewayGenerateImageVariations(baseDescription, variations, {
    assetType,
    style: 'runescapeLowPoly',
    model,
  });
}
