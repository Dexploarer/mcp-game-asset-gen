# MCP Asset Generation Server - Development Roadmap

## Current Status
✅ Complete MCP server implementation with image generation capabilities  
✅ Support for OpenAI, Gemini, and FAL.ai image generation APIs  
✅ Character sheet, texture, and object sheet generation tools  
✅ ALLOWED_TOOLS environment variable for tool filtering  
✅ Comprehensive test suite with unit and integration tests  
✅ Private package with bin entry for npx usage  

---

## Phase 1: 3D Model Generation

### Objectives
- Add 3D model generation capabilities using FAL.ai providers
- Integrate Trellis and Hunyuan3D 2.0 models
- Leverage existing image generation for reference inputs
- Refactor image generation code into reusable helper functions

### Implementation Tasks

#### 1.1 Code Refactoring - Image Generation Helpers
- [ ] Extract image generation logic from tool handlers into helper functions
- [ ] Create `src/providers/imageHelpers.ts` with unified image generation interface
- [ ] Refactor existing tools to use the new helper functions
- [ ] Ensure all existing functionality remains intact
- [ ] Update tests to cover refactored code

#### 1.2 3D Model Provider Integration
- [ ] Research FAL.ai Trellis API endpoints and parameters
- [ ] Research FAL.ai Hunyuan3D 2.0 API endpoints and parameters
- [ ] Add 3D model generation functions to `src/providers/`
- [ ] Handle 3D model file formats (GLB, OBJ, etc.)
- [ ] Implement proper error handling for 3D generation failures

#### 1.3 3D Model Tools Implementation
- [ ] Add `trellis_generate_3d_model` tool schema to `src/index.ts`
- [ ] Add `hunyuan3d_generate_3d_model` tool schema to `src/index.ts`
- [ ] Implement tool handlers with image reference support
- [ ] Support both text prompts and image inputs
- [ ] Add metadata handling for 3D models (dimensions, format, etc.)

#### 1.4 Testing & Documentation
- [ ] Write unit tests for 3D model generation functions
- [ ] Write integration tests with real FAL.ai API calls
- [ ] Update `.env.example` with 3D model documentation
- [ ] Update `AGENTS.md` with 3D model tool usage
- [ ] Update `README.md` with 3D generation examples
- [ ] Test end-to-end workflow: image generation → 3D model generation

### Expected Deliverables
- Two new tools: `trellis_generate_3d_model` and `hunyuan3d_generate_3d_model`
- Refactored image generation helper functions
- Comprehensive test coverage for 3D generation
- Updated documentation and examples

---

## Phase 2: Sprite Sheet Generation

### Objectives
- Create specialized tool for 2D character pixel art generation
- Support both static sprites and animated sprite sheets
- Implement deterministic prompting and formatting
- Provide specific output formats for game development

### Implementation Tasks

#### 2.1 Sprite Generation Research
- [ ] Define standard sprite sheet formats and dimensions
- [ ] Research optimal prompting for pixel art character generation
- [ ] Determine animation frame layouts and naming conventions
- [ ] Plan sprite categories (characters, objects, effects, etc.)

#### 2.2 Sprite Generation Helper Functions
- [ ] Create `src/providers/spriteHelpers.ts`
- [ ] Implement pixel art prompting logic
- [ ] Create sprite sheet layout generators
- [ ] Add animation frame sequencing utilities
- [ ] Implement format validation and metadata generation

#### 2.3 Sprite Sheet Tool Implementation
- [ ] Add `generate_pixel_art_spritesheet` tool schema
- [ ] Support static sprite generation (single frames)
- [ ] Support animated sprite generation (multiple frames)
- [ ] Implement configurable grid layouts (e.g., 4x4, 8x8)
- [ ] Add sprite naming and metadata output

#### 2.4 Advanced Sprite Features
- [ ] Support multiple character poses (idle, walk, jump, attack)
- [ ] Add directional sprites (up, down, left, right)
- [ ] Implement color palette consistency
- [ ] Add sprite sheet optimization options

#### 2.5 Testing & Documentation
- [ ] Write unit tests for sprite generation helpers
- [ ] Write integration tests for sprite sheet generation
- [ ] Create example sprite sheets and documentation
- [ ] Add sprite generation examples to README
- [ ] Test sprite output in common game engines

### Expected Deliverables
- New tool: `generate_pixel_art_spritesheet`
- Comprehensive sprite generation helper library
- Support for static and animated sprite sheets
- Game-ready output formats and documentation

---

## Technical Considerations

### File Management
- [ ] Consider file organization for generated assets (images, 3D models, sprites)
- [ ] Implement cleanup strategies for large generated files
- [ ] Add file format validation and conversion utilities

### Performance & Optimization
- [ ] Monitor API usage and implement rate limiting
- [ ] Consider caching for repeated generation requests
- [ ] Optimize file sizes for generated assets

### Error Handling
- [ ] Standardize error responses across all providers
- [ ] Add retry logic for failed API calls
- [ ] Implement graceful degradation for unavailable services

### Future Enhancements
- [ ] Audio generation capabilities
- [ ] Video generation for animated assets
- [ ] Asset packaging and export tools
- [ ] Integration with popular game engines

---

## Development Notes

### Dependencies to Monitor
- FAL.ai API updates for new 3D models
- Image generation provider improvements
- File format library updates

### Testing Strategy
- Maintain high test coverage (>90%)
- Use mock providers for unit tests
- Run integration tests with real APIs regularly
- Test file generation and validation thoroughly

### Documentation Standards
- Keep AGENTS.md updated with latest tool usage
- Provide clear examples in README.md
- Document all environment variables and configuration options
- Include troubleshooting guides for common issues