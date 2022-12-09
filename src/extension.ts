import * as vscode from 'vscode';
import * as ui from './common/ui';
import { CloudWatchTreeView } from './cloudwatch/CloudWatchTreeView';
import { CloudWatchTreeItem } from './cloudwatch/CloudWatchTreeItem';

export function activate(context: vscode.ExtensionContext) {
	ui.logToOutput('Aws CloudWatch Extension activation started');

	let treeView:CloudWatchTreeView = new CloudWatchTreeView(context);

	vscode.commands.registerCommand('CloudWatchTreeView.CheckAccessibility', () => {
		ui.showInfoMessage("CheckAccessibility DONE");
	});

	vscode.commands.registerCommand('CloudWatchTreeView.Refresh', () => {
		treeView.Refresh();
	});

	vscode.commands.registerCommand('CloudWatchTreeView.Filter', () => {
		treeView.Filter();
	});

	vscode.commands.registerCommand('CloudWatchTreeView.ShowOnlyFavorite', () => {
		treeView.ShowOnlyFavorite();
	});

	vscode.commands.registerCommand('CloudWatchTreeView.AddToFav', (node: CloudWatchTreeItem) => {
		treeView.AddToFav(node);
	});

	vscode.commands.registerCommand('CloudWatchTreeView.DeleteFromFav', (node: CloudWatchTreeItem) => {
		treeView.DeleteFromFav(node);
	});

	ui.logToOutput('Aws CloudWatch Extension activation completed');
}

export function deactivate() {
	ui.logToOutput('Aws CloudWatch is now de-active!');
}
