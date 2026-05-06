import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as vscode from 'vscode';

export interface ExtInfo {
    name: string;
    cssPath: string;
    jsPath: string | null;
}

async function exists(p: string): Promise<boolean> {
    try { await fs.access(p); return true; } catch { return false; }
}

function extDirs(home: string): string[] {
    const appName = vscode.env.appName.toLowerCase();
    const ide = appName.includes('cursor') ? 'cursor'
              : appName.includes('antigravity') ? 'antigravity'
              : 'vscode';
    const dot: Record<string, string> = {
        vscode: '.vscode', cursor: '.cursor', antigravity: '.antigravity',
    };
    const d = dot[ide];
    return [
        path.join(home, d, 'extensions'),
        path.join(home, `${d}-server`, 'extensions'),
    ];
}

export async function findClaudeExtensions(): Promise<ExtInfo[]> {
    const home = os.homedir();
    const searchDirs = extDirs(home);
    const found: ExtInfo[] = [];

    for (const dir of searchDirs) {
        if (!(await exists(dir))) continue;
        let entries: string[];
        try { entries = await fs.readdir(dir); } catch { continue; }

        for (const name of entries.filter(n => n.startsWith('anthropic.claude-code-')).sort()) {
            const cssPath = path.join(dir, name, 'webview', 'index.css');
            const jsPath  = path.join(dir, name, 'webview', 'index.js');
            if (!(await exists(cssPath))) continue;
            found.push({
                name,
                cssPath,
                jsPath: (await exists(jsPath)) ? jsPath : null,
            });
        }
    }

    return found;
}
