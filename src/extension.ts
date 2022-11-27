import * as vscode from 'vscode';
import * as ui from './common/ui';
import { TreeView } from './cloudwatch/treeView';
import { TreeItem } from './cloudwatch/treeItem';

export function activate(context: vscode.ExtensionContext) {
	ui.logToOutput('Aws CloudWatch Extension activation started');

	let treeView:TreeView = new TreeView(context);

	vscode.commands.registerCommand('aws-cloudwatch-vscode-extension.CheckAccessibility', () => {
		ui.showInfoMessage("CheckAccessibility DONE");
	});

	vscode.commands.registerCommand('aws-cloudwatch-vscode-extension.Filter', () => {
		treeView.Filter();
	});

	vscode.commands.registerCommand('aws-cloudwatch-vscode-extension.ShowOnlyFavorite', () => {
		treeView.ShowOnlyFavorite();
	});

	vscode.commands.registerCommand('aws-cloudwatch-vscode-extension.AddToFav', (node: TreeItem) => {
		treeView.AddToFav(node);
	});

	vscode.commands.registerCommand('aws-cloudwatch-vscode-extension.DeleteFromFav', (node: TreeItem) => {
		treeView.DeleteFromFav(node);
	});

	ui.logToOutput('Aws CloudWatch Extension activation completed');
}

export function deactivate() {
	ui.logToOutput('Aws CloudWatch is now de-active!');
}
