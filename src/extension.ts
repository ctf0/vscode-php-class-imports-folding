import * as vscode from 'vscode';

class DiffFoldingRangeProvider implements vscode.FoldingRangeProvider {
    onDidChangeFoldingRanges?: vscode.Event<void> | undefined;

    private readonly importLineRegEx = /^\s*import\s.*$/
    private readonly whitespaceOrCommentLineRegEx = /^\s*(\/\/.*)?$/

    
    provideFoldingRanges(document: vscode.TextDocument, context: vscode.FoldingContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FoldingRange[]> {
        let firstImport = -1;
        let lastImport = -1;

        for (let i = 0; i < document.lineCount; i++) {
            if (this.importLineRegEx.test(document.lineAt(i).text)) {
                firstImport = i;
                break;
            }
        }

        if (firstImport < 0) {
            return [];
        }

        for (let i = firstImport + 1; i < document.lineCount; i++) {
            if (this.importLineRegEx.test(document.lineAt(i).text)) {
                lastImport = i;
            } else if (!this.whitespaceOrCommentLineRegEx.test(document.lineAt(i).text)) {
                break;
            }
        }

        if (lastImport < 0) {
            return [];
        }
        
        return [new vscode.FoldingRange(firstImport, lastImport, vscode.FoldingRangeKind.Imports)];
    }

}


export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerFoldingRangeProvider(
            {language: "java", pattern: "**/*.class"}, new DiffFoldingRangeProvider()));

}
