import * as vscode from 'vscode';
import * as ui from './common/UI';
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

	vscode.commands.registerCommand('CloudWatchTreeView.AddLogGroup', () => {
		treeView.AddLogGroup();
	});

	vscode.commands.registerCommand('CloudWatchTreeView.RemoveLogGroup', (node: CloudWatchTreeItem) => {
		treeView.RemoveLogGroup(node);
	});

	vscode.commands.registerCommand('CloudWatchTreeView.AddLogStream', (node: CloudWatchTreeItem) => {
		treeView.AddLogStream(node);
	});

	vscode.commands.registerCommand('CloudWatchTreeView.RemoveLogStream', (node: CloudWatchTreeItem) => {
		treeView.RemoveLogStream(node);
	});

	vscode.commands.registerCommand('CloudWatchTreeView.AddAllLogStreams', (node: CloudWatchTreeItem) => {
		treeView.AddAllLogStreams(node);
	});

	vscode.commands.registerCommand('CloudWatchTreeView.RemoveAllLogStreams', (node: CloudWatchTreeItem) => {
		treeView.RemoveAllLogStreams(node);
	});

	vscode.commands.registerCommand('CloudWatchTreeView.ShowCloudWatchLogView', (node: CloudWatchTreeItem) => {
		treeView.ShowCloudWatchLogView(node);
	});

	ui.logToOutput('Aws CloudWatch Extension activation completed');
}

export function deactivate() {
	ui.logToOutput('Aws CloudWatch is now de-active!');
}
