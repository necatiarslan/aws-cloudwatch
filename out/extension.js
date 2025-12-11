"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const ui = __importStar(require("./common/UI"));
const CloudWatchTreeView_1 = require("./cloudwatch/CloudWatchTreeView");
const CloudWatchAIHandler_1 = require("./language_tools/CloudWatchAIHandler");
/**
 * Activates the AWS CloudWatch extension.
 * Registers all commands and initializes the tree view.
 *
 * IMPORTANT: All command registrations MUST be added to context.subscriptions
 * to prevent memory leaks when the extension deactivates.
 *
 * @param context - The extension context provided by VSCode
 */
function activate(context) {
    ui.logToOutput('AWS CloudWatch Extension activation started');
    try {
        // Initialize AI Handler
        CloudWatchAIHandler_1.CloudWatchAIHandler.Current = new CloudWatchAIHandler_1.CloudWatchAIHandler();
        // Register Chat Participant
        const participant = vscode.chat.createChatParticipant('awscloudwatch.participant', CloudWatchAIHandler_1.CloudWatchAIHandler.Current.aIHandler.bind(CloudWatchAIHandler_1.CloudWatchAIHandler.Current));
        participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'aws-cloudwatch-logo-extension.png');
        context.subscriptions.push(participant);
        const treeView = new CloudWatchTreeView_1.CloudWatchTreeView(context);
        // Register all commands and add them to subscriptions to prevent memory leaks
        // Each command handler includes error handling for robustness
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.CheckAccessibility', () => {
            ui.showInfoMessage("AWS CloudWatch: Accessibility check completed");
        }));
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.Refresh', async () => {
            try {
                await treeView.Refresh();
            }
            catch (error) {
                ui.showErrorMessage('Failed to refresh view', error);
                ui.logToOutput('CloudWatchTreeView.Refresh Error', error);
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.Filter', async () => {
            try {
                await treeView.Filter();
            }
            catch (error) {
                ui.showErrorMessage('Failed to apply filter', error);
                ui.logToOutput('CloudWatchTreeView.Filter Error', error);
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.ShowOnlyFavorite', async () => {
            try {
                await treeView.ShowOnlyFavorite();
            }
            catch (error) {
                ui.showErrorMessage('Failed to toggle favorite filter', error);
                ui.logToOutput('CloudWatchTreeView.ShowOnlyFavorite Error', error);
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.AddToFav', async (node) => {
            try {
                await treeView.AddToFav(node);
            }
            catch (error) {
                ui.showErrorMessage('Failed to add to favorites', error);
                ui.logToOutput('CloudWatchTreeView.AddToFav Error', error);
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.DeleteFromFav', async (node) => {
            try {
                await treeView.DeleteFromFav(node);
            }
            catch (error) {
                ui.showErrorMessage('Failed to remove from favorites', error);
                ui.logToOutput('CloudWatchTreeView.DeleteFromFav Error', error);
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.AddLogGroup', async () => {
            try {
                await treeView.AddLogGroup();
            }
            catch (error) {
                ui.showErrorMessage('Failed to add log group', error);
                ui.logToOutput('CloudWatchTreeView.AddLogGroup Error', error);
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.AddLogGroupByName', async () => {
            try {
                await treeView.AddLogGroupByName();
            }
            catch (error) {
                ui.showErrorMessage('Failed to add log group by name', error);
                ui.logToOutput('CloudWatchTreeView.AddLogGroupByName Error', error);
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.RemoveLogGroup', async (node) => {
            try {
                await treeView.RemoveLogGroup(node);
            }
            catch (error) {
                ui.showErrorMessage('Failed to remove log group', error);
                ui.logToOutput('CloudWatchTreeView.RemoveLogGroup Error', error);
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.AddLogStream', async (node) => {
            try {
                await treeView.AddLogStream(node);
            }
            catch (error) {
                ui.showErrorMessage('Failed to add log stream', error);
                ui.logToOutput('CloudWatchTreeView.AddLogStream Error', error);
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.RemoveLogStream', async (node) => {
            try {
                await treeView.RemoveLogStream(node);
            }
            catch (error) {
                ui.showErrorMessage('Failed to remove log stream', error);
                ui.logToOutput('CloudWatchTreeView.RemoveLogStream Error', error);
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.PinLogStream', async (node) => {
            try {
                await treeView.PinLogStream(node);
            }
            catch (error) {
                ui.showErrorMessage('Failed to pin log stream', error);
                ui.logToOutput('CloudWatchTreeView.PinLogStream Error', error);
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.AddAllLogStreams', async (node) => {
            try {
                await treeView.AddAllLogStreams(node);
            }
            catch (error) {
                ui.showErrorMessage('Failed to add all log streams', error);
                ui.logToOutput('CloudWatchTreeView.AddAllLogStreams Error', error);
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.AddLogStreamsByDate', async (node) => {
            try {
                await treeView.AddLogStreamsByDate(node);
            }
            catch (error) {
                ui.showErrorMessage('Failed to add log streams by date', error);
                ui.logToOutput('CloudWatchTreeView.AddLogStreamsByDate Error', error);
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.RemoveAllLogStreams', async (node) => {
            try {
                await treeView.RemoveAllLogStreams(node);
            }
            catch (error) {
                ui.showErrorMessage('Failed to remove all log streams', error);
                ui.logToOutput('CloudWatchTreeView.RemoveAllLogStreams Error', error);
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.ShowCloudWatchLogView', async (node) => {
            try {
                await treeView.ShowCloudWatchLogView(node);
            }
            catch (error) {
                ui.showErrorMessage('Failed to show log view', error);
                ui.logToOutput('CloudWatchTreeView.ShowCloudWatchLogView Error', error);
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.SelectAwsProfile', async () => {
            try {
                await treeView.SelectAwsProfile();
            }
            catch (error) {
                ui.showErrorMessage('Failed to select AWS profile', error);
                ui.logToOutput('CloudWatchTreeView.SelectAwsProfile Error', error);
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('CloudWatchTreeView.UpdateAwsEndPoint', async () => {
            try {
                await treeView.UpdateAwsEndPoint();
            }
            catch (error) {
                ui.showErrorMessage('Failed to update AWS endpoint', error);
                ui.logToOutput('CloudWatchTreeView.UpdateAwsEndPoint Error', error);
            }
        }));
        ui.logToOutput('AWS CloudWatch Extension activation completed');
    }
    catch (error) {
        ui.showErrorMessage('Failed to activate AWS CloudWatch extension', error);
        ui.logToOutput('Extension activation Error', error);
        // Re-throw to let VSCode know activation failed
        throw error;
    }
}
/**
 * Deactivates the extension.
 * VSCode automatically disposes all registered disposables in context.subscriptions.
 */
function deactivate() {
    ui.logToOutput('AWS CloudWatch extension is now deactivated');
}
//# sourceMappingURL=extension.js.map