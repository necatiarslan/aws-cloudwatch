import * as vscode from 'vscode';
import * as ui from './common/UI';
import { CloudWatchTreeView } from './cloudwatch/CloudWatchTreeView';
import { CloudWatchTreeItem } from './cloudwatch/CloudWatchTreeItem';
import { CloudWatchAIHandler } from './language_tools/CloudWatchAIHandler';

/**
 * Activates the AWS CloudWatch extension.
 * Registers all commands and initializes the tree view.
 * 
 * IMPORTANT: All command registrations MUST be added to context.subscriptions
 * to prevent memory leaks when the extension deactivates.
 * 
 * @param context - The extension context provided by VSCode
 */
export function activate(context: vscode.ExtensionContext): void {
	ui.logToOutput('AWS CloudWatch Extension activation started');

	try {
			// Initialize AI Handler
			CloudWatchAIHandler.Current = new CloudWatchAIHandler();

			// Register Chat Participant
			const participant = vscode.chat.createChatParticipant(
				'awscloudwatch.participant',
				CloudWatchAIHandler.Current.aIHandler.bind(CloudWatchAIHandler.Current)
			);
			participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'aws-cloudwatch-logo-extension.png');
			context.subscriptions.push(participant);

		const treeView = new CloudWatchTreeView(context);

		// Register all commands and add them to subscriptions to prevent memory leaks
		// Each command handler includes error handling for robustness

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.CheckAccessibility', () => {
				ui.showInfoMessage("AWS CloudWatch: Accessibility check completed");
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.Refresh', async () => {
				try {
					await treeView.Refresh();
				} catch (error) {
					ui.showErrorMessage('Failed to refresh view', error as Error);
					ui.logToOutput('CloudWatchTreeView.Refresh Error', error as Error);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.Filter', async () => {
				try {
					await treeView.Filter();
				} catch (error) {
					ui.showErrorMessage('Failed to apply filter', error as Error);
					ui.logToOutput('CloudWatchTreeView.Filter Error', error as Error);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.ShowOnlyFavorite', async () => {
				try {
					await treeView.ShowOnlyFavorite();
				} catch (error) {
					ui.showErrorMessage('Failed to toggle favorite filter', error as Error);
					ui.logToOutput('CloudWatchTreeView.ShowOnlyFavorite Error', error as Error);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.AddToFav', async (node: CloudWatchTreeItem) => {
				try {
					await treeView.AddToFav(node);
				} catch (error) {
					ui.showErrorMessage('Failed to add to favorites', error as Error);
					ui.logToOutput('CloudWatchTreeView.AddToFav Error', error as Error);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.DeleteFromFav', async (node: CloudWatchTreeItem) => {
				try {
					await treeView.DeleteFromFav(node);
				} catch (error) {
					ui.showErrorMessage('Failed to remove from favorites', error as Error);
					ui.logToOutput('CloudWatchTreeView.DeleteFromFav Error', error as Error);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.AddLogGroup', async () => {
				try {
					await treeView.AddLogGroup();
				} catch (error) {
					ui.showErrorMessage('Failed to add log group', error as Error);
					ui.logToOutput('CloudWatchTreeView.AddLogGroup Error', error as Error);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.AddLogGroupByName', async () => {
				try {
					await treeView.AddLogGroupByName();
				} catch (error) {
					ui.showErrorMessage('Failed to add log group by name', error as Error);
					ui.logToOutput('CloudWatchTreeView.AddLogGroupByName Error', error as Error);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.RemoveLogGroup', async (node: CloudWatchTreeItem) => {
				try {
					await treeView.RemoveLogGroup(node);
				} catch (error) {
					ui.showErrorMessage('Failed to remove log group', error as Error);
					ui.logToOutput('CloudWatchTreeView.RemoveLogGroup Error', error as Error);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.AddLogStream', async (node: CloudWatchTreeItem) => {
				try {
					await treeView.AddLogStream(node);
				} catch (error) {
					ui.showErrorMessage('Failed to add log stream', error as Error);
					ui.logToOutput('CloudWatchTreeView.AddLogStream Error', error as Error);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.RemoveLogStream', async (node: CloudWatchTreeItem) => {
				try {
					await treeView.RemoveLogStream(node);
				} catch (error) {
					ui.showErrorMessage('Failed to remove log stream', error as Error);
					ui.logToOutput('CloudWatchTreeView.RemoveLogStream Error', error as Error);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.PinLogStream', async (node: CloudWatchTreeItem) => {
				try {
					await treeView.PinLogStream(node);
				} catch (error) {
					ui.showErrorMessage('Failed to pin log stream', error as Error);
					ui.logToOutput('CloudWatchTreeView.PinLogStream Error', error as Error);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.RefreshDateNode', async (dateNode: CloudWatchTreeItem, dayOffset: number) => {
				try {
					await treeView.RefreshDateNode(dateNode, dayOffset);
				} catch (error) {
					ui.showErrorMessage('Failed to refresh date node', error as Error);
					ui.logToOutput('CloudWatchTreeView.RefreshDateNode Error', error as Error);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.AddAllLogStreams', async (node: CloudWatchTreeItem) => {
				try {
					await treeView.AddAllLogStreams(node);
				} catch (error) {
					ui.showErrorMessage('Failed to add all log streams', error as Error);
					ui.logToOutput('CloudWatchTreeView.AddAllLogStreams Error', error as Error);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.AddLogStreamsByDate', async (node: CloudWatchTreeItem) => {
				try {
					await treeView.AddLogStreamsByDate(node);
				} catch (error) {
					ui.showErrorMessage('Failed to add log streams by date', error as Error);
					ui.logToOutput('CloudWatchTreeView.AddLogStreamsByDate Error', error as Error);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.RemoveAllLogStreams', async (node: CloudWatchTreeItem) => {
				try {
					await treeView.RemoveAllLogStreams(node);
				} catch (error) {
					ui.showErrorMessage('Failed to remove all log streams', error as Error);
					ui.logToOutput('CloudWatchTreeView.RemoveAllLogStreams Error', error as Error);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.ShowCloudWatchLogView', async (node: CloudWatchTreeItem) => {
				try {
					await treeView.ShowCloudWatchLogView(node);
				} catch (error) {
					ui.showErrorMessage('Failed to show log view', error as Error);
					ui.logToOutput('CloudWatchTreeView.ShowCloudWatchLogView Error', error as Error);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.SelectAwsProfile', async () => {
				try {
					await treeView.SelectAwsProfile();
				} catch (error) {
					ui.showErrorMessage('Failed to select AWS profile', error as Error);
					ui.logToOutput('CloudWatchTreeView.SelectAwsProfile Error', error as Error);
				}
			})
		);

		context.subscriptions.push(
			vscode.commands.registerCommand('CloudWatchTreeView.UpdateAwsEndPoint', async () => {
				try {
					await treeView.UpdateAwsEndPoint();
				} catch (error) {
					ui.showErrorMessage('Failed to update AWS endpoint', error as Error);
					ui.logToOutput('CloudWatchTreeView.UpdateAwsEndPoint Error', error as Error);
				}
			})
		);

		ui.logToOutput('AWS CloudWatch Extension activation completed');
	} catch (error) {
		ui.showErrorMessage('Failed to activate AWS CloudWatch extension', error as Error);
		ui.logToOutput('Extension activation Error', error as Error);
		// Re-throw to let VSCode know activation failed
		throw error;
	}
}

/**
 * Deactivates the extension.
 * VSCode automatically disposes all registered disposables in context.subscriptions.
 */
export function deactivate(): void {
	ui.logToOutput('AWS CloudWatch extension is now deactivated');
}

