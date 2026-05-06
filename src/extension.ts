import * as vscode from 'vscode';
import { findClaudeExtensions } from './finder.js';
import { inject, remove, isInstalled } from './injector.js';

const RELOAD_FLAG_KEY = 'rtl.reloading';

let globalState: vscode.Memento;

async function setReloading(): Promise<void> {
    await globalState.update(RELOAD_FLAG_KEY, true);
}

async function ensureInjected(): Promise<void> {
    const exts = await findClaudeExtensions();
    if (exts.length === 0) return;

    const needsInject = await Promise.all(exts.map(e => isInstalled(e.cssPath)))
        .then(results => results.some(installed => !installed));
    if (!needsInject) return;

    for (const ext of exts) await inject(ext);

    const action = await vscode.window.showInformationMessage(
        'Claude RTL: Reload window to activate RTL support.',
        'Reload'
    );
    if (action === 'Reload') {
        await setReloading();
        vscode.commands.executeCommand('workbench.action.reloadWindow');
    }
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    globalState = context.globalState;
    await globalState.update(RELOAD_FLAG_KEY, false);

    ensureInjected().catch(err => console.error('RTL inject failed:', err));
}

export async function deactivate(): Promise<void> {
    if (globalState?.get<boolean>(RELOAD_FLAG_KEY)) return;
    const exts = await findClaudeExtensions().catch(() => []);
    for (const ext of exts) await remove(ext).catch(() => {});
}
