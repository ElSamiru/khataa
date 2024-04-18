import * as vscode from 'vscode';

/**
 * Registers the extension commands.
 * @param context The extension context for managing lifecycle.
 */
function registerCommands(context: vscode.ExtensionContext): void {
    let disposable = vscode.commands.registerCommand('copyError', (diagnostic: vscode.Diagnostic) => {
        let messageToCopy: string = diagnostic.message;
        
        // Append the diagnostic code to the message if available
        if (diagnostic.code) {
            messageToCopy += ` (Error Code: ${diagnostic.code})`;
        }

        vscode.env.clipboard.writeText(messageToCopy);
        vscode.window.showInformationMessage('Error message with code copied!');
    });
    context.subscriptions.push(disposable);
}

/**
 * Activates the extension by registering commands and providers.
 * @param context The extension context.
 */
export function activate(context: vscode.ExtensionContext): void {
    registerCommands(context);

    // Register the code actions provider to all languages
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('*', new CopyErrorMessageProvider(), {
            providedCodeActionKinds: CopyErrorMessageProvider.providedCodeActionKinds
        })
    );
}

/**
 * Provides code actions for diagnostics (errors/warnings).
 */
class CopyErrorMessageProvider implements vscode.CodeActionProvider {
    static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    /**
     * Provides code actions for the diagnostics found in the document.
     * @param document The active text document.
     * @param range The range where diagnostics are found.
     * @param context Context containing diagnostics.
     * @returns An array of code actions.
     */
    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext): vscode.CodeAction[] {
        return context.diagnostics.map(diagnostic => this.createCopyErrorMessageAction(diagnostic));
    }

    /**
     * Creates a code action to copy the diagnostic message and code.
     * @param diagnostic The diagnostic to create an action for.
     * @returns A code action.
     */
    private createCopyErrorMessageAction(diagnostic: vscode.Diagnostic): vscode.CodeAction {
        const action = new vscode.CodeAction('Copy Error Message', vscode.CodeActionKind.QuickFix);
        action.command = { command: 'copyError', title: 'Copy Error Message', arguments: [diagnostic] };
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        return action;
    }
}

/**
 * Deactivates the extension. Currently a no-op.
 */
export function deactivate(): void {
    // Clean up resources or perform other cleanup tasks if needed.
}
