import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerFoldingRangeProvider('php', new FoldingProvider())
    );
}

class FoldingProvider implements vscode.FoldingRangeProvider {
    provideFoldingRanges(document: vscode.TextDocument): vscode.ProviderResult<vscode.FoldingRange[]> {
        const regEx = /^(\/\/)?\s*use\s.*$/g
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

        return [
            new vscode.FoldingRange(
                firstImport,
                lastImport,
                vscode.FoldingRangeKind.Imports
            )
        ];
    }
}
