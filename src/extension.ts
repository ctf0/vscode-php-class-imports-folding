import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerFoldingRangeProvider('php', new FoldingProvider()),
    );
}

class FoldingProvider implements vscode.FoldingRangeProvider {
    provideFoldingRanges(document: vscode.TextDocument): vscode.ProviderResult<vscode.FoldingRange[]> {
        const foldUse: any = this.foldUse(document);
        const ranges: any = [];

        if (!Array.isArray(foldUse)) {
            ranges.push(
                new vscode.FoldingRange(
                    foldUse.firstImport,
                    foldUse.lastImport,
                    vscode.FoldingRangeKind.Imports,
                ),
            );
        }

        return ranges;
    }

    foldUse(document: vscode.TextDocument): [] | { firstImport: number; lastImport: number; } {
        const regEx = /^(\/\/( )?)?use .*$/g;
        let firstImport = -1;
        let lastImport = -1;

        for (let i = 0; i < document.lineCount; i++) {
            if (regEx.test(document.lineAt(i).text)) {
                firstImport = i;
                break;
            }
        }

        if (firstImport < 0) {
            return [];
        }

        for (let i = firstImport; i < document.lineCount; i++) {
            if (regEx.test(document.lineAt(i).text)) {
                lastImport = i;
            }
        }

        return { firstImport, lastImport };
    }
}
