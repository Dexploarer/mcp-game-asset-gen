# VRM Conversion Guide

## Overview

The MCP Game Asset Gen server now includes VRM (Virtual Reality Model) conversion capabilities, allowing you to convert GLB models to the standardized VRM 1.0 format. VRM is a 3D avatar format specifically designed for virtual reality and game applications, with a standardized humanoid skeleton and T-pose.

## What is VRM?

VRM is an open-source 3D avatar file format that extends glTF/GLB with humanoid-specific features:

- **Standardized Skeleton**: Uses consistent bone names (hips, leftUpperArm, rightLowerLeg, etc.)
- **T-Pose Rest Pose**: Ensures compatibility with animation systems
- **Y-Up Coordinate System**: Standard orientation for game engines
- **Height Normalization**: Characters normalized to ~1.6m height
- **Metadata Support**: Includes avatar name, author, licensing information
- **Animation Ready**: Compatible with Mixamo, VRM animation systems, and Hyperscape

## VRM Conversion Tool

### Tool: `glb_to_vrm`

Converts a GLB model to VRM 1.0 format with proper bone mapping and normalization.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `inputPath` | string | **Yes** | Path to the input GLB file to convert |
| `outputPath` | string | **Yes** | Path where the output VRM file will be saved |
| `avatarName` | string | No | Name of the avatar (for VRM metadata) |
| `author` | string | No | Author name (for VRM metadata) |
| `version` | string | No | Version string (for VRM metadata) |
| `licenseUrl` | string | No | URL to license information |
| `commercialUsage` | string | No | Commercial usage permission: `personalNonProfit`, `personalProfit`, or `corporation` |

#### Example Usage

```json
{
  "name": "glb_to_vrm",
  "arguments": {
    "inputPath": "/path/to/character.glb",
    "outputPath": "/path/to/character.vrm",
    "avatarName": "Knight Character",
    "author": "Game Studio",
    "version": "1.0",
    "commercialUsage": "corporation"
  }
}
```

#### Example with Claude Desktop

When using Claude Desktop with the MCP server:

```
User: Convert my character GLB to VRM format
Claude: I'll convert your GLB character to VRM format.
[Uses glb_to_vrm tool]

VRM conversion successful!

Output: /path/to/character.vrm
Avatar Name: Knight Character
Author: Game Studio

Bone Mappings (24 bones):
  Hips → hips
  Spine → spine
  Spine1 → chest
  Neck → neck
  Head → head
  LeftShoulder → leftShoulder
  LeftArm → leftUpperArm
  LeftForeArm → leftLowerArm
  LeftHand → leftHand
  ... (and more)

Coordinate System: Fixed (Z-up → Y-up)

The VRM file is ready to use with VRM-compatible applications and the Hyperscape animation system.
```

## Conversion Process

The VRM converter performs the following steps automatically:

### 1. **Load and Analyze**
- Loads the GLB file into Three.js scene
- Analyzes skeleton structure
- Detects coordinate system (Y-up or Z-up)

### 2. **Bone Mapping**
- Maps non-standard bone names to VRM HumanoidBone standard
- Handles multiple naming conventions:
  - Meshy format (Hips, Spine, LeftArm, etc.)
  - Mixamo format (mixamorigHips, mixamorigSpine, etc.)
  - Generic formats with variations

### 3. **Coordinate System Conversion**
- Detects if model is Z-up (common in Blender exports)
- Converts to Y-up coordinate system if needed
- Applies rotation: -90° around X-axis

### 4. **Height Normalization**
- Measures character height from feet to head
- Normalizes to standard height (~1.6m)
- Maintains proportions during scaling

### 5. **T-Pose Enforcement**
- Ensures character is in T-pose (arms horizontal, legs vertical)
- Required for animation retargeting

### 6. **VRM Extension**
- Adds VRMC_vrm extension to glTF
- Sets VRM specification version to "1.0"
- Includes humanoid bone mappings
- Adds metadata (name, author, version, license)

### 7. **Export**
- Exports as VRM-compatible GLB file
- Validates VRM structure
- Returns conversion report with warnings

## Bone Mapping Reference

The converter maps various bone naming conventions to VRM standard:

### Core Skeleton (Required)

