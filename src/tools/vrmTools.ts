/**
 * VRM Conversion Tools for MCP
 *
 * Provides MCP tools for converting GLB models to VRM format
 * with proper bone mapping, normalization, and retargeting.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'fs/promises';
import path from 'path';
import { convertGLBToVRM, VRMConversionOptions } from '../services/vrm/VRMConverter.js';

/**
 * Tool definitions for VRM conversion
 */
export const VRM_TOOLS = [
  {
    name: 'glb_to_vrm',
    description: 'Convert a GLB model to VRM 1.0 format with proper bone mapping and normalization. ' +
                 'VRM is a standardized 3D avatar format with humanoid skeleton, T-pose, and animation support. ' +
                 'This tool handles coordinate system conversion, bone name mapping (Meshy → Mixamo → VRM), ' +
                 'height normalization to 1.6m, and adds VRM 1.0 metadata extensions.',
    inputSchema: {
      type: 'object',
      properties: {
        inputPath: {
          type: 'string',
          description: 'Path to the input GLB file to convert',
        },
        outputPath: {
          type: 'string',
          description: 'Path where the output VRM file will be saved',
        },
        avatarName: {
          type: 'string',
          description: 'Name of the avatar (used in VRM metadata)',
        },
        author: {
          type: 'string',
          description: 'Author name (used in VRM metadata)',
        },
        version: {
          type: 'string',
          description: 'Version string (used in VRM metadata)',
        },
        licenseUrl: {
          type: 'string',
          description: 'URL to license information (used in VRM metadata)',
        },
        commercialUsage: {
          type: 'string',
          enum: ['personalNonProfit', 'personalProfit', 'corporation'],
          description: 'Commercial usage permission (used in VRM metadata)',
        },
      },
      required: ['inputPath', 'outputPath'],
    },
  },
] as const;

/**
 * Load GLB file into Three.js scene
 */
async function loadGLB(filePath: string): Promise<THREE.Group> {
  const loader = new GLTFLoader();
  const fileBuffer = await fs.readFile(filePath);
  const arrayBuffer = fileBuffer.buffer.slice(
    fileBuffer.byteOffset,
    fileBuffer.byteOffset + fileBuffer.byteLength
  );

  return new Promise((resolve, reject) => {
    loader.parse(arrayBuffer, '', (gltf) => {
      resolve(gltf.scene);
    }, (error) => {
      reject(new Error(`Failed to load GLB: ${error}`));
    });
  });
}

/**
 * Tool handlers for VRM conversion
 */
export const VRM_TOOL_HANDLERS = {
  glb_to_vrm: async (args: {
    inputPath: string;
    outputPath: string;
    avatarName?: string;
    author?: string;
    version?: string;
    licenseUrl?: string;
    commercialUsage?: 'personalNonProfit' | 'personalProfit' | 'corporation';
  }) => {
    try {
      console.log(`[VRM] Loading GLB from: ${args.inputPath}`);

      // Validate input file exists
      try {
        await fs.access(args.inputPath);
      } catch (err) {
        throw new Error(`Input file not found: ${args.inputPath}`);
      }

      // Load GLB file
      const glbScene = await loadGLB(args.inputPath);
      console.log(`[VRM] GLB loaded successfully`);

      // Prepare conversion options
      const options: VRMConversionOptions = {
        avatarName: args.avatarName,
        author: args.author,
        version: args.version,
        licenseUrl: args.licenseUrl,
        commercialUsage: args.commercialUsage,
      };

      // Convert to VRM
      console.log(`[VRM] Converting to VRM format...`);
      const result = await convertGLBToVRM(glbScene, options);
      console.log(`[VRM] Conversion complete`);

      // Ensure output directory exists
      const outputDir = path.dirname(args.outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      // Write VRM file
      const vrmBuffer = Buffer.from(result.vrmData);
      await fs.writeFile(args.outputPath, vrmBuffer);
      console.log(`[VRM] VRM file saved to: ${args.outputPath}`);

      // Prepare result message
      const boneMappingsList = Array.from(result.boneMappings.entries())
        .map(([meshyBone, vrmBone]) => `  ${meshyBone} → ${vrmBone}`)
        .join('\n');

      const warningsList = result.warnings.length > 0
        ? '\n\nWarnings:\n' + result.warnings.map(w => `  - ${w}`).join('\n')
        : '';

      return {
        content: [
          {
            type: 'text',
            text: `VRM conversion successful!

Output: ${args.outputPath}
Avatar Name: ${args.avatarName || 'Untitled'}
Author: ${args.author || 'Unknown'}

Bone Mappings (${result.boneMappings.size} bones):
${boneMappingsList}

Coordinate System: ${result.coordinateSystemFixed ? 'Fixed (Z-up → Y-up)' : 'Already Y-up'}${warningsList}

The VRM file is ready to use with VRM-compatible applications and the Hyperscape animation system.`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[VRM] Conversion error:', errorMessage);

      return {
        content: [
          {
            type: 'text',
            text: `VRM conversion failed: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
};
