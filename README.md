# Claude Code RTL – Hebrew, Arabic & Persian Support

**Toggle RTL instantly from inside the chat — no reload, no config.**

| RTL Off | RTL On |
|---|---|
| ![RTL Off](https://raw.githubusercontent.com/Ziondido/claude-code-rtl/master/images/01-rtl-off.png) | ![RTL On](https://raw.githubusercontent.com/Ziondido/claude-code-rtl/master/images/02-rtl-on.png) |

Adds automatic Right-to-Left support for Hebrew, Arabic and Persian to [Claude Code](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code) in VS Code, Cursor and Antigravity.

## Why this extension

| Feature | Claude Code RTL (this) | Other RTL extensions |
|---|---|---|
| Toggle button **inside the chat** | ✅ | ❌ status bar or command palette |
| No forced window reload | ✅ | ❌ reload required to toggle |
| Per-bubble auto-detection | ✅ | varies |
| Works in Cursor IDE | ✅ | sometimes |
| Input field follows RTL state | ✅ | rarely |
| State remembered across sessions | ✅ | varies |

## How it works

1. Detects Hebrew / Arabic / Persian text automatically per chat bubble
2. Applies correct direction and alignment — mixed conversations work naturally
3. Code blocks, tool output and thinking sections stay LTR regardless
4. The **⇄** toggle button lives directly in the Claude Code chat header

## Requirements

- [Claude Code extension](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code) must be installed

## Install

1. Install this extension from the marketplace
2. A one-time notification will ask to reload — click **Reload**
3. The ⇄ button appears in the Claude Code chat header

That's it. No settings, no configuration files.

## Usage

Click **⇄** in the Claude Code header to toggle RTL on/off.

- **Blue (⇄)** — RTL active, auto-detection running
- **Grey (⇄)** — RTL inactive, all text flows LTR

State is saved in localStorage and persists across sessions.

## Supported languages

Hebrew · Arabic · Persian (Farsi) · Any Unicode RTL script

## Supported IDEs

VS Code · Cursor · Antigravity

## How it works under the hood

The extension injects a small CSS + JavaScript snippet into Claude Code's webview files. The JS uses a `MutationObserver` to watch for new messages and applies the `.YBYrtl` CSS class to bubbles that contain RTL text. Backups of the original files are kept — uninstalling restores them.
