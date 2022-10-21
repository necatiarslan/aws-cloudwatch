import * as vscode from 'vscode';
import * as ui from './ui';

export function activate(context: vscode.ExtensionContext) {
	ui.logToOutput('Aws CloudWatch is now active!');

	vscode.commands.registerCommand('aws-cloudwatch-vscode-extension.CheckAccessibility', () => {
		ui.showInfoMessage("CheckAccessibility DONE");
	});

}

export function deactivate() {
	ui.logToOutput('Aws CloudWatch is now de-active!');
}
