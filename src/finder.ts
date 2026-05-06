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

async function isWsl(): Promise<boolean> {
    try {
        const v = await fs.readFile('/proc/version', 'utf-8');
        return v.toLowerCase().includes('microsoft');
    } catch { return false; }
}

async function wslWindowsHomes(): Promise<string[]> {
    const homes: string[] = [];
    const skip = new Set(['public', 'default', 'default user', 'all users']);
    for (const drive of ['c', 'd']) {
        const usersDir = `/mnt/${drive}/Users`;
        try {
            const entries = await fs.readdir(usersDir);
            for (const entry of entries) {
                if (skip.has(entry.toLowerCase())) continue;
                const p = path.join(usersDir, entry);
                try { if ((await fs.stat(p)).isDirectory()) homes.push(p); } catch { /* skip */ }
            }
        } catch { /* drive not mounted */ }
    }
    return homes;
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
        if (await isWsl()) {
            homes.push(...await wslWindowsHomes());
        }
    }

    const allDirs = homes.flatMap(extDirsForHome);
    const results = await Promise.all(allDirs.map(searchDir));
    return results.flat();
}