| VRM Bone | Common Names | Description |
|----------|--------------|-------------|
| `hips` | Hips, pelvis, root | Root of skeleton |
| `spine` | Spine, spine1 | Lower spine |
| `chest` | Spine1, chest, upper_chest | Upper spine |
| `neck` | Neck | Neck |
| `head` | Head | Head |

### Arms (Required)

| VRM Bone | Common Names |
|----------|--------------|
| `leftShoulder` | LeftShoulder, L_shoulder |
| `leftUpperArm` | LeftArm, LeftUpArm, L_upper_arm |
| `leftLowerArm` | LeftForeArm, L_forearm |
| `leftHand` | LeftHand, L_hand |
| `rightShoulder` | RightShoulder, R_shoulder |
| `rightUpperArm` | RightArm, RightUpArm, R_upper_arm |
| `rightLowerArm` | RightForeArm, R_forearm |
| `rightHand` | RightHand, R_hand |

### Legs (Required)

| VRM Bone | Common Names |
|----------|--------------|
| `leftUpperLeg` | LeftUpLeg, L_thigh |
| `leftLowerLeg` | LeftLeg, L_shin |
| `leftFoot` | LeftFoot, L_foot |
| `leftToes` | LeftToeBase, L_toe |
| `rightUpperLeg` | RightUpLeg, R_thigh |
| `rightLowerLeg` | RightLeg, R_shin |
| `rightFoot` | RightFoot, R_foot |
| `rightToes` | RightToeBase, R_toe |

### Fingers (Optional)

The converter supports mapping for all 10 fingers (5 per hand), each with 3 joints:
- Thumb, Index, Middle, Ring, Little
- Proximal, Intermediate, Distal segments

## Workflow Integration

### Converting Generated Characters

When you generate a character with the MCP server, you can convert it to VRM:

```
1. Generate character GLB:
   hyperscape_generate_character → character.glb

2. Convert to VRM:
   glb_to_vrm → character.vrm

3. Use in your application:
   - Import into Unity/Unreal
   - Use with VRM animation system
   - Upload to Hyperscape/Hyperfy
```

### Batch Conversion

You can convert multiple characters in sequence:

```json
[
  {
    "tool": "glb_to_vrm",
    "args": {
      "inputPath": "/characters/knight.glb",
      "outputPath": "/characters/knight.vrm",
      "avatarName": "Knight",
      "author": "Studio"
    }
  },
  {
    "tool": "glb_to_vrm",
    "args": {
      "inputPath": "/characters/mage.glb",
      "outputPath": "/characters/mage.vrm",
      "avatarName": "Mage",
      "author": "Studio"
    }
  }
]
```

## Troubleshooting

### Common Issues

#### 1. "Input file not found"

**Problem**: The GLB file path is incorrect or file doesn't exist.

**Solution**: Verify the file path is correct and the GLB file exists:
```bash
ls -la /path/to/character.glb
```

#### 2. "Failed to load GLB"

**Problem**: The GLB file is corrupted or not a valid glTF binary.

**Solution**:
- Verify the GLB file can be opened in a 3D viewer
- Re-export from your 3D modeling software
- Ensure the file has a `.glb` extension

#### 3. "No skeleton found in model"

**Problem**: The GLB file doesn't contain a rigged character with bones.

**Solution**: The VRM converter requires a rigged humanoid character with a skeleton. Static models cannot be converted to VRM.

#### 4. "Failed to map required bones"

**Problem**: The converter couldn't identify critical bones (hips, spine, arms, legs).

**Solution**:
- Ensure your character uses standard bone naming
- Check that the skeleton has at minimum: hips, spine, neck, head, arms, legs
- Consider renaming bones in your 3D software before export

#### 5. "Coordinate system detection failed"

**Problem**: Unusual coordinate system or orientation.

**Solution**: The converter will still attempt conversion but may produce unexpected results. Manually fix orientation in your 3D software before export.

### Validation

After conversion, validate your VRM file:

