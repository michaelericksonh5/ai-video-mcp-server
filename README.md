# AI Video Generator — Claude Plugin

AI video generation for Claude using **Veo 3.1**, **Happy Horse**, and **Seedance 2.0**.

Works with **fal.ai** API keys and **Google Gemini** API keys.

---

## What it can do

| Capability | fal.ai | Gemini |
|---|---|---|
| Text → Video (Veo 3.1) | ✅ | ✅ |
| Image → Video (Veo 3.1) | ✅ | ✅ |
| First + Last Frame → Video | ✅ | ✅ |
| Reference Images → Video | ✅ | ✅ |
| Extend Video | ✅ | ✅ (720p only) |
| Happy Horse Image → Video | ✅ | — |
| Happy Horse Reference → Video | ✅ | — |
| Seedance 2.0 Image → Video | ✅ | — |
| Seedance 2.0 Reference → Video | ✅ | — |

**Resolutions:** 720p, 1080p, 4K  
**Aspect ratios:** 16:9, 9:16, 1:1, 4:3, 21:9 (model-dependent)  
**Duration:** 4–15 seconds  
**Audio:** natively generated (fal.ai / Seedance)

---

## Install as a Claude Plugin

```bash
/plugin install https://github.com/michaelericksonh5/veo-video-mcp-server
```

Then configure your API key (see below).

---

## Manual Setup

### 1. Clone and build

```bash
git clone https://github.com/michaelericksonh5/veo-video-mcp-server
cd veo-video-mcp-server
npm install
npm run build
```

### 2. Configure your API key (safely)

**Option A — fal.ai key** (supports all models):
```bash
# Get your key at https://fal.ai/dashboard/keys
export FAL_KEY="your-key-here"
```

**Option B — Google Gemini key** (Veo 3.1 only, paid tier required):
```bash
# Get your key at https://aistudio.google.com/app/apikey
export GEMINI_API_KEY="your-key-here"
```

> **Security:** Never paste your key into Claude's chat. Always set it as an environment variable or in the Claude Desktop config's `env` block.

### 3. Add to Claude Desktop config

Edit `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "veo-video": {
      "command": "node",
      "args": ["/absolute/path/to/veo-video-mcp-server/dist/index.js"],
      "env": {
        "FAL_KEY": "your-fal-key-here"
      }
    }
  }
}
```

---

## Usage

Just talk to Claude naturally:

- *"Make a 8-second cinematic video of a wolf running through a snowy forest"*
- *"Animate this photo"* (drop an image)
- *"Generate a video that starts with [image1] and ends with [image2]"*
- *"Extend this video: [URL]"*
- *"Use Happy Horse to animate my portrait"*
- *"Make a Seedance video with my character reference"*

Claude will ask for any missing details (resolution, aspect ratio, etc.) and guide you through the process.

---

## Available MCP Tools

| Tool | Description |
|---|---|
| `veo_check_api_keys` | Check which keys are configured (never shows key values) |
| `veo_setup_api_key` | Get safe setup instructions for fal.ai or Gemini |
| `veo_upload_file` | Upload a local image/video to fal.ai storage |
| `veo_generate_video` | Text → video (Veo 3.1) |
| `veo_image_to_video` | Image → video (Veo 3.1) |
| `veo_first_last_frame_to_video` | Two frames → video (Veo 3.1) |
| `veo_reference_to_video` | Reference images → video (Veo 3.1) |
| `veo_extend_video` | Extend an existing video (Veo 3.1) |
| `veo_happy_horse_image_to_video` | Image → video (Happy Horse / Alibaba) |
| `veo_happy_horse_reference_to_video` | Reference images → video (Happy Horse / Alibaba) |
| `veo_seedance_image_to_video` | Image → video with optional end frame (Seedance 2.0) |
| `veo_seedance_reference_to_video` | Multi-modal reference → video (Seedance 2.0) |

---

## License

MIT — built by [@michaelericksonh5](https://github.com/michaelericksonh5)
