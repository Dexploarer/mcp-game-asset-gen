# Modern Asset Style Guide

## Overview

The MCP Game Asset Generation server now defaults to **modern, high-quality game asset styles** instead of low-poly RuneScape aesthetics. This update brings Hyperscape asset generation in line with contemporary game development standards while maintaining backward compatibility with legacy low-poly styles.

## What Changed

### Default Style: Stylized Hand-Painted

The new default style is **"stylized"** - modern hand-painted game assets with:
- High polygon count
- Detailed geometry
- PBR (Physically-Based Rendering) materials
- Clean topology
- Vibrant colors
- Modern game-ready quality

### Available Styles (Priority Order)

1. **stylized** (NEW DEFAULT) - Modern hand-painted game assets
   - Keywords: `stylized`, `hand-painted`, `game-ready`, `modern`, `vibrant colors`, `clean topology`
   - Use for: Character-focused games, stylized MMOs, modern indie games

2. **realistic** - High-quality realistic rendering
   - Keywords: `realistic`, `PBR materials`, `high-detail`, `modern game`, `photorealistic`, `detailed textures`
   - Use for: AAA games, simulation games, realistic RPGs

3. **skyrimStyle** - Fantasy RPG quality
   - Keywords: `skyrim-style`, `fantasy RPG`, `medieval`, `detailed`, `game-ready`
   - Use for: Fantasy games, medieval settings, Elder Scrolls-like aesthetics

4. **marvelStyle** - Cinematic game quality
   - Keywords: `marvel-style`, `cinematic`, `high-quality`, `modern`, `heroic`, `detailed`
   - Use for: Superhero games, action games, cinematic experiences

5. **runescapeLowPoly** (LEGACY) - Low-poly RuneScape 2007
   - Keywords: `low-poly`, `blocky`, `flat-shaded`, `runescape2007`, `simple geometry`
   - Use for: Retro games, nostalgic projects, low-spec targets

6. **genericLowPoly** (LEGACY) - Generic low-poly style
   - Keywords: `low-poly`, `game-asset`, `simple`, `basic geometry`
   - Use for: Mobile games, performance-critical applications

## Material System

The material system has been updated to support **modern game-ready quality with PBR materials**:

### Available Materials

**Metal Tiers:**
- **bronze** - Tier 1: `bronze metal texture, copper brown color, slightly dull metallic finish, modern game-ready quality, PBR materials`
- **steel** - Tier 2: `steel metal texture, silver gray color, polished metallic finish, modern game-ready quality, PBR materials`
- **mithril** - Tier 3: `mithril metal texture, blue-gray color with magical shimmer, fantasy metallic finish, modern game-ready quality, PBR materials`

**Leather Tiers:**
- **leather** - Tier 1: Basic brown leather
- **hard-leather** - Tier 2: Reinforced leather
- **studded-leather** - Tier 3: Metal-studded leather

**Wood Tiers:**
- **wood** - Tier 1: Light pine wood
- **oak** - Tier 2: Strong oak wood
- **willow** - Tier 3: Flexible willow wood

**Special:**
- **dragon** - Tier 10: Legendary red dragon metal

All materials now include "modern game-ready quality, PBR materials" instead of "RuneScape 2007 style".

## Hyperscape Prompts Integration

The system now loads prompts directly from Hyperscape's `asset-forge` prompt files:

### Loaded Prompt Files
- `game-style-prompts.json` - Art style definitions
- `asset-type-prompts.json` - Asset type specifications
- `material-presets.json` - Material configurations
- `generation-prompts.json` - Core generation templates
- `gpt4-enhancement-prompts.json` - GPT-4 enhancement system

### Key Improvements

1. **T-Pose Requirements**: Characters automatically include proper T-pose prompts for rigging
2. **Armor Fitting**: Armor pieces include critical T-pose fitting instructions (shoulder openings at 90°)
3. **Material Consistency**: All materials follow Hyperscape's proven material presets
4. **Quality Standards**: Modern quality indicators automatically added to all assets

## Migration Guide

### Old Way (Low-Poly Default)
```javascript
{
  "tool": "hyperscape_generate_weapon",
  "description": "longsword",
  "outputPath": "/assets/sword.png"
}
// Would generate low-poly RuneScape-style asset
```

### New Way (Modern Default)
```javascript
{
  "tool": "hyperscape_generate_weapon",
  "description": "longsword",
  "outputPath": "/assets/sword.png"
}
// Now generates modern stylized hand-painted asset
```

### Explicit Legacy Style
```javascript
{
  "tool": "gateway_generate_image",
  "prompt": "longsword",
  "outputPath": "/assets/sword.png",
  "assetType": "weapon",
  "style": "runescapeLowPoly", // Explicitly request legacy style
  "materialTier": "bronze"
}
// Generates legacy low-poly style
```

## Prompt Enhancement Examples

### Character Generation

**Input:**
```
"human knight"
```

**Enhanced (Stylized, Steel):**
```
human knight, stylized, hand-painted, game-ready, modern, vibrant colors,
clean topology, steel metal texture, silver gray color, polished metallic
finish, modern game-ready quality, PBR materials, standing in T-pose with
arms stretched out horizontally, front view on neutral background, modern
game-ready quality, high polygon count, detailed geometry, modern game quality
```

### Weapon Generation

**Input:**
```
"longsword"
```

**Enhanced (Realistic, Mithril):**
```
longsword, realistic, PBR materials, high-detail, modern game, photorealistic,
detailed textures, mithril metal texture, blue-gray color with magical shimmer,
fantasy metallic finish, modern game-ready quality, PBR materials, full weapon
clearly displayed on neutral background, centered composition, modern game-ready
quality, high polygon count, detailed geometry, modern game quality
```

