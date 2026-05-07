# Claude Code RTL – Hebrew, Arabic & Persian Support

[![Version](https://img.shields.io/visual-studio-marketplace/v/Sapphify.claude-rtl-auto?style=flat&label=version&color=4da6ff)](https://marketplace.visualstudio.com/items?itemName=Sapphify.claude-rtl-auto)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/Sapphify.claude-rtl-auto?style=flat&color=4da6ff)](https://marketplace.visualstudio.com/items?itemName=Sapphify.claude-rtl-auto)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/Sapphify.claude-rtl-auto?style=flat&color=4da6ff)](https://marketplace.visualstudio.com/items?itemName=Sapphify.claude-rtl-auto)

**RTL (Right-to-Left) support for Hebrew, Arabic and Persian in Claude Code. Fixes text direction in VS Code, Cursor and Antigravity AI chat.**

![RTL toggle demo](https://raw.githubusercontent.com/Ziondido/claude-code-rtl/master/images/demo-animated.gif)

---

## Why this extension

| Feature | Claude Code RTL (this) | Other RTL extensions |
|---|---|---|
| Toggle button **inside the chat** | ✅ | ❌ status bar or command palette |
| No forced window reload | ✅ | ❌ reload required to toggle |
| Per-bubble auto-detection | ✅ | varies |
| Works in Cursor IDE | ✅ | sometimes |
| Input field follows RTL state | ✅ | rarely |
| State remembered across sessions | ✅ | varies |

---

## How it works

1. Detects Hebrew / Arabic / Persian text automatically per chat bubble
2. Applies correct direction and alignment — mixed conversations work naturally
3. Code blocks, tool output and thinking sections stay LTR regardless
4. The **⇄** toggle button lives directly in the Claude Code chat header

| RTL Off | RTL On |
|---|---|
| ![RTL Off](https://raw.githubusercontent.com/Ziondido/claude-code-rtl/master/images/01-rtl-off.png) | ![RTL On](https://raw.githubusercontent.com/Ziondido/claude-code-rtl/master/images/02-rtl-on.png) |

---

## Install

1. Install from the marketplace
2. A one-time notification asks to reload — click **Reload**
3. The ⇄ button appears in the Claude Code chat header

No settings, no configuration files.

## Usage

Click **⇄** in the Claude Code header to toggle RTL on/off.

- **Blue ⇄** — RTL active, auto-detection running
- **Grey ⇄** — RTL inactive, all text flows LTR

State persists across sessions via localStorage.

## Requirements

[Claude Code](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code) must be installed.

## Supported languages

Hebrew · Arabic · Persian (Farsi) · Any Unicode RTL script

## Supported IDEs

VS Code · Cursor · Antigravity
