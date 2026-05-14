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

## Install via the H5G Marketplace

The easiest way to install this plugin — along with the slot art creator and skill auditor — is through the shared High 5 Games marketplace:

```
/plugin marketplace add https://github.com/michaelericksonh5/claude-plugins
/plugin install ai-video-generator@h5g-plugins
```

---

## Set up your API keys

After installing, run the setup script once from a terminal in the plugin directory:

**Windows (PowerShell):**
```powershell
.\setup-key.ps1
```

**Mac / Linux:**
```bash
./setup-key.sh
```

The script writes your keys to `~/.claude/settings.json` under the `"env"` key — the official Claude Code mechanism for plugin keys. Keys written there are automatically shared across every plugin in the H5G marketplace. If you already set `FAL_KEY` or `GEMINI_API_KEY` through the slot art creator setup, you're already done.

**fal.ai key:** https://fal.ai/dashboard/keys — supports all models (Veo 3.1, Happy Horse, Seedance 2.0)  
**Gemini key:** https://aistudio.google.com/app/apikey — Veo 3.1 only; requires the paid Gemini API tier

> **Security:** Never paste your API key into Claude's chat. The setup script uses hidden input so your key is never visible on screen.

---

## Usage

Just talk to Claude naturally:

- *"Make an 8-second cinematic video of a wolf running through a snowy forest"*
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
