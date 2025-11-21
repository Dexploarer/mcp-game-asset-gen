# Environment Setup Guide

This guide covers everything you need to run the MCP Game Asset Generation server and view generated assets.

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation Steps](#installation-steps)
- [API Keys Setup](#api-keys-setup)
- [MCP Client Configuration](#mcp-client-configuration)
- [Running the Server](#running-the-server)
- [Viewing Generated Assets](#viewing-generated-assets)
- [Optional Tools](#optional-tools)
- [Troubleshooting](#troubleshooting)

---

## System Requirements

### Operating Systems
- **macOS** 10.15+ (Catalina or later)
- **Linux** (Ubuntu 20.04+, Debian 11+, Fedora, Arch, etc.)
- **Windows** 10/11 with WSL2 (Windows Subsystem for Linux)

### Required Software
1. **Node.js** 18.x or later (20.x recommended)
   ```bash
   # Check your version
   node --version  # Should show v18.x.x or higher
   ```

2. **npm** 8.x or later (comes with Node.js)
   ```bash
   npm --version  # Should show 8.x.x or higher
   ```

3. **Git** (for cloning the repository)
   ```bash
   git --version
   ```

### Hardware Recommendations
- **RAM**: 4GB minimum, 8GB+ recommended
- **Storage**: 500MB for the server + space for generated assets
- **Network**: Stable internet connection for API calls

---

## Installation Steps

### 1. Install Node.js

#### macOS
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
```

#### Linux (Ubuntu/Debian)
```bash
# Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or using nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

#### Windows (WSL2)
```bash
# Inside WSL2 terminal
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clone the Repository

```bash
git clone https://github.com/Dexploarer/mcp-game-asset-gen.git
cd mcp-game-asset-gen
```

### 3. Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm (faster)
npm install -g pnpm
pnpm install

# Or using yarn
npm install -g yarn
yarn install
```

### 4. Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

---

## API Keys Setup

### Required: AI Gateway API Key (Recommended)

**Get your API key:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to the **AI Gateway** tab
3. Click **API keys** in the left sidebar
4. Click **Create key**
5. Copy your API key

### Alternative: Direct Provider Keys (Legacy)

If you prefer direct API access instead of AI Gateway:

**OpenAI API Key:**
- Visit: https://platform.openai.com/api-keys
- Create an API key
- For: Image generation with GPT-Image-1

**Google Gemini API Key:**
- Visit: https://makersuite.google.com/app/apikey
- Create an API key
- For: Gemini image generation

**FAL.ai API Key:**
- Visit: https://fal.ai/dashboard
- Create an API key
- For: 3D model generation

### Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file
nano .env  # or vim, code, etc.
```

**Minimal Configuration (AI Gateway only):**
```bash
# ===== AI GATEWAY (RECOMMENDED) =====
AI_GATEWAY_API_KEY=your_actual_ai_gateway_api_key_here

# ===== OPTIONAL: 3D Model Generation =====
FAL_AI_API_KEY=your_fal_ai_key_here  # Only if using 3D generation
```

**Full Configuration (All providers):**
```bash
# ===== AI GATEWAY =====
AI_GATEWAY_API_KEY=your_ai_gateway_api_key_here

# ===== LEGACY DIRECT ACCESS =====
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
FAL_AI_API_KEY=your_fal_ai_api_key_here
```

---

## MCP Client Configuration

The MCP server needs an MCP client to communicate with. Popular options:

### Option 1: Claude Desktop (Recommended)

**Install Claude Desktop:**
- macOS: https://claude.ai/download
- Windows: https://claude.ai/download

**Configure MCP Server:**

1. Open Claude Desktop settings
2. Navigate to **Developer** settings
3. Add the MCP server configuration:

**macOS/Linux:**
```json
{
  "mcpServers": {
    "game-asset-gen": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-game-asset-gen/dist/index.js"],
      "env": {
        "AI_GATEWAY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Windows (WSL2):**
```json
{
  "mcpServers": {
    "game-asset-gen": {
      "command": "wsl",
      "args": [
        "node",
        "/mnt/c/path/to/mcp-game-asset-gen/dist/index.js"
      ],
      "env": {
        "AI_GATEWAY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

3. Restart Claude Desktop
4. Verify the server appears in the MCP section

### Option 2: Cline (VS Code Extension)

**Install:**
1. Open VS Code
2. Install the "Cline" extension
3. Configure MCP servers in settings

**Configuration:**
Add to VS Code settings (`.vscode/settings.json`):
```json
{
  "cline.mcpServers": {
    "game-asset-gen": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/absolute/path/to/mcp-game-asset-gen"
    }
  }
}
```

### Option 3: Custom MCP Client

If you're building your own client:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['/path/to/mcp-game-asset-gen/dist/index.js'],
  env: {
    AI_GATEWAY_API_KEY: 'your_api_key_here'
  }
});

const client = new Client({ name: 'my-client', version: '1.0.0' }, {});
await client.connect(transport);

// List available tools
const tools = await client.listTools();

// Call a tool
const result = await client.callTool({
  name: 'hyperscape_generate_weapon',
  arguments: {
    description: 'longsword',
    outputPath: '/tmp/sword.png',
    materialTier: 'mithril'
  }
});
```

---

## Running the Server

### Standalone Mode (Direct Execution)

```bash
# Build and start
npm run build
npm start

# Or in development mode (auto-rebuild)
npm run dev
```

The server will run in stdio mode, waiting for MCP protocol messages on stdin.

### Via MCP Client

When configured in Claude Desktop or another MCP client, the server starts automatically when needed.

**Verify it's running:**
- Claude Desktop: Check MCP section for "game-asset-gen"
- Check Claude's ability to list tools:
  ```
  "Can you list the available game asset generation tools?"
  ```

### Test the Server

```bash
# Run tests
npm test

# Run integration tests (requires API keys)
npm run test:integration

# Check TypeScript compilation
npm run typecheck
```

---

## Viewing Generated Assets

### File System Locations

Generated assets are saved to the paths you specify:

```javascript
// Example tool call
{
  "tool": "hyperscape_generate_weapon",
  "description": "bronze sword",
  "outputPath": "/Users/username/game-assets/sword.png"
}
```

**Recommended Directory Structure:**
```
~/game-assets/
├── characters/
├── weapons/
│   ├── bronze/
│   ├── steel/
│   └── mithril/
├── armor/
├── buildings/
└── resources/
```

### Viewing Tools by Platform

#### macOS
```bash
# Open in Finder
open ~/game-assets/

# View specific image
open ~/game-assets/weapons/sword.png

# Quick Look
qlmanage -p ~/game-assets/weapons/sword.png
```

#### Linux
```bash
# Open file manager
xdg-open ~/game-assets/

# View with image viewer
eog ~/game-assets/weapons/sword.png  # GNOME
gwenview ~/game-assets/weapons/sword.png  # KDE
feh ~/game-assets/weapons/sword.png  # Lightweight
```

#### Windows (WSL2)
```bash
# Open in Windows Explorer
explorer.exe /mnt/c/Users/username/game-assets/

# View image
cmd.exe /c start /mnt/c/Users/username/game-assets/weapons/sword.png
```

### Image Viewers (Recommended)

**macOS:**
- Preview (built-in)
- Pixelmator
- GIMP (free, open-source)

**Linux:**
- GIMP (free, open-source)
- Krita (free, for game art)
- Eye of GNOME (built-in)

**Windows:**
- Windows Photos (built-in)
- Paint.NET (free)
- GIMP (free, open-source)

### 3D Model Viewers

For generated `.glb` files:

**Online Viewers:**
- https://gltf-viewer.donmccurdy.com/
- https://threejs.org/editor/
- https://modelviewer.dev/

**Desktop Software:**
- Blender (free, open-source) - https://www.blender.org/
- Autodesk FBX Review (free)
- Windows 3D Viewer (built-in on Windows 10/11)

**Blender Quick View:**
```bash
# macOS
open -a Blender ~/game-assets/models/character.glb

# Linux
blender ~/game-assets/models/character.glb
```

### Web-Based Asset Gallery (Optional)

Create a simple HTML viewer:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Asset Gallery</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    .asset { display: inline-block; margin: 10px; }
    img { max-width: 200px; border: 1px solid #ccc; }
  </style>
</head>
<body>
  <h1>Generated Assets</h1>
  <div id="gallery"></div>
  <script>
    const assetsDir = 'file:///path/to/game-assets/';
    const assets = [
      'weapons/sword.png',
      'characters/knight.png',
      'armor/helmet.png'
    ];

    const gallery = document.getElementById('gallery');
    assets.forEach(asset => {
      const div = document.createElement('div');
      div.className = 'asset';
      div.innerHTML = `
        <img src="${assetsDir}${asset}" alt="${asset}">
        <p>${asset}</p>
      `;
      gallery.appendChild(div);
    });
  </script>
</body>
</html>
```

---

## Optional Tools

### ImageMagick (For Transparency Conversion)

Some tools support transparent background generation, which requires ImageMagick.

#### Install ImageMagick

**macOS:**
```bash
brew install imagemagick
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install imagemagick
```

**Linux (Fedora):**
```bash
sudo dnf install ImageMagick
```

**Verify installation:**
```bash
convert --version
```

**Enable in .env:**
```bash
# The tools will automatically use ImageMagick if available
# No additional configuration needed
```

### File Watchers (Auto-Refresh)

Monitor generated assets directory for changes:

**macOS/Linux:**
```bash
# Install fswatch
brew install fswatch  # macOS
sudo apt-get install fswatch  # Linux

# Watch directory
fswatch -o ~/game-assets | while read num; do
  echo "Assets updated!"
  # Optionally trigger refresh
done
```

**VS Code Extension:**
- Install "Image Preview" extension
- Auto-refreshes when files change

---

## Troubleshooting

### "Module not found" errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

### "Command not found: node"

```bash
# Check Node.js installation
which node
node --version

# If not installed, see Installation Steps above
```

### "API key not found"

```bash
# Verify .env file exists
ls -la .env

# Check contents (don't commit this file!)
cat .env

# Ensure AI_GATEWAY_API_KEY is set
grep AI_GATEWAY_API_KEY .env
```

### "Permission denied" on generated files

```bash
# Check directory permissions
ls -ld ~/game-assets/

# Fix permissions
chmod -R 755 ~/game-assets/

# Or change ownership
sudo chown -R $USER ~/game-assets/
```

### MCP server not appearing in Claude Desktop

1. Check configuration file location:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Verify JSON syntax:
   ```bash
   # macOS/Linux
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .
   ```

3. Check absolute path is correct:
   ```bash
   # Test the command manually
   node /absolute/path/to/mcp-game-asset-gen/dist/index.js
   ```

4. Restart Claude Desktop completely (Quit, not just close window)

### Images not generating

1. **Check API key validity:**
   ```bash
   # Test AI Gateway connection
   curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://ai-gateway.vercel.sh/v1/ai/models
   ```

2. **Check API quota/credits:**
   - Visit provider dashboard
   - Verify account has credits

3. **Check logs:**
   ```bash
   # Run server with verbose logging
   DEBUG=* npm start
   ```

4. **Test with minimal example:**
   ```javascript
   {
     "tool": "gateway_generate_image",
     "prompt": "simple red circle",
     "outputPath": "/tmp/test.png"
   }
   ```

### Canvas module errors

```bash
# Rebuild canvas module
npm rebuild canvas

# Or reinstall with build tools
npm install --build-from-source canvas
```

### TypeScript compilation errors

```bash
# Clean build
rm -rf dist/
npm run build

# Check TypeScript version
npx tsc --version

# Update if needed
npm install -D typescript@latest
```

---

## Performance Tips

### Optimize for Speed
1. **Use modern styles sparingly** - They take longer to generate
2. **Batch requests** - Generate multiple assets in one session
3. **Use appropriate image sizes** - Don't generate 1024x1024 for small icons

### Reduce Costs
1. **Use AI Gateway** - Automatic cost optimization
2. **Choose efficient models** - Use `gateway_recommend_model` tool
3. **Reuse assets** - Generate base asset, then create variations
4. **Monitor usage** - Check provider dashboards regularly

### Storage Management
```bash
# Compress PNG files (lossless)
find ~/game-assets -name "*.png" -exec optipng {} \;

# Convert to WebP (smaller, modern format)
find ~/game-assets -name "*.png" -exec cwebp -q 90 {} -o {}.webp \;

# Archive old assets
tar -czf game-assets-backup-$(date +%Y%m%d).tar.gz ~/game-assets/
```

---

## Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Project built (`npm run build`)
- [ ] `.env` file created with API keys
- [ ] MCP client installed (Claude Desktop)
- [ ] MCP server configured in client
- [ ] Client restarted
- [ ] Test asset generated successfully
- [ ] Image viewer ready to view assets

---

## Additional Resources

- **MCP Documentation**: https://modelcontextprotocol.io/
- **Claude Desktop**: https://claude.ai/download
- **AI Gateway Docs**: https://vercel.com/docs/ai-gateway
- **Hyperscape Game**: https://github.com/HyperscapeAI/hyperscape
- **Project Issues**: https://github.com/Dexploarer/mcp-game-asset-gen/issues

---

## Getting Help

If you encounter issues:

1. **Check this guide** - Most common issues covered above
2. **Read error messages** - They usually indicate the problem
3. **Check logs** - Run with `DEBUG=*` for verbose output
4. **Search issues** - Others may have had the same problem
5. **Create an issue** - With full error logs and environment details

**When reporting issues, include:**
- Operating system and version
- Node.js version (`node --version`)
- Error message (full output)
- Steps to reproduce
- Expected vs actual behavior