1. **Open in VRM Viewer**: Use online VRM viewers like [VRM Viewer](https://vrm-viewer.org/)
2. **Check in Unity**: Import using UniVRM plugin
3. **Test with Hyperscape**: Upload to verify animation compatibility

## VRM Service Architecture

The VRM conversion is powered by several services:

### Core Services

1. **VRMConverter** (`src/services/vrm/VRMConverter.ts`)
   - Main conversion orchestrator
   - Handles glTF extensions
   - Exports VRM GLB

2. **BoneMappings** (`src/services/vrm/BoneMappings.ts`)
   - Bone name mapping tables
   - Handles naming variations
   - Meshy → Mixamo → VRM

3. **SkeletonRetargeter** (`src/services/vrm/SkeletonRetargeter.ts`)
   - Skeleton structure conversion
   - Coordinate system transformation
   - Bone hierarchy preservation

4. **AnimationRetargeting** (`src/services/vrm/AnimationRetargeting.ts`)
   - Animation conversion between formats
   - Bind pose compensation
   - Height scaling adjustments

5. **AssetNormalizationService** (`src/services/vrm/AssetNormalizationService.ts`)
   - Height normalization
   - Scale standardization
   - Position/orientation correction

6. **NormalizationConventions** (`src/services/vrm/NormalizationConventions.ts`)
   - Asset type conventions
   - Standard measurements
   - Validation rules

### Solver Services

Supporting services for advanced retargeting:

- **DistanceSolver**: Maintains bone length constraints
- **DistanceChildTargetingSolver**: Child bone positioning
- **WeightTransferSolver**: Skin weight recalculation
- **AutoSkinSolver**: Automatic skinning

## Technical Details

### VRM 1.0 Specification

The converter creates VRM files compliant with VRM 1.0 specification:

```json
{
  "extensions": {
    "VRMC_vrm": {
      "specVersion": "1.0",
      "humanoid": {
        "humanBones": {
          "hips": { "node": 0 },
          "spine": { "node": 1 },
          ...
        }
      },
      "meta": {
        "name": "Avatar Name",
        "version": "1.0",
        "authors": ["Author Name"],
        "licenseUrl": "https://...",
        "commercialUsage": "corporation"
      }
    }
  }
}
```

### Dependencies

The VRM conversion uses:

- **@pixiv/three-vrm** (^3.4.4): VRM format support
- **three** (^0.181.0): 3D scene graph and math
- **three-mesh-bvh** (^0.9.2): Mesh optimization
- **three-stdlib** (^2.36.0): Additional Three.js utilities

### Coordinate Systems

| System | Up Axis | Forward Axis | Common In |
|--------|---------|--------------|-----------|
| Y-up | +Y | -Z | Unity, VRM, Mixamo |
| Z-up | +Z | +Y | Blender, glTF |

The converter automatically detects and converts between these systems.

## Best Practices

### 1. **Character Preparation**

Before converting to VRM:
- Ensure character is in T-pose
- Use standard bone names when possible
- Keep polygon count reasonable (<50k triangles)
- Use single material where possible

### 2. **Naming Conventions**

Recommended bone naming:
- Use clear, descriptive names (Hips, Spine, Head)
- Maintain left/right symmetry (LeftArm, RightArm)
- Use consistent capitalization
- Avoid special characters

### 3. **Metadata**

Always include metadata for better asset management:
```json
{
  "avatarName": "Descriptive Name",
  "author": "Your Name/Studio",
  "version": "1.0",
  "licenseUrl": "https://...",
  "commercialUsage": "personalNonProfit"
}
```

### 4. **File Organization**

Organize your assets:
```
/assets/
  /characters/
    /glb/          # Source GLB files
      knight.glb
      mage.glb
    /vrm/          # Converted VRM files
      knight.vrm
      mage.vrm
```

## Integration with Hyperscape

The VRM converter is specifically designed for Hyperscape MMORPG asset pipeline:

### Workflow

1. **Generate Asset**: Use Hyperscape tools to generate character
2. **Convert to VRM**: Use `glb_to_vrm` tool
3. **Normalize**: Asset is automatically normalized to 1.6m height
4. **Import**: Upload to Hyperscape for animation

### Animation Compatibility

VRM files work seamlessly with:
- Hyperscape animation system
- Mixamo animations
- Custom VRM animations
- Motion capture data

## Further Resources

- [VRM Specification](https://github.com/vrm-c/vrm-specification)
- [UniVRM (Unity Plugin)](https://github.com/vrm-c/UniVRM)
- [Three-VRM Documentation](https://github.com/pixiv/three-vrm)
- [Hyperscape Documentation](https://github.com/HyperscapeAI/hyperscape)

## Support

For issues or questions:
- Check troubleshooting section above
- Review examples in this guide
- Open an issue on GitHub
- Consult VRM specification documentation
