/**
 * Hyperscape-specific MCP Tools
 *
 * This module provides MCP tool definitions specifically tailored
 * for generating assets for the Hyperscape MMORPG game.
 */

import {
  gatewayGenerateCharacter,
  gatewayGenerateWeapon,
  gatewayGenerateArmor,
  gatewayGenerateBuilding,
  gatewayGenerateEquipmentSet,
  gatewayGenerateImage,
  gatewayGenerateImageStreaming,
} from '../providers/gatewayImageProviders.js';
import { HYPERSCAPE_MODELS } from '../config/gateway.js';

/**
 * Tool definitions for Hyperscape asset generation
 */
export const HYPERSCAPE_TOOLS = [
  {
    name: 'hyperscape_generate_character',
    description: `Generate a character concept art for Hyperscape MMORPG.
Creates low-poly RuneScape-style humanoid characters in T-pose suitable for 3D modeling.
Characters will be approximately 1.7m height, game-ready with simple textures.
Supports bronze, steel, and mithril material tiers for equipment.`,
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Description of the character (e.g., "goblin warrior", "elven archer", "human knight")',
        },
        outputPath: {
          type: 'string',
          description: 'Path where the generated image will be saved',
        },
        materialTier: {
          type: 'string',
          enum: ['bronze', 'steel', 'mithril'],
          description: 'Material tier for equipment (optional)',
        },
        model: {
          type: 'string',
          description: `AI model to use (default: ${HYPERSCAPE_MODELS.imageGeneration.geminiProImage})`,
        },
      },
      required: ['description', 'outputPath'],
    },
  },

  {
    name: 'hyperscape_generate_weapon',
    description: `Generate a weapon asset for Hyperscape MMORPG.
Creates game-ready weapon concepts with clear grip points for rigging.
Supports bronze, steel, and mithril tiers. Examples: swords, bows, shields, arrows.`,
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Description of the weapon (e.g., "bronze sword", "steel bow", "mithril shield")',
        },
        outputPath: {
          type: 'string',
          description: 'Path where the generated image will be saved',
        },
        materialTier: {
          type: 'string',
          enum: ['bronze', 'steel', 'mithril'],
          description: 'Material tier (bronze for starter, steel for mid-tier, mithril for advanced)',
        },
        model: {
          type: 'string',
          description: `AI model to use (default: ${HYPERSCAPE_MODELS.imageGeneration.geminiProImage})`,
        },
      },
      required: ['description', 'outputPath'],
    },
  },

  {
    name: 'hyperscape_generate_armor',
    description: `Generate an armor piece for Hyperscape MMORPG.
Creates game-ready armor fitted to humanoid characters.
Supports bronze, steel, and mithril tiers. Parts: helmet, chest, legs, gloves.`,
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Description of the armor (e.g., "leather helmet", "steel chestplate", "mithril leggings")',
        },
        outputPath: {
          type: 'string',
          description: 'Path where the generated image will be saved',
        },
        materialTier: {
          type: 'string',
          enum: ['bronze', 'steel', 'mithril'],
          description: 'Material tier',
        },
        model: {
          type: 'string',
          description: `AI model to use (default: ${HYPERSCAPE_MODELS.imageGeneration.geminiProImage})`,
        },
      },
      required: ['description', 'outputPath'],
    },
  },

  {
    name: 'hyperscape_generate_building',
    description: `Generate a building or structure for Hyperscape MMORPG.
Creates game-ready buildings with clear entry points and functional layouts.
Examples: banks, general stores, temples, towns, combat arenas.`,
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Description of the building (e.g., "medieval bank", "general store", "elven temple")',
        },
        outputPath: {
          type: 'string',
          description: 'Path where the generated image will be saved',
        },
        model: {
          type: 'string',
          description: `AI model to use (default: ${HYPERSCAPE_MODELS.imageGeneration.geminiProImage})`,
        },
      },
      required: ['description', 'outputPath'],
    },
  },

  {
    name: 'hyperscape_generate_equipment_set',
    description: `Generate a complete equipment set with all three material tiers (bronze, steel, mithril).
Creates three variations of the same weapon or armor piece with different materials.
Perfect for creating progression tiers in the game.`,
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Base description of the equipment (e.g., "longsword", "full helm")',
        },
        outputPath: {
          type: 'string',
          description: 'Base path for output files (will append _bronze, _steel, _mithril)',
        },
        assetType: {
          type: 'string',
          enum: ['weapon', 'armor'],
          description: 'Type of equipment to generate',
        },
        model: {
          type: 'string',
          description: `AI model to use (default: ${HYPERSCAPE_MODELS.imageGeneration.geminiProImage})`,
        },
      },
      required: ['description', 'outputPath', 'assetType'],
    },
  },

  {
    name: 'hyperscape_generate_npc',
    description: `Generate an NPC (Non-Player Character) for Hyperscape MMORPG.
Creates friendly or neutral characters for towns, quests, and services.
Examples: shopkeepers, quest givers, bankers, guards.`,
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Description of the NPC (e.g., "friendly shopkeeper", "town guard", "wise wizard")',
        },
        outputPath: {
          type: 'string',
          description: 'Path where the generated image will be saved',
        },
        role: {
          type: 'string',
          description: 'NPC role in the game (e.g., "banker", "general store", "quest giver")',
        },
        model: {
          type: 'string',
          description: `AI model to use (default: ${HYPERSCAPE_MODELS.imageGeneration.geminiProImage})`,
        },
      },
      required: ['description', 'outputPath'],
    },
  },

  {
    name: 'hyperscape_generate_resource',
    description: `Generate a resource item for Hyperscape MMORPG.
Creates small icon-style assets for collectible resources.
Examples: logs, fish, ore, coins, raw materials.`,
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Description of the resource (e.g., "oak logs", "raw salmon", "bronze ore")',
        },
        outputPath: {
          type: 'string',
          description: 'Path where the generated image will be saved',
        },
        model: {
          type: 'string',
          description: `AI model to use (default: ${HYPERSCAPE_MODELS.imageGeneration.geminiProImage})`,
        },
      },
      required: ['description', 'outputPath'],
    },
  },

  {
    name: 'hyperscape_generate_tool',
    description: `Generate a tool asset for Hyperscape MMORPG.
Creates tools for resource gathering and skill training.
Examples: hatchet (woodcutting), fishing rod (fishing), tinderbox (firemaking).`,
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Description of the tool (e.g., "bronze hatchet", "steel fishing rod")',
        },
        outputPath: {
          type: 'string',
          description: 'Path where the generated image will be saved',
        },
        materialTier: {
          type: 'string',
          enum: ['bronze', 'steel', 'mithril'],
          description: 'Material tier (affects tool effectiveness)',
        },
        model: {
          type: 'string',
          description: `AI model to use (default: ${HYPERSCAPE_MODELS.imageGeneration.geminiProImage})`,
        },
      },
      required: ['description', 'outputPath'],
    },
  },

  {
    name: 'hyperscape_generate_enemy',
    description: `Generate an enemy character for Hyperscape MMORPG.
Creates hostile NPCs with combat-ready appearance.
Examples: goblins, bandits, dark wizards, undead warriors.`,
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Description of the enemy (e.g., "goblin warrior", "dark wizard", "skeleton knight")',
        },
        outputPath: {
          type: 'string',
          description: 'Path where the generated image will be saved',
        },
        level: {
          type: 'number',
          description: 'Enemy level (affects equipment quality, 1-100)',
        },
        region: {
          type: 'string',
          description: 'Game region (e.g., "Mistwood Valley", "Goblin Wastes", "Darkwood Forest", "Blasted Lands")',
        },
        model: {
          type: 'string',
          description: `AI model to use (default: ${HYPERSCAPE_MODELS.imageGeneration.geminiProImage})`,
        },
      },
      required: ['description', 'outputPath'],
    },
  },

  {
    name: 'hyperscape_generate_zone_concept',
    description: `Generate a zone/region concept art for Hyperscape MMORPG.
Creates environment concepts for the 9 regions of Hyperia.
Regions: Mistwood Valley (starter), Goblin Wastes, Darkwood Forest, Blasted Lands (endgame).`,
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Description of the zone (e.g., "misty forest valley", "barren wasteland")',
        },
        outputPath: {
          type: 'string',
          description: 'Path where the generated image will be saved',
        },
        difficulty: {
          type: 'string',
          enum: ['starter', 'low', 'medium', 'high', 'endgame'],
          description: 'Zone difficulty level',
        },
        model: {
          type: 'string',
          description: `AI model to use (default: ${HYPERSCAPE_MODELS.imageGeneration.geminiProImage})`,
        },
      },
      required: ['description', 'outputPath'],
    },
  },
];

