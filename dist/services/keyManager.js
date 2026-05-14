/**
 * Key Manager — reads API keys from environment variables only.
 * Keys are NEVER logged, stored in files, or returned to callers in plain text.
 */
export function getFalKey() {
    return process.env.FAL_KEY;
}
export function getGeminiKey() {
    return process.env.GEMINI_API_KEY;
}
export function getApiKeyStatus() {
    const falKey = getFalKey();
    const geminiKey = getGeminiKey();
    let activeProvider = "none";
    if (falKey)
        activeProvider = "fal";
    else if (geminiKey)
        activeProvider = "gemini";
    return {
        fal_configured: Boolean(falKey),
        gemini_configured: Boolean(geminiKey),
        active_provider: activeProvider,
    };
}
/**
 * Resolve which provider to use.
 * If the caller requests a specific provider, use that (and error if key missing).
 * If "auto", prefer fal.ai then gemini.
 */
export function resolveProvider(requested) {
    if (requested === "fal" || requested === "auto") {
        const key = getFalKey();
        if (key)
            return { provider: "fal", key };
        if (requested === "fal") {
            throw new Error("fal.ai API key not configured. Run the setup_api_key tool or set FAL_KEY in your environment.");
        }
    }
    if (requested === "gemini" || requested === "auto") {
        const key = getGeminiKey();
        if (key)
            return { provider: "gemini", key };
        if (requested === "gemini") {
            throw new Error("Gemini API key not configured. Run the setup_api_key tool or set GEMINI_API_KEY in your environment.");
        }
    }
    throw new Error("No API key configured. Run the setup_api_key tool to get started.\n" +
        "You need either a fal.ai key (FAL_KEY) or a Google Gemini key (GEMINI_API_KEY).");
}
//# sourceMappingURL=keyManager.js.map