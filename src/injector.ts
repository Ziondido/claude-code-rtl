import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import { ExtInfo } from './finder.js';
import { MARKER_START, MARKER_END, RTL_CSS, RTL_JS } from './content.js';

async function exists(p: string): Promise<boolean> {
    try { await fs.access(p); return true; } catch { return false; }
}

async function readFile(p: string): Promise<string> {
    return fs.readFile(p, 'utf-8');
}

function stripMarkers(content: string): string {
    // Remove everything from the last occurrence of \n/* RTL-AUTO: start */ to /* RTL-AUTO: end */
    const startIdx = content.lastIndexOf('\n' + MARKER_START);
    if (startIdx === -1) return content;
    const endIdx = content.indexOf(MARKER_END, startIdx);
    if (endIdx === -1) return content.slice(0, startIdx);
    return content.slice(0, startIdx);
}

function hash(s: string): string {
    return crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
}

export async function isInstalled(cssPath: string): Promise<boolean> {
    try { return (await readFile(cssPath)).includes(MARKER_START); } catch { return false; }
}

async function injectFile(filePath: string, content: string): Promise<void> {
    const current = await readFile(filePath);
    const clean = stripMarkers(current);

    // First injection: backup the clean file tagged with its hash so we can detect version changes.
    const backupPath = filePath + '.rtl.bak';
    if (!(await exists(backupPath))) {
        await fs.copyFile(filePath, backupPath);
    } else {
        // If Claude Code updated the file since last backup, refresh the backup.
        const bak = await readFile(backupPath);
        const bakClean = stripMarkers(bak);
        if (hash(bakClean) !== hash(clean)) {
            // New version of the host file — overwrite backup with current clean version.
            await fs.writeFile(backupPath, clean, 'utf-8');
        }
    }

    await fs.writeFile(filePath, clean + '\n' + content, 'utf-8');
}

async function restoreFile(filePath: string): Promise<boolean> {
    // Prefer stripping markers from current file (version-safe).
    // Fall back to backup only if markers aren't found.
    const current = await readFile(filePath).catch(() => null);
    if (current && current.includes(MARKER_START)) {
        await fs.writeFile(filePath, stripMarkers(current), 'utf-8');
        const backupPath = filePath + '.rtl.bak';
        if (await exists(backupPath)) await fs.unlink(backupPath);
        return true;
    }
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