### Armor Generation

**Input:**
```
"steel chestplate"
```

**Enhanced (Skyrim Style, Steel):**
```
steel chestplate, skyrim-style, fantasy RPG, medieval, detailed, game-ready,
steel metal texture, silver gray color, polished metallic finish, modern
game-ready quality, PBR materials, CRITICAL: armor must be SHAPED FOR T-POSE
BODY - shoulder openings pointing straight sideways at 90 degrees, floating
armor piece shaped for T-pose body fitting, openings positioned at correct
angles for T-pose (horizontal for shoulders), hollow openings, no armor stand
or mannequin, modern game-ready quality, high polygon count, detailed geometry,
modern game quality
```

## Tool Usage

### Hyperscape-Specific Tools

All Hyperscape tools now default to modern stylized style:

```javascript
// Character with modern stylized style (default)
{
  "tool": "hyperscape_generate_character",
  "description": "elven archer",
  "outputPath": "/assets/elf_archer.png"
}

// Weapon with realistic style
{
  "tool": "gateway_generate_image",
  "prompt": "bronze sword",
  "outputPath": "/assets/sword.png",
  "assetType": "weapon",
  "style": "realistic",
  "materialTier": "bronze"
}

// Equipment set with Marvel cinematic style
{
  "tool": "hyperscape_generate_equipment_set",
  "description": "full helm",
  "outputPath": "/assets/helm.png",
  "assetType": "armor"
}
// Creates: helm_bronze.png, helm_steel.png, helm_mithril.png
// All in modern stylized style
```

### Gateway Tools

```javascript
// Modern stylized (default)
{
  "tool": "gateway_generate_image",
  "prompt": "medieval castle",
  "outputPath": "/assets/castle.png",
  "assetType": "building"
}

// Explicitly choose style
{
  "tool": "gateway_generate_image",
  "prompt": "medieval castle",
  "outputPath": "/assets/castle.png",
  "assetType": "building",
  "style": "realistic"
}
```

## Best Practices

### 1. Use Modern Styles for Production

Modern styles provide:
- Better visual quality
- More detailed textures
- Professional appearance
- Better lighting and shading
- Industry-standard PBR materials

### 2. Reserve Legacy Styles for Specific Needs

Use low-poly styles only when:
- Targeting low-spec hardware
- Creating retro/nostalgic experiences
- Performance is critical
- Matching existing low-poly assets

### 3. Leverage Material System

Use the expanded material system:
```javascript
// Metal equipment
{ materialTier: "bronze" }  // Starter
{ materialTier: "steel" }   // Mid-tier
{ materialTier: "mithril" } // Advanced
{ materialTier: "dragon" }  // Legendary

// Leather armor
{ materialTier: "leather" }
{ materialTier: "hard-leather" }
{ materialTier: "studded-leather" }

// Wood tools/weapons
{ materialTier: "wood" }
{ materialTier: "oak" }
{ materialTier: "willow" }
```

### 4. Test Different Styles

Try multiple styles for the same asset:
```javascript
// Generate same asset in different styles
const styles = ['stylized', 'realistic', 'skyrimStyle', 'marvelStyle'];

for (const style of styles) {
  await generateAsset({
    prompt: "warrior helmet",
    outputPath: `/assets/helmet_${style}.png`,
    assetType: "armor",
    style: style
  });
}
```

## Configuration

The system automatically loads Hyperscape prompts from `/prompts/` directory:
- `game-style-prompts.json`
- `asset-type-prompts.json`
- `material-presets.json`
- `generation-prompts.json`
- `gpt4-enhancement-prompts.json`

All prompts are processed to replace "RuneScape 2007 style" with "modern game-ready quality, PBR materials".

## Helper Functions

New helper functions available in `src/config/gateway.ts`:

```typescript
// Get style configuration
getStyle(styleId: string)

// Get material configuration
getMaterial(materialId: string)

// Get all available styles
getAllStyles()

// Get all available materials
getAllMaterials()

// Get only modern styles (excludes legacy)
getModernStyles()

// Get materials by category
getMaterialsByCategory(category: string) // 'metal', 'leather', 'wood', 'custom'
```

## Performance Considerations

Modern styles generate higher-quality assets which may:
- Take slightly longer to generate
- Produce larger file sizes
- Require more VRAM when loaded in-game
- Need more detailed 3D conversion settings

If performance is a concern, consider:
1. Using compressed texture formats
2. Generating LODs (Level of Detail) versions
3. Optimizing poly count in 3D conversion
4. Using legacy styles for distant/background objects

## Backward Compatibility

All legacy functionality remains available:
- Low-poly styles still work
- Legacy material keywords supported
- Old tool calls remain compatible
- Direct API access unchanged

Simply specify `style: "runescapeLowPoly"` or `style: "genericLowPoly"` to use legacy styles.

## Summary

**What's New:**
- ✅ Modern stylized style is now default
- ✅ 6 art styles (4 modern + 2 legacy)
- ✅ 10+ material tiers loaded from JSON
- ✅ Hyperscape prompt system integrated
- ✅ PBR material support
- ✅ High polygon count assets
- ✅ Detailed geometry and textures
- ✅ T-pose and armor fitting improvements
- ✅ Backward compatible with legacy styles

**Recommended for:**
- Modern game development
- Professional projects
- High-quality asset generation
- Contemporary game aesthetics
- PBR-based rendering pipelines

**Use Legacy Styles for:**
- Retro/nostalgic projects
- Low-spec target hardware
- Performance-critical applications
- Matching existing low-poly assets
