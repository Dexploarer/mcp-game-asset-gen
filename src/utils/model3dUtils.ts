import { writeFileSync, mkdirSync, statSync } from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import {
  makeHTTPRequest,
  getFalAIKey,
  getMeshyKey,
  downloadAndSaveImage,
  encodeImageToBase64
} from './imageUtils.js';

const execFileAsync = promisify(execFile);

// Available 3D generation models and variants (prevents invalid configurations)
export enum Model3DModel {
  TRELLIS = 'trellis',
  HUNYUAN3D = 'hunyuan3d',
  HUNYUAN_WORLD = 'hunyuan-world',
  SEED3D = 'seed3d',
  MESHY = 'meshy'
}

export enum Model3DVariant {
  SINGLE = 'single',
  MULTI = 'multi',
  SINGLE_TURBO = 'single-turbo',
  MULTI_TURBO = 'multi-turbo'
}

export enum Model3DFormat {
  GLB = 'glb',
  GLTF = 'gltf'
}

// Available variant combinations for each model (prevents API errors)
export const AVAILABLE_VARIANTS = {
  [Model3DModel.TRELLIS]: [Model3DVariant.SINGLE, Model3DVariant.MULTI],
  [Model3DModel.HUNYUAN3D]: [Model3DVariant.SINGLE, Model3DVariant.MULTI, Model3DVariant.SINGLE_TURBO, Model3DVariant.MULTI_TURBO],
  [Model3DModel.HUNYUAN_WORLD]: [Model3DVariant.SINGLE], // Only single variant for world model
  [Model3DModel.SEED3D]: [Model3DVariant.SINGLE], // Seed3D is single-image-to-3D
  [Model3DModel.MESHY]: [Model3DVariant.SINGLE, Model3DVariant.MULTI] // Meshy supports 1-4 images
} as const;

// Default variants for each model (ensures good user experience)
export const DEFAULT_VARIANTS = {
  [Model3DModel.TRELLIS]: Model3DVariant.SINGLE,
  [Model3DModel.HUNYUAN3D]: Model3DVariant.SINGLE,
  [Model3DModel.HUNYUAN_WORLD]: Model3DVariant.SINGLE,
  [Model3DModel.SEED3D]: Model3DVariant.SINGLE,
  [Model3DModel.MESHY]: Model3DVariant.SINGLE
} as const;

// 3D Model generation interfaces
export interface Model3DGenerationOptions {
  prompt?: string;
  inputImagePaths?: string[];
  outputPath: string;
  model: Model3DModel;
  variant?: Model3DVariant;
  format?: Model3DFormat;
  quality?: 'standard' | 'high';
  textured_mesh?: boolean; // For Hunyuan3D - adds textures (3x cost)
}

export interface Model3DGenerationResult {
  provider: string;
  model: string;
  variant: string;
  savedPaths: string[];
  prompt_used?: string;
  input_images: string[];
  generation_time?: number;
  model_info?: {
    vertices?: number;
    faces?: number;
    file_size?: number;
    format?: string;
    has_pbr_textures?: boolean;
  };
  parameters: any;
  auto_generated_references?: string[];
  reference_model_used?: string;
  reference_views_generated?: string[];
}

