---
name: veo-video-generator
description: >
  AI video generation using Veo 3.1, Happy Horse, and Seedance 2.0. Use this skill whenever the
  user wants to CREATE or GENERATE a video using AI -- from a text prompt, by animating an image,
  transitioning between two frames, using reference images, or extending an existing video clip.
  Trigger on: "make a video", "generate a video", "animate this image/photo", "make my photo move",
  "animate between these two images", "extend this video", "continue this clip", "use this as a
  reference image for a video", or any mention of Veo, Veo 3.1, fal.ai video, Gemini video,
  Happy Horse, Seedance, image-to-video, text-to-video. Also trigger for API key setup questions
  like "how do I set up my fal.ai key" or "configure my Gemini key for video".
  Do NOT trigger for: video editing (subtitles, format conversion, compression, ffmpeg), video
  transcription, generating images only (without video), or research/comparison questions about
  video models. Always handle file uploads, key checks, and routing to the correct MCP tool.
---

# Veo Video Generator Skill

This skill orchestrates AI video generation across multiple models and providers.
It handles the full workflow: clarify -> upload files -> generate -> return video URL.

## Available Models

| Model | Provider | Best For |
|---|---|---|
| Veo 3.1 text-to-video | fal.ai or Gemini | Any scene from a text prompt |
| Veo 3.1 image-to-video | fal.ai or Gemini | Animate a photo as the starting frame |
| Veo 3.1 first+last frame | fal.ai or Gemini | Transition between two images |
| Veo 3.1 reference-to-video | fal.ai or Gemini | Keep a character/subject consistent across the video |
| Veo 3.1 extend-video | fal.ai ONLY | Continue/lengthen an existing video |
| Happy Horse image-to-video | fal.ai only | Bring a photo to life (portraits, products) |
| Happy Horse reference-to-video | fal.ai only | Multi-character scenes, up to 9 reference images |
| Seedance 2.0 image-to-video | fal.ai only | Image to video with optional ending frame + audio |
| Seedance 2.0 reference-to-video | fal.ai only | Multi-modal references (images + video + audio) |

## Step 1: Check API Keys First

Before doing anything else, call `veo_check_api_keys` to confirm a key is configured.
If no key is configured, call `veo_setup_api_key` with the appropriate provider and show
the user the instructions. Do not attempt generation without a key.

## Step 2: Handle File Uploads

If the user drops or mentions a local image or video file:
1. Call `veo_upload_file` with the absolute path to that file
2. Use the returned URL in the generation call
3. Tell the user the file was uploaded and you're generating the video

If the user provides a public URL (https://...), use it directly -- no upload needed.

## Step 3: Determine What to Build

Read the user's request and map it to the right tool:

| User says... | Use this tool |
|---|---|
| "Make a video of..." / "Generate a video" / just a text prompt | `veo_generate_video` |
| "Animate this image" / "Make my photo move" / drops an image | `veo_image_to_video` |
| "Animate between these two images" / "Start with X end with Y" | `veo_first_last_frame_to_video` |
| "Use this as a reference" / "Keep the character consistent" | `veo_reference_to_video` |
| "Extend this video" / "Continue this clip" / "Make it longer" | `veo_extend_video` |
| "Happy Horse" / "Alibaba model" | `veo_happy_horse_image_to_video` or `veo_happy_horse_reference_to_video` |
| "Seedance" / "ByteDance model" / has ending frame or audio refs | `veo_seedance_image_to_video` or `veo_seedance_reference_to_video` |

## Step 4: Clarify Missing Parameters

Don't ask everything at once. Only ask about parameters the user hasn't specified that
genuinely change the output. Ask at most 2-3 things in one message.

**Always clarify if missing:**
- For image/reference/frame tools: the image URL(s) -- essential, can't proceed without it
- For extend video: the video URL -- essential

**Ask if unclear, but use defaults otherwise:**
- Resolution: default 720p. Only ask if they mention "4K", "high quality", or "1080p"
- Aspect ratio: default 16:9 (landscape). Ask if video is clearly meant to be portrait/vertical
- Duration: default 8s. Only ask if they want something specific
- Audio: default ON. Only ask if they mention music, silence, or sound
- Model: default Veo 3.1 via auto-provider. Only ask if they name a specific model

**Never ask about:**
- safety_tolerance (use default 4)
- auto_fix (use default true)
- seed (omit unless they ask for reproducibility)
- provider (use "auto" unless they specify fal.ai or Gemini)

## Step 5: Generate and Return

Call the appropriate tool. While it's running, tell the user generation is in progress --
Veo videos take 2-5 minutes, so reassure them it's working.

When done, share:
1. The video URL (linked and prominent)
2. Key details: model used, resolution, duration
3. A brief one-liner about what was generated

## Prompting Guidance

If the user's prompt is vague (e.g. "make a cool video"), help them improve it before generating.
A good Veo prompt includes:

- **Subject**: what/who is in it
- **Context**: background or setting  
- **Action**: what's happening
- **Style**: cinematic, noir, cartoon, documentary, etc.
- **Camera** (optional): aerial shot, tracking shot, close-up
- **Ambiance** (optional): golden hour, neon-lit, foggy

For dialogue, include it in quotes inside the prompt:
> "A reporter says: 'Breaking news -- Veo 3.1 has arrived.'"

For Happy Horse multi-character scenes, remind the user to use `character1`, `character2`, etc.
For Seedance reference-to-video, remind the user to use `@Image1`, `@Video1`, etc.

## Error Handling

- **No key configured**: Call `veo_setup_api_key` and show instructions
- **File not found**: Ask user to confirm the path or drag the file into the conversation  
- **Safety filter block**: Suggest rephrasing; the model won't generate certain content
- **Timeout**: Let the user know generation can take up to 10 min; offer to retry
- **Video extension requires fal.ai**: If the user has only a Gemini key and wants to extend a video, explain that Gemini API video extension is not supported via REST -- it requires Google Cloud Storage, Vertex AI OAuth credentials, and allowlist approval. Recommend getting a fal.ai key instead.

## Example Flows

**"Make a video of a fox jumping through autumn leaves, cinematic"**
-> Check keys -> call `veo_generate_video` with the prompt, 16:9, 8s, 720p -> return URL

**User drops photo.jpg and says "animate this"**
-> Check keys -> `veo_upload_file("/path/to/photo.jpg")` -> `veo_image_to_video` with the URL -> return URL

**"I want a video that starts with this image and ends with that image"**
-> Check keys -> upload both if local -> `veo_first_last_frame_to_video` -> return URL

**"Extend this video: https://example.com/clip.mp4"**  
