# How to add this plugin to your claude-plugins marketplace

In your `michaelericksonh5/claude-plugins` repo, update `.claude-plugin/marketplace.json`
by adding this entry to the `plugins` array:

```json
{
  "name": "veo-video-generator",
  "description": "AI video generation — Veo 3.1 (fal.ai + Gemini), Happy Horse, Seedance 2.0. Text-to-video, image-to-video, first+last frame, reference images, video extension.",
  "source": "https://github.com/michaelericksonh5/veo-video-mcp-server",
  "version": "1.0.0",
  "tags": ["video", "ai", "veo", "veo3.1", "fal-ai", "gemini", "happy-horse", "seedance", "image-to-video"]
}
```

Users can then install via:
```
/plugin marketplace add https://github.com/michaelericksonh5/claude-plugins
/plugin install veo-video-generator
```