// Validate base64 image URI format
export const validateBase64ImageURI = (uri: string): boolean => {
  const base64Pattern = /^data:image\/(png|jpg|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/;
  return base64Pattern.test(uri);
};

// Convert file paths to base64 URIs
export const convertPathsToBase64URIs = async (paths: string[]): Promise<string[]> => {
  const uris: string[] = [];
  
  for (const imagePath of paths) {
    try {
      const base64Data = encodeImageToBase64(imagePath);
      const uri = `data:image/png;base64,${base64Data}`;
      uris.push(uri);
    } catch (error) {
      throw new Error(`Failed to convert image ${imagePath} to base64 URI: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return uris;
};

// Download and save 3D model files
export const downloadAndSave3DModel = async (modelUrl: string, outputPath: string): Promise<string> => {
  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    mkdirSync(outputDir, { recursive: true });
    
    // Download 3D model file using curl
    const args = ['-s', '-L', '-o', outputPath, modelUrl];
    await execFileAsync('curl', args);
    
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to download and save 3D model to ${outputPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Get 3D model file information
export const getModel3DInfo = async (modelPath: string): Promise<{
  vertices?: number;
  faces?: number;
  file_size: number;
  format: string;
}> => {
  try {
    const stats = statSync(modelPath);
    const fileSize = stats.size;
    const ext = path.extname(modelPath).toLowerCase();
    
    // For now, return basic info. In the future, we could parse GLB/GLTF files
    // to get vertex and face counts using a 3D library
    return {
      file_size: fileSize,
      format: ext.replace('.', '').toUpperCase(),
    };
  } catch (error) {
    throw new Error(`Failed to get 3D model info for ${modelPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// FAL.ai 3D Model generation functions

// Trellis Single Image Input
export const trellisGenerate3DSingle = async (args: {
  prompt?: string;
  imagePath: string;
  outputPath: string;
  format?: 'glb' | 'gltf';
  texture_size?: 512 | 1024 | 2048;
}): Promise<Model3DGenerationResult> => {
  const apiKey = getFalAIKey();
  
  // Convert image to base64 URI if it's a file path
  let imageUri = args.imagePath;
  if (!args.imagePath.startsWith('data:')) {
    imageUri = `data:image/png;base64,${encodeImageToBase64(args.imagePath)}`;
  }
  
  const body = {
    image_url: imageUri,
    texture_size: args.texture_size || 1024,
    ss_guidance_strength: 7.5,
    ss_sampling_steps: 12,
    slat_guidance_strength: 3,
    slat_sampling_steps: 12,
    mesh_simplify: 0.95,
  };
  
  const headers = {
    'Authorization': `Key ${apiKey}`,
    'Content-Type': 'application/json'
  };
  
  const endpoint = 'https://fal.run/fal-ai/trellis';
  
  const response = await makeHTTPRequest(endpoint, 'POST', headers, body);
  
  if (response.error || response.detail) {
    throw new Error(`Trellis API error: ${response.error?.message || JSON.stringify(response.detail || response.error)}`);
  }
  
  // Download and save the 3D model
  const savedPaths: string[] = [];
  
  if (response.model_mesh && response.model_mesh.url) {
    const modelPath = await downloadAndSave3DModel(response.model_mesh.url, args.outputPath);
    savedPaths.push(modelPath);
  } else {
    throw new Error('No model mesh in Trellis response');
  }
  
  // Get model information
  const modelInfo = await getModel3DInfo(args.outputPath);
  
  return {
    provider: 'FAL.ai',
    model: 'trellis',
    variant: 'single',
    savedPaths: savedPaths,
    prompt_used: args.prompt,
    input_images: [args.imagePath],
    generation_time: response.timings?.inference,
    model_info: modelInfo,
    parameters: body
  };
};

// Trellis Multi Image Input
export const trellisGenerate3DMulti = async (args: {
  prompt?: string;
  imagePaths: string[];
  outputPath: string;
  format?: 'glb' | 'gltf';
  texture_size?: 512 | 1024 | 2048;
  multiimage_algo?: 'stochastic' | 'multidiffusion';
}): Promise<Model3DGenerationResult> => {
  const apiKey = getFalAIKey();
  
  // Convert images to base64 URIs if they are file paths
  const imageUris = await Promise.all(
    args.imagePaths.map(async (path) => {
      if (path.startsWith('data:')) {
        return path;
      } else {
        return `data:image/png;base64,${encodeImageToBase64(path)}`;
      }
    })
  );
  
  const body = {
    image_urls: imageUris,
    texture_size: args.texture_size || 1024,
    ss_guidance_strength: 7.5,
    ss_sampling_steps: 12,
    slat_guidance_strength: 3,
    slat_sampling_steps: 12,
    mesh_simplify: 0.95,
    multiimage_algo: args.multiimage_algo || 'stochastic',
  };
  
  const headers = {
    'Authorization': `Key ${apiKey}`,
    'Content-Type': 'application/json'
  };
  
  const endpoint = 'https://fal.run/fal-ai/trellis/multi';
  
  const response = await makeHTTPRequest(endpoint, 'POST', headers, body);
  
  if (response.error || response.detail) {
    throw new Error(`Trellis Multi API error: ${response.error?.message || JSON.stringify(response.detail || response.error)}`);
  }
  
  // Download and save the 3D model
  const savedPaths: string[] = [];
  
  if (response.model_mesh && response.model_mesh.url) {
    const modelPath = await downloadAndSave3DModel(response.model_mesh.url, args.outputPath);
    savedPaths.push(modelPath);
  } else {
    throw new Error('No model mesh in Trellis Multi response');
  }
  
  // Get model information
  const modelInfo = await getModel3DInfo(args.outputPath);
  
  return {
    provider: 'FAL.ai',
    model: 'trellis',
    variant: 'multi',
    savedPaths: savedPaths,
    prompt_used: args.prompt,
    input_images: args.imagePaths,
    generation_time: response.timings?.inference,
    model_info: modelInfo,
    parameters: body
  };
};

// Hunyuan3D Single Image Input
export const hunyuan3DGenerateSingle = async (args: {
  prompt?: string;
  imagePath: string;
  outputPath: string;
  format?: 'glb' | 'gltf';
  textured_mesh?: boolean;
}): Promise<Model3DGenerationResult> => {
  const apiKey = getFalAIKey();
  
  // Convert image to base64 URI if it's a file path
  let imageUri = args.imagePath;
  if (!args.imagePath.startsWith('data:')) {
    imageUri = `data:image/png;base64,${encodeImageToBase64(args.imagePath)}`;
  }
  
  const body = {
    input_image_url: imageUri,
    num_inference_steps: 50,
    guidance_scale: 7.5,
    octree_resolution: 256,
    textured_mesh: args.textured_mesh !== undefined ? args.textured_mesh : true, // Default to true
  };
  
  const headers = {
    'Authorization': `Key ${apiKey}`,
    'Content-Type': 'application/json'
  };
  
  const endpoint = 'https://fal.run/fal-ai/hunyuan3d/v2';
  
  const response = await makeHTTPRequest(endpoint, 'POST', headers, body);
  
  if (response.error || response.detail) {
    throw new Error(`Hunyuan3D API error: ${response.error?.message || JSON.stringify(response.detail || response.error)}`);
  }
  
  // Download and save the 3D model
  const savedPaths: string[] = [];
  
  if (response.model_mesh && response.model_mesh.url) {
    const modelPath = await downloadAndSave3DModel(response.model_mesh.url, args.outputPath);
    savedPaths.push(modelPath);
  } else {
    throw new Error('No model mesh in Hunyuan3D response');
  }
  
  // Get model information
  const modelInfo = await getModel3DInfo(args.outputPath);
  
  return {
    provider: 'FAL.ai',
    model: 'hunyuan3d-2.0',
    variant: 'single',
    savedPaths: savedPaths,
    prompt_used: args.prompt,
    input_images: [args.imagePath],
    generation_time: response.timings?.inference,
    model_info: modelInfo,
    parameters: body
  };
};

// Hunyuan3D Multi Image Input
export const hunyuan3DGenerateMulti = async (args: {
  prompt?: string;
  imagePaths: string[];
  outputPath: string;
  format?: 'glb' | 'gltf';
}): Promise<Model3DGenerationResult> => {
  const apiKey = getFalAIKey();
  
  // Validate that we have at least 3 images for front, back, left views
  if (args.imagePaths.length < 3) {
    throw new Error(`Hunyuan3D Multi requires at least 3 images (front, back, left views). Only ${args.imagePaths.length} images provided.`);
  }
  
  // Convert images to base64 URIs if they are file paths
  const imageUris = await Promise.all(
    args.imagePaths.map(async (path) => {
      if (path.startsWith('data:')) {
        return path;
      } else {
        return `data:image/png;base64,${encodeImageToBase64(path)}`;
      }
    })
  );
  
  // Map images to required view positions
  // Expected order: front, back, left (minimum required)
  const frontImage = imageUris[0];
  const backImage = imageUris[1];
  const leftImage = imageUris[2];
  
  const body = {
    front_image_url: frontImage,
    back_image_url: backImage,
    left_image_url: leftImage,
    format: args.format || 'glb',
  };
  
  const headers = {
    'Authorization': `Key ${apiKey}`,
    'Content-Type': 'application/json'
  };
  
  const endpoint = 'https://fal.run/fal-ai/hunyuan3d/v2/multi-view';
  
  const response = await makeHTTPRequest(endpoint, 'POST', headers, body);
  
  if (response.error || response.detail) {
    throw new Error(`Hunyuan3D Multi API error: ${response.error?.message || JSON.stringify(response.detail || response.error)}`);
  }
  
  // Download and save the 3D model
  const savedPaths: string[] = [];
  
  if (response.model_url) {
    const modelPath = await downloadAndSave3DModel(response.model_url, args.outputPath);
    savedPaths.push(modelPath);
  } else {
    throw new Error('No model URL in Hunyuan3D Multi response');
  }
  
  // Get model information
  const modelInfo = await getModel3DInfo(args.outputPath);
  
  return {
    provider: 'FAL.ai',
    model: 'hunyuan3d-2.0',
    variant: 'multi',
    savedPaths: savedPaths,
    prompt_used: args.prompt,
    input_images: args.imagePaths,
    generation_time: response.timings?.inference,
    model_info: modelInfo,
    parameters: body
  };
};

// Hunyuan3D Single Turbo
export const hunyuan3DGenerateSingleTurbo = async (args: {
  prompt?: string;
  imagePath: string;
  outputPath: string;
  format?: 'glb' | 'gltf';
}): Promise<Model3DGenerationResult> => {
  const apiKey = getFalAIKey();
  
  // Convert image to base64 URI if it's a file path
  let imageUri = args.imagePath;
  if (!args.imagePath.startsWith('data:')) {
    imageUri = `data:image/png;base64,${encodeImageToBase64(args.imagePath)}`;
  }
  
  const body = {
    image_url: imageUri,
    format: args.format || 'glb',
  };
  
  const headers = {
    'Authorization': `Key ${apiKey}`,
    'Content-Type': 'application/json'
  };
  
  const endpoint = 'https://fal.run/fal-ai/hunyuan3d/v2/turbo';
  
  const response = await makeHTTPRequest(endpoint, 'POST', headers, body);
  
  if (response.error || response.detail) {
    throw new Error(`Hunyuan3D Turbo API error: ${response.error?.message || JSON.stringify(response.detail || response.error)}`);
  }
  
  // Download and save the 3D model
  const savedPaths: string[] = [];
  
  if (response.model_url) {
    const modelPath = await downloadAndSave3DModel(response.model_url, args.outputPath);
    savedPaths.push(modelPath);
  } else {
    throw new Error('No model URL in Hunyuan3D Turbo response');
  }
  
  // Get model information
  const modelInfo = await getModel3DInfo(args.outputPath);
  
  return {
    provider: 'FAL.ai',
    model: 'hunyuan3d-2.0',
    variant: 'single-turbo',
    savedPaths: savedPaths,
    prompt_used: args.prompt,
    input_images: [args.imagePath],
    generation_time: response.timings?.inference,
    model_info: modelInfo,
    parameters: body
  };
};

// Hunyuan3D Multi Turbo
export const hunyuan3DGenerateMultiTurbo = async (args: {
  prompt?: string;
  imagePaths: string[];
  outputPath: string;
  format?: 'glb' | 'gltf';
}): Promise<Model3DGenerationResult> => {
  const apiKey = getFalAIKey();
  
  // Validate that we have at least 3 images for front, back, left views
  if (args.imagePaths.length < 3) {
    throw new Error(`Hunyuan3D Multi Turbo requires at least 3 images (front, back, left views). Only ${args.imagePaths.length} images provided.`);
  }
  
  // Convert images to base64 URIs if they are file paths
  const imageUris = await Promise.all(
    args.imagePaths.map(async (path) => {
      if (path.startsWith('data:')) {
        return path;
      } else {
        return `data:image/png;base64,${encodeImageToBase64(path)}`;
      }
    })
  );
  
  // Map images to required view positions
  // Expected order: front, back, left (minimum required)
  const frontImage = imageUris[0];
  const backImage = imageUris[1];
  const leftImage = imageUris[2];
  
  const body = {
    front_image_url: frontImage,
    back_image_url: backImage,
    left_image_url: leftImage,
    format: args.format || 'glb',
  };
  
  const headers = {
    'Authorization': `Key ${apiKey}`,
    'Content-Type': 'application/json'
  };
  
  const endpoint = 'https://fal.run/fal-ai/hunyuan3d/v2/multi-view/turbo';
  
  const response = await makeHTTPRequest(endpoint, 'POST', headers, body);
  
  if (response.error || response.detail) {
    throw new Error(`Hunyuan3D Multi Turbo API error: ${response.error?.message || JSON.stringify(response.detail || response.error)}`);
  }
  
  // Download and save the 3D model
  const savedPaths: string[] = [];
  
  if (response.model_url) {
    const modelPath = await downloadAndSave3DModel(response.model_url, args.outputPath);
    savedPaths.push(modelPath);
  } else {
    throw new Error('No model URL in Hunyuan3D Multi Turbo response');
  }
  
  // Get model information
  const modelInfo = await getModel3DInfo(args.outputPath);
  
  return {
    provider: 'FAL.ai',
    model: 'hunyuan3d-2.0',
    variant: 'multi-turbo',
    savedPaths: savedPaths,
    prompt_used: args.prompt,
    input_images: args.imagePaths,
    generation_time: response.timings?.inference,
    model_info: modelInfo,
    parameters: body
  };
};

// Hunyuan World Model (for world/scene generation)
export const hunyuanWorldGenerate3D = async (args: {
  prompt?: string;
  imagePath: string;
  outputPath: string;
  format?: 'glb' | 'gltf';
  camera_distance?: number;
  fov?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
}): Promise<Model3DGenerationResult> => {
  const apiKey = getFalAIKey();
  
  // Convert image to base64 URI if it's a file path
  let imageUri = args.imagePath;
  if (!args.imagePath.startsWith('data:')) {
    imageUri = `data:image/png;base64,${encodeImageToBase64(args.imagePath)}`;
  }
  
  const body = {
    image_url: imageUri,
    camera_distance: args.camera_distance || 2.5,
    fov: args.fov || 40,
    num_inference_steps: args.num_inference_steps || 50,
    guidance_scale: args.guidance_scale || 7.5,
    seed: args.seed,
  };
  
  const headers = {
    'Authorization': `Key ${apiKey}`,
    'Content-Type': 'application/json'
  };
  
  const endpoint = 'https://fal.run/fal-ai/hunyuan_world/image-to-world';
  
  const response = await makeHTTPRequest(endpoint, 'POST', headers, body);
  
  if (response.error || response.detail) {
    throw new Error(`Hunyuan World API error: ${response.error?.message || JSON.stringify(response.detail || response.error)}`);
  }
  
  // Download and save the 3D model
  const savedPaths: string[] = [];
  
  if (response.model_url) {
    const modelPath = await downloadAndSave3DModel(response.model_url, args.outputPath);
    savedPaths.push(modelPath);
  } else {
    throw new Error('No model URL in Hunyuan World response');
  }
  
  // Get model information
  const modelInfo = await getModel3DInfo(args.outputPath);
  
  return {
    provider: 'FAL.ai',
    model: 'hunyuan-world',
    variant: 'single',
    savedPaths: savedPaths,
    prompt_used: args.prompt,
    input_images: [args.imagePath],
    generation_time: response.timings?.inference,
    model_info: modelInfo,
    parameters: body
  };
};

// ByteDance Seed3D - High-fidelity single image to 3D
// Features: PBR textures (albedo, metalness, roughness), UV-mapped, simulation-grade
export const seed3DGenerate = async (args: {
  prompt?: string;
  imagePath: string;
  outputPath: string;
  format?: 'glb' | 'gltf';
  face_limit?: number; // Limit number of faces in mesh
  texture_size?: 512 | 1024 | 2048 | 4096;
  render_video?: boolean; // Generate a turntable video
  seed?: number;
}): Promise<Model3DGenerationResult> => {
  const apiKey = getFalAIKey();

  // Convert image to base64 URI if it's a file path
  let imageUri = args.imagePath;
  if (!args.imagePath.startsWith('data:')) {
    imageUri = `data:image/png;base64,${encodeImageToBase64(args.imagePath)}`;
  }

  const body: any = {
    image_url: imageUri,
  };

  // Add optional parameters
  if (args.face_limit !== undefined) {
    body.face_limit = args.face_limit;
  }
  if (args.texture_size !== undefined) {
    body.texture_size = args.texture_size;
  }
  if (args.render_video !== undefined) {
    body.render_video = args.render_video;
  }
  if (args.seed !== undefined) {
    body.seed = args.seed;
  }

  const headers = {
    'Authorization': `Key ${apiKey}`,
    'Content-Type': 'application/json'
  };

  const endpoint = 'https://fal.run/fal-ai/bytedance/seed3d/image-to-3d';

  const response = await makeHTTPRequest(endpoint, 'POST', headers, body);

  if (response.error || response.detail) {
    throw new Error(`Seed3D API error: ${response.error?.message || JSON.stringify(response.detail || response.error)}`);
  }

  // Download and save the 3D model
  const savedPaths: string[] = [];

  // Seed3D returns model_mesh with url
  if (response.model_mesh && response.model_mesh.url) {
    const modelPath = await downloadAndSave3DModel(response.model_mesh.url, args.outputPath);
    savedPaths.push(modelPath);
  } else if (response.model_url) {
    // Fallback to model_url if present
    const modelPath = await downloadAndSave3DModel(response.model_url, args.outputPath);
    savedPaths.push(modelPath);
  } else {
    throw new Error('No model mesh URL in Seed3D response');
  }

  // Get model information
  const modelInfo = await getModel3DInfo(args.outputPath);

  return {
    provider: 'FAL.ai',
    model: 'seed3d',
    variant: 'single',
    savedPaths: savedPaths,
    prompt_used: args.prompt,
    input_images: [args.imagePath],
    generation_time: response.timings?.inference,
    model_info: {
      ...modelInfo,
      // Seed3D provides PBR textures
      has_pbr_textures: true,
    },
    parameters: body
  };
};

// Helper function to poll Meshy task status
const pollMeshyTaskStatus = async (
  taskId: string,
  apiKey: string,
  basePath: string = 'image-to-3d', // Use 'image-to-3d/multi-view' for multi-view tasks
  maxAttempts: number = 120, // 10 minutes with 5s intervals
  pollInterval: number = 5000
): Promise<any> => {
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
  };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await makeHTTPRequest(
      `https://api.meshy.ai/openapi/v1/${basePath}/${taskId}`,
      'GET',
      headers
    );

    if (response.error) {
      throw new Error(`Meshy API error: ${response.error.message || JSON.stringify(response.error)}`);
    }

    const status = response.status;

    if (status === 'SUCCEEDED') {
      return response;
    } else if (status === 'FAILED' || status === 'EXPIRED') {
      throw new Error(`Meshy task ${status}: ${response.task_error?.message || 'Unknown error'}`);
    }

    // Still processing, wait and poll again
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Meshy task timed out after maximum polling attempts');
};

// Meshy Image-to-3D - Single image
// Features: High quality mesh, optional textures, remeshing
export const meshyGenerateSingle = async (args: {
  prompt?: string;
  imagePath: string;
  outputPath: string;
  format?: 'glb' | 'gltf' | 'fbx' | 'obj' | 'usdz';
  should_remesh?: boolean;
  should_texture?: boolean;
  target_polycount?: number;
  topology?: 'quad' | 'triangle';
  ai_model?: 'meshy-6' | 'meshy-5' | 'meshy-4';
}): Promise<Model3DGenerationResult> => {
  const apiKey = getMeshyKey();

  // Convert image to base64 URI if it's a file path
  let imageUri = args.imagePath;
  if (!args.imagePath.startsWith('data:') && !args.imagePath.startsWith('http')) {
    imageUri = `data:image/png;base64,${encodeImageToBase64(args.imagePath)}`;
  }

  const body: any = {
    image_url: imageUri,
    enable_pbr: true, // Enable PBR textures
  };

  // Add optional parameters
  if (args.ai_model !== undefined) {
    body.ai_model = args.ai_model;
  }
  if (args.should_remesh !== undefined) {
    body.should_remesh = args.should_remesh;
  }
  if (args.should_texture !== undefined) {
    body.should_texture = args.should_texture;
  }
  if (args.target_polycount !== undefined) {
    body.target_polycount = args.target_polycount;
  }
  if (args.topology !== undefined) {
    body.topology = args.topology;
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  // Create the task
  const createResponse = await makeHTTPRequest(
    'https://api.meshy.ai/openapi/v1/image-to-3d',
    'POST',
    headers,
    body
  );

  if (createResponse.error) {
    throw new Error(`Meshy API error: ${createResponse.error.message || JSON.stringify(createResponse.error)}`);
  }

  const taskId = createResponse.result;
  if (!taskId) {
    throw new Error('No task ID returned from Meshy API');
  }

  // Poll for completion
  const result = await pollMeshyTaskStatus(taskId, apiKey);

  // Download and save the 3D model
  const savedPaths: string[] = [];

  // Meshy returns model_urls with different formats
  const format = args.format || 'glb';
  const modelUrl = result.model_urls?.[format] || result.model_urls?.glb;

  if (modelUrl) {
    const modelPath = await downloadAndSave3DModel(modelUrl, args.outputPath);
    savedPaths.push(modelPath);
  } else {
    throw new Error('No model URL in Meshy response');
  }

  // Get model information
  const modelInfo = await getModel3DInfo(args.outputPath);

  return {
    provider: 'Meshy',
    model: args.ai_model || 'meshy-6',
    variant: 'single',
    savedPaths: savedPaths,
    prompt_used: args.prompt,
    input_images: [args.imagePath],
    generation_time: result.finished_at ?
      (new Date(result.finished_at).getTime() - new Date(result.created_at).getTime()) / 1000 : undefined,
    model_info: {
      ...modelInfo,
      has_pbr_textures: args.should_texture !== false,
    },
    parameters: body
  };
};

// Meshy Multi-Image-to-3D (1-4 images)
// Features: Multiple viewpoints for better accuracy
export const meshyGenerateMulti = async (args: {
  prompt?: string;
  imagePaths: string[];
  outputPath: string;
  format?: 'glb' | 'gltf' | 'fbx' | 'obj' | 'usdz';
  should_remesh?: boolean;
  should_texture?: boolean;
  target_polycount?: number;
  topology?: 'quad' | 'triangle';
  ai_model?: 'meshy-6-preview' | 'meshy-5';
}): Promise<Model3DGenerationResult> => {
  const apiKey = getMeshyKey();

  if (args.imagePaths.length < 1 || args.imagePaths.length > 4) {
    throw new Error('Meshy Multi-Image requires 1-4 images');
  }

  // Convert images to base64 URIs if they are file paths
  const imageUris = await Promise.all(
    args.imagePaths.map(async (imgPath) => {
      if (imgPath.startsWith('data:') || imgPath.startsWith('http')) {
        return imgPath;
      } else {
        return `data:image/png;base64,${encodeImageToBase64(imgPath)}`;
      }
    })
  );

  const body: any = {
    image_urls: imageUris,
    enable_pbr: true,
  };

  // Add optional parameters
  if (args.ai_model !== undefined) {
    body.ai_model = args.ai_model;
  }
  if (args.should_remesh !== undefined) {
    body.should_remesh = args.should_remesh;
  }
  if (args.should_texture !== undefined) {
    body.should_texture = args.should_texture;
  }
  if (args.target_polycount !== undefined) {
    body.target_polycount = args.target_polycount;
  }
  if (args.topology !== undefined) {
    body.topology = args.topology;
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  // Create the task
  const createResponse = await makeHTTPRequest(
    'https://api.meshy.ai/openapi/v1/image-to-3d/multi-view',
    'POST',
    headers,
    body
  );

  if (createResponse.error) {
    throw new Error(`Meshy Multi API error: ${createResponse.error.message || JSON.stringify(createResponse.error)}`);
  }

  const taskId = createResponse.result;
  if (!taskId) {
    throw new Error('No task ID returned from Meshy Multi API');
  }

  // Poll for completion using the multi-view endpoint
  const result = await pollMeshyTaskStatus(taskId, apiKey, 'image-to-3d/multi-view');

  // Download and save the 3D model
  const savedPaths: string[] = [];

  // Meshy returns model_urls with different formats
  const format = args.format || 'glb';
  const modelUrl = result.model_urls?.[format] || result.model_urls?.glb;

  if (modelUrl) {
    const modelPath = await downloadAndSave3DModel(modelUrl, args.outputPath);
    savedPaths.push(modelPath);
  } else {
    throw new Error('No model URL in Meshy Multi response');
  }

  // Get model information
  const modelInfo = await getModel3DInfo(args.outputPath);

  return {
    provider: 'Meshy',
    model: args.ai_model || 'meshy-5',
    variant: 'multi',
    savedPaths: savedPaths,
    prompt_used: args.prompt,
    input_images: args.imagePaths,
    generation_time: result.finished_at ?
      (new Date(result.finished_at).getTime() - new Date(result.created_at).getTime()) / 1000 : undefined,
    model_info: {
      ...modelInfo,
      has_pbr_textures: args.should_texture !== false,
    },
    parameters: body
  };
};