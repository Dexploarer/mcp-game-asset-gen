# AI Gateway Integration for Hyperscape Asset Generation

This document describes the integration of Vercel AI Gateway into the MCP Game Asset Generation server, specifically optimized for generating assets for the [Hyperscape MMORPG](https://github.com/HyperscapeAI/hyperscape).

## Table of Contents

- [Overview](#overview)
- [Why AI Gateway?](#why-ai-gateway)
- [Setup](#setup)
- [Architecture](#architecture)
- [Available Tools](#available-tools)
- [Hyperscape-Specific Features](#hyperscape-specific-features)
- [Model Discovery](#model-discovery)
- [Migration Guide](#migration-guide)
- [Examples](#examples)

## Overview

The AI Gateway integration provides a unified interface for accessing multiple AI providers (OpenAI, Google Gemini, etc.) through Vercel's AI Gateway. This integration is specifically tailored for generating game assets for Hyperscape, a RuneScape-style MMORPG.

### Key Features

- **Unified API**: Single interface for multiple AI providers
- **Model Discovery**: Dynamically discover available models
- **Cost Optimization**: Automatic routing and model selection
- **Hyperscape Optimizations**: Pre-configured prompts and styles for RuneScape-style assets
- **Material Tiers**: Built-in support for bronze, steel, and mithril equipment variants
- **Streaming Support**: Real-time progress updates during generation

## Why AI Gateway?

### Benefits

1. **Provider Flexibility**: Switch between OpenAI, Google Gemini, and other providers without code changes
2. **Cost Control**: Route requests to the most cost-effective model for each task
3. **High Availability**: Automatic fallbacks if a provider is down
4. **Unified Interface**: One API for all providers
5. **Model Discovery**: Dynamically discover new models as they become available
6. **Game-Specific Optimization**: Tailored for Hyperscape's low-poly RuneScape aesthetic

### Comparison with Direct API Access

| Feature | Direct API | AI Gateway |
|---------|-----------|------------|
| Provider switching | Requires code changes | Configuration only |
| Model discovery | Manual | Automatic |
| Fallback support | Manual implementation | Built-in |
| Cost optimization | Manual | Automatic routing |
| Hyperscape presets | Not available | Built-in |

## Setup

### 1. Install Dependencies

The AI Gateway dependencies are already included in `package.json`:

```json
{
  "dependencies": {
    "ai": "^5.0.98",
    "@ai-sdk/gateway": "^2.0.13"
  }
}
```

Install them with:

```bash
npm install
# or
pnpm install
```

### 2. Get Your AI Gateway API Key

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to the **AI Gateway** tab
3. Click **API keys** in the left sidebar
4. Click **Create key**
5. Copy your API key

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and add your API key:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# ===== AI GATEWAY (RECOMMENDED) =====
AI_GATEWAY_API_KEY=your_ai_gateway_api_key_here

# Optional: Custom base URL
# AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1/ai

# ===== LEGACY DIRECT PROVIDER ACCESS =====
# These are optional if you're using AI Gateway
OPENAI_API_KEY=your_openai_api_key_here  # Optional for backwards compatibility
GEMINI_API_KEY=your_gemini_api_key_here   # Optional for backwards compatibility
FAL_AI_API_KEY=your_fal_ai_api_key_here   # Required for 3D generation
```

### 4. Build and Run

```bash
npm run build
npm start
```

## Architecture

### Module Structure

```
src/
├── config/
│   └── gateway.ts              # AI Gateway configuration and Hyperscape presets
├── providers/
│   ├── gatewayImageProviders.ts # Gateway-based image generation
│   └── imageProviders.ts        # Legacy direct API providers
├── tools/
│   ├── hypescapeTools.ts       # Hyperscape-specific MCP tools
│   └── modelDiscovery.ts       # Model discovery and selection tools
└── index.ts                    # Main MCP server with tool registration
```

### Configuration (config/gateway.ts)

The gateway configuration module provides:

- **Gateway Provider Instance**: Configured with API key and base URL
- **Hyperscape Models**: Pre-configured model selections for different tasks
- **Art Styles**: RuneScape low-poly, Marvel, Skyrim, and stylized options
- **Asset Types**: Character, weapon, armor, tool, resource, building
- **Material Tiers**: Bronze, steel, mithril with color and keyword presets
- **Prompt Enhancement**: Automatic prompt enhancement based on asset type

### Key Functions

```typescript
// Get available models from AI Gateway
const models = await getAvailableModels();

// Filter by type (language or embedding)
const imageModels = await getModelsByType('language');

// Enhance prompt for Hyperscape
const enhanced = enhancePromptForHyperscape(
  'longsword',
  'weapon',
  'runescapeLowPoly',
  'mithril'
);
// Result: "longsword, low-poly, blocky, flat-shaded, game-ready,
//          simple textures, clean geometry, mithril, purple-blue,
//          magical metal, enchanted, glowing, game weapon asset,
//          centered, with clear grip point, low-poly"
```

## Available Tools

### AI Gateway Tools

#### `gateway_generate_image`

Generate images using AI Gateway with unified API for multiple providers.

**Parameters:**
- `prompt` (required): Description of the image
- `outputPath` (required): Save path
- `model` (optional): Model ID (e.g., "google/gemini-3-pro-image", "openai/gpt-image-1")
- `assetType` (optional): 'character' | 'weapon' | 'armor' | 'tool' | 'resource' | 'building'
- `style` (optional): 'runescapeLowPoly' | 'marvelStyle' | 'skyrimStyle' | 'stylized'
- `materialTier` (optional): 'bronze' | 'steel' | 'mithril'

**Example:**
```json
{
  "prompt": "longsword",
  "outputPath": "/tmp/sword.png",
  "model": "google/gemini-3-pro-image",
  "assetType": "weapon",
  "style": "runescapeLowPoly",
  "materialTier": "mithril"
}
```

#### `gateway_generate_image_streaming`

Same as `gateway_generate_image` but with real-time streaming progress updates.

### Hyperscape-Specific Tools

All Hyperscape tools automatically apply the RuneScape low-poly style and appropriate asset configurations.

#### `hyperscape_generate_character`

Generate character concept art for Hyperscape.

**Parameters:**
- `description` (required): Character description (e.g., "goblin warrior", "elven archer")
- `outputPath` (required): Save path
- `materialTier` (optional): Equipment material tier
- `model` (optional): AI model to use

**Example:**
```json
{
  "description": "human knight in full armor",
  "outputPath": "/tmp/knight.png",
  "materialTier": "steel"
}
```

#### `hyperscape_generate_weapon`

Generate weapon assets with clear grip points for rigging.

**Parameters:**
- `description` (required): Weapon description
- `outputPath` (required): Save path
- `materialTier` (optional): 'bronze' | 'steel' | 'mithril'
- `model` (optional): AI model to use

#### `hyperscape_generate_armor`

Generate armor pieces fitted to humanoid characters.

**Parameters:**
- `description` (required): Armor description
- `outputPath` (required): Save path
- `materialTier` (optional): 'bronze' | 'steel' | 'mithril'
- `model` (optional): AI model to use

#### `hyperscape_generate_equipment_set`

Generate all three material tier variants of an equipment piece.

**Parameters:**
- `description` (required): Base equipment description
- `outputPath` (required): Base path (will append _bronze, _steel, _mithril)
- `assetType` (required): 'weapon' | 'armor'
- `model` (optional): AI model to use

**Example:**
```json
{
  "description": "longsword",
  "outputPath": "/tmp/longsword.png",
  "assetType": "weapon"
}
```

**Output:**
- `/tmp/longsword_bronze.png` - Bronze tier
- `/tmp/longsword_steel.png` - Steel tier
- `/tmp/longsword_mithril.png` - Mithril tier

#### `hyperscape_generate_building`

Generate building/structure concept art with clear entry points.

**Parameters:**
- `description` (required): Building description
- `outputPath` (required): Save path
- `model` (optional): AI model to use

#### `hyperscape_generate_npc`

Generate friendly/neutral NPCs for towns and services.

**Parameters:**
- `description` (required): NPC description
- `outputPath` (required): Save path
- `role` (optional): NPC role (e.g., "banker", "shopkeeper")
- `model` (optional): AI model to use

#### `hyperscape_generate_enemy`

Generate hostile NPCs with combat-ready appearance.

**Parameters:**
- `description` (required): Enemy description
- `outputPath` (required): Save path
- `level` (optional): Enemy level (1-100, affects equipment quality)
- `region` (optional): Game region
- `model` (optional): AI model to use

#### `hyperscape_generate_resource`

Generate small icon-style resource items.

**Parameters:**
- `description` (required): Resource description
- `outputPath` (required): Save path
- `model` (optional): AI model to use

#### `hyperscape_generate_tool`

Generate resource gathering tools.

**Parameters:**
- `description` (required): Tool description
- `outputPath` (required): Save path
- `materialTier` (optional): 'bronze' | 'steel' | 'mithril'
- `model` (optional): AI model to use

#### `hyperscape_generate_zone_concept`

Generate zone/region environment concept art.

**Parameters:**
- `description` (required): Zone description
- `outputPath` (required): Save path
- `difficulty` (optional): 'starter' | 'low' | 'medium' | 'high' | 'endgame'
- `model` (optional): AI model to use

### Model Discovery Tools

#### `gateway_list_models`

List all available models from AI Gateway.

**Parameters:**
- `filterType` (optional): 'all' | 'language' | 'embedding'
- `includePrice` (optional): Include pricing info (default: true)

**Response:**
```json
{
  "totalModels": 15,
  "filterType": "all",
  "models": [
    {
      "id": "google/gemini-3-pro-image",
      "name": "Gemini 3 Pro Image",
      "type": "language",
      "description": "High-quality image generation",
      "pricing": {
        "input": "$0.000003/token",
        "output": "$0.000015/token"
      }
    },
    ...
  ]
}
```

#### `gateway_get_model_info`

Get detailed information about a specific model.

**Parameters:**
- `modelId` (required): Model ID (e.g., "google/gemini-3-pro-image")

#### `gateway_list_image_models`

List only image generation models.

**Parameters:** None

#### `gateway_recommend_model`

Get model recommendations based on use case.

**Parameters:**
- `useCase` (required): Use case description
- `priority` (optional): 'quality' | 'speed' | 'cost'

**Example:**
```json
{
  "useCase": "character generation",
  "priority": "quality"
}
```

## Hyperscape-Specific Features

### Art Styles

The integration includes pre-configured art styles tailored for Hyperscape:

1. **runescapeLowPoly** (default)
   - Low-poly geometry
   - Blocky shapes
   - Flat-shaded surfaces
   - Simple textures
   - Clean geometry

2. **marvelStyle**
   - Comic book aesthetic
   - Bold colors
   - Stylized features
   - Heroic proportions

3. **skyrimStyle**
   - Medieval fantasy
   - Realistic textures
   - Detailed materials

4. **stylized**
   - Cartoon aesthetic
   - Exaggerated proportions
   - Vibrant colors

### Material Tiers

Hyperscape uses a three-tier equipment system:

| Tier | Color | Description | Keywords |
|------|-------|-------------|----------|
| Bronze | #CD7F32 | Starter equipment | bronze, copper-brown, weathered metal, basic |
| Steel | #B0C4DE | Intermediate equipment | steel, silver-gray, polished metal, refined |
| Mithril | #9966CC | Advanced equipment | mithril, purple-blue, magical metal, enchanted, glowing |

### Asset Types

Each asset type has optimized configurations:

| Type | Default Size | Special Requirements |
|------|-------------|---------------------|
| Character | 1024x1024 | T-pose, 1.7m height |
| Weapon | 1024x1024 | Clear grip point |
| Armor | 1024x1024 | Fitted to humanoid |
| Tool | 1024x1024 | Centered |
| Resource | 512x512 | Icon-style |
| Building | 1024x1024 | Clear entry points |

### Automatic Prompt Enhancement

When using Hyperscape tools, prompts are automatically enhanced:

**Input:**
```
"longsword"
```

**Enhanced (for weapon, runescapeLowPoly, mithril):**
```
"longsword, low-poly, blocky, flat-shaded, game-ready, simple textures,
clean geometry, mithril, purple-blue, magical metal, enchanted, glowing,
game weapon asset, centered, with clear grip point, low-poly"
```

## Migration Guide

### From Direct API to AI Gateway

If you're currently using direct API tools, here's how to migrate:

#### Before (Direct OpenAI):
```json
{
  "tool": "openai_generate_image",
  "prompt": "medieval sword",
  "outputPath": "/tmp/sword.png",
  "size": "1024x1024"
}
```

#### After (AI Gateway):
```json
{
  "tool": "gateway_generate_image",
  "prompt": "medieval sword",
  "outputPath": "/tmp/sword.png",
  "model": "openai/gpt-image-1",
  "assetType": "weapon",
  "style": "runescapeLowPoly"
}
```

#### Better (Hyperscape-specific):
```json
{
  "tool": "hyperscape_generate_weapon",
  "description": "medieval sword",
  "outputPath": "/tmp/sword.png",
  "materialTier": "steel"
}
```

### Benefits of Migration

1. **No API key juggling**: One key for all providers
2. **Automatic optimization**: Prompt enhancement and style application
3. **Cost savings**: Intelligent model routing
4. **Future-proof**: New models automatically available

## Examples

### Example 1: Generate a Complete Equipment Set

Create bronze, steel, and mithril versions of a helmet:

```javascript
const result = await mcpClient.callTool({
  name: 'hyperscape_generate_equipment_set',
  arguments: {
    description: 'full helm with visor',
    outputPath: '/game/assets/helms/full_helm.png',
    assetType: 'armor'
  }
});
```

**Output files:**
- `/game/assets/helms/full_helm_bronze.png`
- `/game/assets/helms/full_helm_steel.png`
- `/game/assets/helms/full_helm_mithril.png`

### Example 2: Generate Enemy for Specific Region

Create a high-level enemy for the Blasted Lands:

```javascript
const result = await mcpClient.callTool({
  name: 'hyperscape_generate_enemy',
  arguments: {
    description: 'corrupted dark knight',
    outputPath: '/game/assets/enemies/dark_knight.png',
    level: 85,
    region: 'Blasted Lands'
  }
});
```

### Example 3: Discover Best Model for Character Generation

Find the best model for your use case:

```javascript
const recommendation = await mcpClient.callTool({
  name: 'gateway_recommend_model',
  arguments: {
    useCase: 'character generation',
    priority: 'quality'
  }
});

// Use the recommended model
const character = await mcpClient.callTool({
  name: 'hyperscape_generate_character',
  arguments: {
    description: 'elven ranger',
    outputPath: '/game/assets/characters/elf_ranger.png',
    model: recommendation.recommendations[0].model
  }
});
```

### Example 4: Generate Zone Concept

Create concept art for a starter zone:

```javascript
const result = await mcpClient.callTool({
  name: 'hyperscape_generate_zone_concept',
  arguments: {
    description: 'peaceful forest valley with misty atmosphere and small village',
    outputPath: '/game/concepts/mistwood_valley.png',
    difficulty: 'starter'
  }
});
```

### Example 5: Streaming Image Generation

Generate with real-time progress:

```javascript
const result = await mcpClient.callTool({
  name: 'gateway_generate_image_streaming',
  arguments: {
    prompt: 'bronze hatchet',
    outputPath: '/game/assets/tools/hatchet.png',
    assetType: 'tool',
    materialTier: 'bronze'
  }
});
// Progress updates will be shown in stderr during generation
```

## Best Practices

### 1. Use Hyperscape-Specific Tools

For Hyperscape assets, always prefer `hyperscape_*` tools over generic `gateway_generate_image`:

✅ **Good:**
```javascript
hyperscape_generate_weapon({
  description: 'bronze sword',
  materialTier: 'bronze'
})
```

❌ **Less optimal:**
```javascript
gateway_generate_image({
  prompt: 'bronze sword low poly runescape style',
  assetType: 'weapon'
})
```

### 2. Use Equipment Sets for Consistency

When creating tiered equipment, use `hyperscape_generate_equipment_set` to ensure visual consistency:

```javascript
hyperscape_generate_equipment_set({
  description: 'longsword',
  outputPath: '/assets/longsword.png',
  assetType: 'weapon'
})
```

### 3. Leverage Model Discovery

Don't hardcode model IDs. Use discovery to find the best model:

```javascript
// List available image models
const models = await gateway_list_image_models();

// Get recommendation
const rec = await gateway_recommend_model({
  useCase: 'high-quality character portraits',
  priority: 'quality'
});
```

### 4. Specify Difficulty for Zones

When generating enemies or zones, always specify the difficulty/region for appropriate styling:

```javascript
hyperscape_generate_enemy({
  description: 'goblin warrior',
  level: 15,  // Low-level enemy
  region: 'Goblin Wastes'
})
```

### 5. Use Streaming for Long Operations

For better user experience, use streaming when generating complex assets:

```javascript
gateway_generate_image_streaming({
  prompt: 'detailed medieval castle',
  outputPath: '/assets/castle.png'
})
```

## Troubleshooting

### "AI_GATEWAY_API_KEY not found"

Make sure you've:
1. Created a `.env` file from `.env.example`
2. Added your API key to the `.env` file
3. Rebuilt the project: `npm run build`

### "Model not found"

Use `gateway_list_models` to see available models. The model ID might have changed or the model might not be available in your region.

### "Gateway image generation failed"

Check:
1. Your AI Gateway API key is valid
2. You have credits/quota remaining
3. The model ID is correct (use `gateway_list_models`)
4. Your network connection is stable

### Poor Quality Results

For Hyperscape assets:
1. Always use `hyperscape_*` tools instead of generic tools
2. Specify the correct `assetType`
3. Use appropriate `materialTier` for equipment
4. For characters, ensure the description includes pose requirements (e.g., "T-pose")

## Additional Resources

- [Vercel AI Gateway Documentation](https://vercel.com/docs/ai-gateway)
- [Hyperscape GitHub Repository](https://github.com/HyperscapeAI/hyperscape)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

## Support

For issues specific to:
- **AI Gateway**: Visit Vercel support or AI Gateway documentation
- **Hyperscape**: Open an issue on the Hyperscape repository
- **This MCP Server**: Open an issue on this repository

## License

This integration maintains the same license as the parent project.
