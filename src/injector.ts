import * as fs from 'fs/promises';
import { ExtInfo } from './finder.js';
import { MARKER_START, RTL_CSS, RTL_JS } from './content.js';

async function exists(p: string): Promise<boolean> {
    try { await fs.access(p); return true; } catch { return false; }
}

async function readFile(p: string): Promise<string> {
    return fs.readFile(p, 'utf-8');
}

export async function isInstalled(cssPath: string): Promise<boolean> {
    try { return (await readFile(cssPath)).includes(MARKER_START); } catch { return false; }
}

async function injectFile(filePath: string, content: string): Promise<void> {
    const backupPath = filePath + '.rtl.bak';
    if (await exists(backupPath)) {
        await fs.copyFile(backupPath, filePath);
    } else {
        await fs.copyFile(filePath, backupPath);
    }
    const original = await readFile(filePath);
    await fs.writeFile(filePath, original + '\n' + content, 'utf-8');
}

async function restoreFile(filePath: string): Promise<boolean> {
    const backupPath = filePath + '.rtl.bak';
    if (!(await exists(backupPath))) return false;
    await fs.copyFile(backupPath, filePath);
    await fs.unlink(backupPath);
    return true;
}

export async function inject(ext: ExtInfo): Promise<void> {
    await injectFile(ext.cssPath, RTL_CSS);
    if (ext.jsPath) await injectFile(ext.jsPath, RTL_JS);
}

export async function remove(ext: ExtInfo): Promise<boolean> {
    const cssOk = await restoreFile(ext.cssPath);
    if (ext.jsPath) await restoreFile(ext.jsPath);
    return cssOk;
}
