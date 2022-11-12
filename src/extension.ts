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
    if (!vscode.workspace.getConfiguration().get<boolean>("java-class-imports-folding.disableJavaExtensionVersionCheck")) {
        javaExtVersionCheck();
    }

    context.subscriptions.push(
        vscode.languages.registerFoldingRangeProvider(
            {language: "java", pattern: "**/*.class"}, new DiffFoldingRangeProvider()));

}
function javaExtVersionCheck() {
    const javaExtFullVer = vscode.extensions.getExtension("redhat.java")?.packageJSON?.version as string;
    if (javaExtFullVer) {
        const [, major, minor] = javaExtFullVer.match(/^(\d+)\.(\d+)\./) || ["0.0", "0", "0"];
        if (+major > 1 || +major == 1 && +minor >= 12) {
            const MORE_INFO_BTN = "More Info";
            const VIEW_EXT_SIDEBAR_BTN = "View in Extension Side Bar";

            vscode.window.showWarningMessage(
                "The extension \"Java Class Imports Folding\" is obsolete and can be uninstalled.",
                VIEW_EXT_SIDEBAR_BTN, MORE_INFO_BTN
            ).then(selection => {
                switch (selection) {
                    case MORE_INFO_BTN: vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://github.com/baincd/vscode-java-class-imports-folding/blob/main/README.md')); break;
                    case VIEW_EXT_SIDEBAR_BTN: vscode.commands.executeCommand("workbench.extensions.search", "baincd.java-class-imports-folding"); break;
                }
            });
        }
    }
}

