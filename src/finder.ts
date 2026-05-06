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

function ideDirName(): string {
    const appName = vscode.env.appName.toLowerCase();
    if (appName.includes('cursor')) return '.cursor';
    if (appName.includes('antigravity')) return '.antigravity';
    return '.vscode';
}

function extDirsForHome(home: string): string[] {
    const d = ideDirName();
    return [
        path.join(home, d, 'extensions'),
        path.join(home, `${d}-server`, 'extensions'),
    ];
}

async function searchDir(dir: string): Promise<ExtInfo[]> {
    if (!(await exists(dir))) return [];
    let entries: string[];
    try { entries = await fs.readdir(dir); } catch { return []; }

    const found: ExtInfo[] = [];
    for (const name of entries.filter(n => n.startsWith('anthropic.claude-code-')).sort()) {
        const cssPath = path.join(dir, name, 'webview', 'index.css');
        const jsPath  = path.join(dir, name, 'webview', 'index.js');
        if (!(await exists(cssPath))) continue;
        found.push({ name, cssPath, jsPath: (await exists(jsPath)) ? jsPath : null });
    }
    return found;
}

export async function findClaudeExtensions(): Promise<ExtInfo[]> {
    const homes: string[] = [];

    if (process.platform === 'win32') {
        const up = process.env.USERPROFILE;
        if (up) homes.push(up);
    } else {
        homes.push(os.homedir());
    }

    const allDirs = homes.flatMap(extDirsForHome);
    const results = await Promise.all(allDirs.map(searchDir));
    return results.flat();
}
