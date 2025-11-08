# AGENTS.md

This file contains instructions for future agents working on this MCP server project.

## Development Workflow

### Testing
- Run unit tests with `npm test` (uses `vitest run` for non-watch mode, mocked providers)
- Run integration tests with `npm run test:integration` (calls real APIs, requires API keys, keeps generated images)
- Run integration tests with cleanup: `npm run test:integration:cleanup` (calls real APIs and deletes test images)
- Run all tests with `npm run test:all`
- Tests are located in `src/` with `*.test.ts` extension
- Integration tests are in `src/integration.test.ts`
- Generated test images are saved to `test_assets/` (gitignored)
- All new functionality should include comprehensive tests
- Mock external dependencies (API calls, file system operations) in unit tests
- Integration tests use real providers when `NO_MOCK_PROVIDERS` environment variable is set
- Set `CLEANUP_TEST_FILES=true` to delete generated test images after integration tests

### Type Checking
- Always run `npm run typecheck` before committing
- TypeScript configuration is in `tsconfig.json`
- Strict mode is enabled

### Building
- Build with `npm run build` (compiles to `dist/`)
- Development mode: `npm run dev` (builds and starts)
- Production: `npm run start` (runs from `dist/`)

### Linting
- Run `npm run lint` to check code style
- ESLint configuration for TypeScript

## Project Structure

```
src/
├── index.ts              # Main MCP server entry point
├── utils/
│   └── imageUtils.ts     # Utility functions for image processing
├── providers/
│   └── imageProviders.ts # Image generation provider implementations
└── *.test.ts            # Test files
```

## Adding New Tools

1. Implement provider functions in `src/providers/`
2. Add tool schema to `ListToolsRequestSchema` in `src/index.ts`
3. Add tool handler in `CallToolRequestSchema` in `src/index.ts`
4. Import the new functions at the top of `src/index.ts`
5. Write comprehensive tests in `src/*.test.ts`
6. Run `npm run typecheck` and `npm test` before committing

## Environment Variables

Required environment variables:
- `OPENAI_API_KEY` - OpenAI API key for image generation
- `GEMINI_API_KEY` - Google Gemini API key
- `FAL_AI_API_KEY` - FAL.ai API key

Optional environment variables:
- `ALLOWED_TOOLS` - Comma-separated list of tools to make available (default: all tools)
- `CLEANUP_TEST_FILES` - Set to 'true' to delete test images after integration tests (default: false)

## MCP Server Architecture

- Uses `@modelcontextprotocol/sdk`
- Supports tools and prompts
- Error handling returns structured responses
- All tools return JSON strings with metadata
- Tool filtering via `ALLOWED_TOOLS` environment variable for reduced context usage

## Testing Guidelines

- Mock external dependencies (API calls, file system operations) in unit tests
- Test both success and error scenarios
- Test environment variable validation
- Use `vi.mock()` for module mocking
- Test tool schema validation indirectly through function calls
- Test `ALLOWED_TOOLS` filtering functionality in unit tests

## Commit Process

1. Make changes
2. Run `npm run typecheck`
3. Run `npm test`
4. Run `npm run lint`
5. Commit with descriptive message
6. Build should pass automatically