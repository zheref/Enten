#!/usr/bin/env bash
# switch-theme.sh — Toggle between light and dark Chrome theme variants.
#
# Usage:
#   ./switch-theme.sh light    Restores the light-mode manifest from git HEAD.
#   ./switch-theme.sh dark     Copies manifest-dark.json → manifest.json.
#
# After switching, open chrome://extensions and click the reload (↺) icon
# next to your theme to apply the change instantly.
#
# Note: Do NOT commit manifest.json while it's in dark mode.
# The git-tracked manifest.json is always the light-mode source of truth.
# Use `git checkout -- manifest.json` to reset manually if needed.

set -euo pipefail

DARK_SRC="manifest-dark.json"
ACTIVE="manifest.json"

case "${1:-}" in

  light)
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
      echo "Error: not inside a git repo. Copy your original manifest-light.json manually."
      exit 1
    fi
    git checkout -- "$ACTIVE"
    echo "✓  Light mode activated (restored from git HEAD)."
    echo "   → Reload the extension at chrome://extensions"
    ;;

  dark)
    if [[ ! -f "$DARK_SRC" ]]; then
      echo "Error: $DARK_SRC not found."
      exit 1
    fi
    cp "$DARK_SRC" "$ACTIVE"
    echo "✓  Dark mode activated."
    echo "   → Reload the extension at chrome://extensions"
    ;;

  *)
    echo "Usage: ./switch-theme.sh [light|dark]"
    echo ""
    echo "  light  — restore light mode (git checkout -- manifest.json)"
    echo "  dark   — activate dark mode  (copies manifest-dark.json)"
    ;;

esac
