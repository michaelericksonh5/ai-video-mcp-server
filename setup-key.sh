#!/usr/bin/env bash
# AI Video Generator -- Secure API Key Setup (Mac/Linux)
# Run: bash setup-key.sh [fal|gemini|both]
# Your key is read with -s (silent) so it never appears in the terminal.

set -euo pipefail

PROVIDER="${1:-fal}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_PATH="$SCRIPT_DIR/dist/index.js"

# Find Claude config path
if [[ "$OSTYPE" == "darwin"* ]]; then
    CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
else
    CONFIG_PATH="$HOME/.config/Claude/claude_desktop_config.json"
fi

echo ""
echo "=== AI Video Generator -- API Key Setup ==="
echo ""

FAL_KEY=""
GEMINI_KEY=""

if [[ "$PROVIDER" == "fal" || "$PROVIDER" == "both" ]]; then
    echo "Get your fal.ai key at: https://fal.ai/dashboard/keys"
    printf "FAL_KEY (starts with key_, hidden): "
    read -rs FAL_KEY
    echo ""
    if [[ ! "$FAL_KEY" == key_* ]]; then
        echo "Warning: fal.ai keys usually start with 'key_' -- double-check your key."
    fi
fi

if [[ "$PROVIDER" == "gemini" || "$PROVIDER" == "both" ]]; then
    echo "Get your Gemini key at: https://aistudio.google.com/app/apikey"
    printf "GEMINI_API_KEY (hidden): "
    read -rs GEMINI_KEY
    echo ""
fi

echo ""
echo "Updating Claude Desktop config..."

# Create config dir if missing
mkdir -p "$(dirname "$CONFIG_PATH")"

# Load existing config or start fresh
if [[ -f "$CONFIG_PATH" ]]; then
    EXISTING=$(cat "$CONFIG_PATH")
else
    EXISTING='{"mcpServers":{}}'
fi

# Build env JSON
ENV_JSON="{"
SEP=""
if [[ -n "$FAL_KEY" ]]; then
    ENV_JSON+="${SEP}\"FAL_KEY\":\"$FAL_KEY\""
    SEP=","
fi
if [[ -n "$GEMINI_KEY" ]]; then
    ENV_JSON+="${SEP}\"GEMINI_API_KEY\":\"$GEMINI_KEY\""
fi
ENV_JSON+="}"

# Use python3 to safely merge JSON
python3 - "$CONFIG_PATH" "$DIST_PATH" "$ENV_JSON" "$EXISTING" << 'PYEOF'
import sys, json

config_path = sys.argv[1]
dist_path = sys.argv[2]
env_json = json.loads(sys.argv[3])
existing_json = sys.argv[4]

try:
    config = json.loads(existing_json)
except:
    config = {}

if "mcpServers" not in config:
    config["mcpServers"] = {}

config["mcpServers"]["ai-video"] = {
    "command": "node",
    "args": [dist_path],
    "env": env_json
}

with open(config_path, "w") as f:
    json.dump(config, f, indent=2)

print("Config saved to:", config_path)
PYEOF

# Clear keys from shell memory
unset FAL_KEY GEMINI_KEY

echo ""
echo "Done! Next steps:"
echo "  1. Restart Claude Desktop"
echo "  2. Ask Claude: 'Check my video API keys'"
echo ""
echo "SECURITY: Your key was never displayed or written to any log."
