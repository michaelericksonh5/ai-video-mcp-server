/**
 * MOV conversion helpers.
 * All 9 video generation tools route their result through formatResult() which
 * downloads the MP4 and rewraps it losslessly to a local .mov file via ffmpeg.
 *
 * ffmpeg is sourced in priority order:
 *   1. Managed install at ~/.h5g-ai-video/node_modules/ffmpeg-static/ffmpeg[.exe]
 *   2. System ffmpeg (detected via `where` / `which`)
 *   3. Auto-installed to ~/.h5g-ai-video/ via `npm install ffmpeg-static` on first run
 *
 * No action required from the user — installation is transparent on first use.
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as child_process from "node:child_process";
import type { VideoGenerationResult } from "../types.js";
import { getGeminiKey } from "./keyManager.js";

let _ffmpegChecked = false;
let _ffmpegBin: string | null = null;

async function ensureFfmpegStatic(): Promise<string | null> {
  if (_ffmpegChecked) return _ffmpegBin;
  _ffmpegChecked = true;

  const ext = process.platform === "win32" ? ".exe" : "";
  const managedBin = path.join(
    os.homedir(),
    ".h5g-ai-video",
    "node_modules",
    "ffmpeg-static",
    `ffmpeg${ext}`
  );

  if (fs.existsSync(managedBin)) {
    _ffmpegBin = managedBin;
    return _ffmpegBin;
  }

  // Quick check for system ffmpeg
  try {
    const sysCmd = process.platform === "win32" ? "where.exe" : "which";
    const sysOut = child_process
      .execFileSync(sysCmd, ["ffmpeg"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .trim();
    const sysPath = sysOut.split("\n")[0].trim();
    if (sysPath && fs.existsSync(sysPath)) {
      _ffmpegBin = sysPath;
      return _ffmpegBin;
    }
  } catch {
    // ffmpeg not in system PATH — proceed to auto-install
  }

  // Auto-install ffmpeg-static to ~/.h5g-ai-video (one-time, ~50 MB)
  process.stderr.write(
    "[ai-video] First video: installing ffmpeg-static (~50 MB) to ~/.h5g-ai-video — one-time only...\n"
  );

  const ffmpegDir = path.join(os.homedir(), ".h5g-ai-video");
  try {
    fs.mkdirSync(ffmpegDir, { recursive: true });
    const pkgPath = path.join(ffmpegDir, "package.json");
    if (!fs.existsSync(pkgPath)) {
      fs.writeFileSync(
        pkgPath,
        JSON.stringify({ name: "h5g-ai-video-ffmpeg", version: "1.0.0", private: true }, null, 2)
      );
    }

    await new Promise<void>((resolve, reject) => {
      const proc = child_process.spawn("npm", ["install", "ffmpeg-static", "--no-save"], {
        cwd: ffmpegDir,
        stdio: ["ignore", "pipe", "pipe"],
        shell: process.platform === "win32",
      });
      proc.stderr?.on("data", (d: Buffer) => process.stderr.write(d));
      proc.on("close", (code) =>
        code === 0 ? resolve() : reject(new Error(`npm install exited with code ${code}`))
      );
      proc.on("error", reject);
    });

    if (fs.existsSync(managedBin)) {
      _ffmpegBin = managedBin;
      process.stderr.write("[ai-video] ffmpeg-static installed successfully\n");
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    process.stderr.write(`[ai-video] ffmpeg-static install failed: ${msg}\n`);
  }

  return _ffmpegBin;
}

async function downloadVideo(url: string, destPath: string, provider: string): Promise<void> {
  const headers: Record<string, string> = {};
  let fetchUrl = url;

  if (provider === "gemini") {
    const key = getGeminiKey();
    if (key) headers["x-goog-api-key"] = key;
    if (!url.includes("alt=")) {
      fetchUrl = url + (url.includes("?") ? "&" : "?") + "alt=media";
    }
  }

  const response = await fetch(fetchUrl, { headers });
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
}

function slugifyPrompt(prompt: string | undefined): string | null {
  if (!prompt) return null;
  const slug = prompt
    .trim()
    .slice(0, 50)
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return slug || null;
}

async function rewrapToMov(result: VideoGenerationResult, prompt?: string): Promise<string | null> {
  const ffmpegBin = await ensureFfmpegStatic();
  if (!ffmpegBin) return null;

  const outDir = path.join(os.homedir(), ".h5g-ai-video", "output");
  fs.mkdirSync(outDir, { recursive: true });

  const slug = slugifyPrompt(prompt) ?? (result.model ?? "video").replace(/[^a-z0-9_-]/gi, "_").slice(0, 40);
  const ts = Date.now();
  const mp4Path = path.join(outDir, `${slug}_${ts}_tmp.mp4`);
  const movPath = path.join(outDir, `${slug}_${ts}.mov`);

  try {
    await downloadVideo(result.video.url, mp4Path, result.provider);

    await new Promise<void>((resolve, reject) => {
      child_process.execFile(
        ffmpegBin,
        ["-i", mp4Path, "-c", "copy", "-y", movPath],
        { timeout: 120000 },
        (err) => (err ? reject(new Error(`ffmpeg: ${err.message}`)) : resolve())
      );
    });

    return movPath;
  } finally {
    try { fs.unlinkSync(mp4Path); } catch { /* ignore cleanup errors */ }
  }
}

export async function formatResult(result: VideoGenerationResult, prompt?: string): Promise<string> {
  let movPath: string | null = null;
  let movNote = "";

  try {
    movPath = await rewrapToMov(result, prompt);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    movNote = ` (MOV conversion failed: ${msg})`;
  }

  const lines: string[] = [
    `✅ Video generated successfully!`,
    ``,
    `**Provider**: ${result.provider === "fal" ? "fal.ai" : "Google Gemini"}`,
    `**Model**: ${result.model}`,
  ];

  if (movPath) {
    lines.push(`**Saved to**: ${movPath}`);
  } else {
    lines.push(`**Video URL**: ${result.video.url}${movNote}`);
  }

  if (result.video.file_size)
    lines.push(`**File size**: ${(result.video.file_size / 1024 / 1024).toFixed(1)} MB`);
  if (result.video.width && result.video.height)
    lines.push(`**Resolution**: ${result.video.width}×${result.video.height}`);
  if (result.video.duration) lines.push(`**Duration**: ${result.video.duration}s`);
  if (result.video.fps) lines.push(`**FPS**: ${result.video.fps}`);
  if (result.seed !== undefined) lines.push(`**Seed**: ${result.seed}`);
  if (result.request_id) lines.push(`**Request ID**: ${result.request_id}`);

  lines.push(``);
  if (movPath) {
    lines.push(`Video saved to: ${movPath}`);
    lines.push(`Source URL: ${result.video.url}`);
  } else {
    lines.push(`Download or open: ${result.video.url}`);
  }

  return lines.join("\n");
}
