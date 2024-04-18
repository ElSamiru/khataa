import * as vscode from 'vscode';

function registerCommands(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('copyError', (diagnostic: vscode.Diagnostic) => {
        let messageToCopy: string = diagnostic.message;
        if (diagnostic.code) {
            messageToCopy += ` (Error Code: ${diagnostic.code})`;
        }
        vscode.env.clipboard.writeText(messageToCopy);
        vscode.window.showInformationMessage('Error message with code copied!');
    });
    context.subscriptions.push(disposable);
}

export function activate(context: vscode.ExtensionContext) {
    registerCommands(context);

    // Register the code actions provider for all languages
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('*', new CopyErrorMessageProvider(), {
            providedCodeActionKinds: CopyErrorMessageProvider.providedCodeActionKinds
        })
    );
}

class CopyErrorMessageProvider implements vscode.CodeActionProvider {
    static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext): vscode.CodeAction[] {
        return context.diagnostics.map(diagnostic => this.createCopyErrorMessageAction(diagnostic));
    }

    private createCopyErrorMessageAction(diagnostic: vscode.Diagnostic): vscode.CodeAction {
        const action = new vscode.CodeAction('Copy Error Message', vscode.CodeActionKind.QuickFix);
        action.command = { command: 'copyError', title: 'Copy Error Message', arguments: [diagnostic] };
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        return action;
    }
}

export function deactivate() {
    // Clean up resources or perform other cleanup tasks if needed.
}
