import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateImageOptions,
  getDefaultOptions,
  mergeWithDefaults,
  type ImageGenerationOptions,
} from './providers/imageHelpers.js';

describe('Image Helpers', () => {
  describe('validateImageOptions', () => {
    it('should pass validation for valid options', () => {
      const options: ImageGenerationOptions = {
        provider: 'openai',
        prompt: 'test prompt',
        outputPath: 'test.png',
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
        n: 1,
      };

      expect(() => validateImageOptions(options)).not.toThrow();
    });

    it('should throw error for empty prompt', () => {
      const options: ImageGenerationOptions = {
        provider: 'openai',
        prompt: '',
        outputPath: 'test.png',
      };

      expect(() => validateImageOptions(options)).toThrow('Prompt is required and cannot be empty');
    });

    it('should throw error for empty output path', () => {
      const options: ImageGenerationOptions = {
        provider: 'openai',
        prompt: 'test prompt',
        outputPath: '',
      };

      expect(() => validateImageOptions(options)).toThrow('Output path is required and cannot be empty');
    });

    it('should throw error for invalid provider', () => {
      const options: ImageGenerationOptions = {
        provider: 'invalid' as any,
        prompt: 'test prompt',
        outputPath: 'test.png',
      };

      expect(() => validateImageOptions(options)).toThrow('Provider must be one of: openai, gemini, falai');
    });

    it('should validate OpenAI specific parameters', () => {
      const options: ImageGenerationOptions = {
        provider: 'openai',
        prompt: 'test prompt',
        outputPath: 'test.png',
        size: 'invalid' as any,
      };

      expect(() => validateImageOptions(options)).toThrow('OpenAI size must be one of: 1024x1024, 1792x1024, 1024x1792');
    });

    it('should validate FAL.ai specific parameters', () => {
      const options: ImageGenerationOptions = {
        provider: 'falai',
        prompt: 'test prompt',
        outputPath: 'test.png',
        num_inference_steps: 100, // Invalid: > 50
      };

      expect(() => validateImageOptions(options)).toThrow('FAL.ai num_inference_steps must be between 1 and 50');
    });
  });

  describe('getDefaultOptions', () => {
    it('should return default options for OpenAI', () => {
      const defaults = getDefaultOptions('openai');

      expect(defaults).toEqual({
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
        n: 1,
      });
    });

    it('should return default options for Gemini', () => {
      const defaults = getDefaultOptions('gemini');

      expect(defaults).toEqual({
        model: 'gemini-2.5-flash-image',
      });
    });

    it('should return default options for FAL.ai', () => {
      const defaults = getDefaultOptions('falai');

      expect(defaults).toEqual({
        image_size: 'square_hd',
        num_inference_steps: 20,
        guidance_scale: 7.5,
      });
    });

    it('should throw error for invalid provider', () => {
      expect(() => getDefaultOptions('invalid' as any)).toThrow('No default options available for provider: invalid');
    });
  });

  describe('mergeWithDefaults', () => {
    it('should merge user options with defaults', () => {
      const userOptions: ImageGenerationOptions = {
        provider: 'openai',
        prompt: 'test prompt',
        outputPath: 'test.png',
        quality: 'hd', // Override default
      };

      const merged = mergeWithDefaults(userOptions);

      expect(merged).toEqual({
        size: '1024x1024', // Default
        quality: 'hd', // User option should override default
        style: 'vivid', // Default
        n: 1, // Default
        provider: 'openai',
        prompt: 'test prompt',
        outputPath: 'test.png',
      });
    });

    it('should preserve user options when not conflicting with defaults', () => {
      const userOptions: ImageGenerationOptions = {
        provider: 'falai',
        prompt: 'test prompt',
        outputPath: 'test.png',
        guidance_scale: 10, // User-specific option
      };

      const merged = mergeWithDefaults(userOptions);

      expect(merged.guidance_scale).toBe(10); // User option preserved
      expect(merged.num_inference_steps).toBe(20); // Default applied
    });
  });
});