/**
 * Tool handlers for Hyperscape-specific tools
 */
export const HYPERSCAPE_TOOL_HANDLERS: Record<string, (args: any) => Promise<string>> = {
  hyperscape_generate_character: async (args) => {
    return gatewayGenerateCharacter(
      args.description,
      args.outputPath,
      args.materialTier
    );
  },

  hyperscape_generate_weapon: async (args) => {
    return gatewayGenerateWeapon(
      args.description,
      args.outputPath,
      args.materialTier
    );
  },

  hyperscape_generate_armor: async (args) => {
    return gatewayGenerateArmor(
      args.description,
      args.outputPath,
      args.materialTier
    );
  },

  hyperscape_generate_building: async (args) => {
    return gatewayGenerateBuilding(
      args.description,
      args.outputPath
    );
  },

  hyperscape_generate_equipment_set: async (args) => {
    return gatewayGenerateEquipmentSet(
      args.description,
      args.outputPath,
      args.assetType,
      args.model
    );
  },

  hyperscape_generate_npc: async (args) => {
    // NPCs are characters with additional context
    const enhancedDescription = `${args.description}, friendly NPC${args.role ? ` working as ${args.role}` : ''}`;
    return gatewayGenerateCharacter(
      enhancedDescription,
      args.outputPath
    );
  },

  hyperscape_generate_resource: async (args) => {
    return gatewayGenerateImage({
      prompt: args.description,
      outputPath: args.outputPath,
      assetType: 'resource',
      style: 'runescapeLowPoly',
      model: args.model,
    });
  },

  hyperscape_generate_tool: async (args) => {
    return gatewayGenerateImage({
      prompt: args.description,
      outputPath: args.outputPath,
      assetType: 'tool',
      style: 'runescapeLowPoly',
      materialTier: args.materialTier,
      model: args.model,
    });
  },

  hyperscape_generate_enemy: async (args) => {
    let enhancedDescription = args.description;

    if (args.level) {
      const equipmentQuality = args.level < 20 ? 'basic' : args.level < 50 ? 'intermediate' : 'advanced';
      enhancedDescription += `, ${equipmentQuality} equipment`;
    }

    if (args.region) {
      enhancedDescription += `, from ${args.region} region`;
    }

    return gatewayGenerateCharacter(
      enhancedDescription,
      args.outputPath
    );
  },

  hyperscape_generate_zone_concept: async (args) => {
    const difficultyDescriptors = {
      starter: 'peaceful, welcoming, safe',
      low: 'slightly dangerous, adventurous',
      medium: 'challenging, mysterious',
      high: 'dangerous, foreboding',
      endgame: 'deadly, apocalyptic, corrupted',
    };

    const descriptor = args.difficulty ? difficultyDescriptors[args.difficulty as keyof typeof difficultyDescriptors] : '';
    const enhancedDescription = `${args.description}, ${descriptor}, low-poly game environment, RuneScape style`;

    return gatewayGenerateImage({
      prompt: enhancedDescription,
      outputPath: args.outputPath,
      model: args.model,
    });
  },
};
