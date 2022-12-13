"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const ui = require("./common/UI");
const CloudWatchTreeView_1 = require("./cloudwatch/CloudWatchTreeView");
function activate(context) {
    ui.logToOutput('Aws CloudWatch Extension activation started');
    let treeView = new CloudWatchTreeView_1.CloudWatchTreeView(context);
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
    vscode.commands.registerCommand('CloudWatchTreeView.AddToFav', (node) => {
        treeView.AddToFav(node);
    });
    vscode.commands.registerCommand('CloudWatchTreeView.DeleteFromFav', (node) => {
        treeView.DeleteFromFav(node);
    });
    vscode.commands.registerCommand('CloudWatchTreeView.AddLogGroup', () => {
        treeView.AddLogGroup();
    });
    vscode.commands.registerCommand('CloudWatchTreeView.AddLogGroupByName', () => {
        treeView.AddLogGroupByName();
    });
    vscode.commands.registerCommand('CloudWatchTreeView.RemoveLogGroup', (node) => {
        treeView.RemoveLogGroup(node);
    });
    vscode.commands.registerCommand('CloudWatchTreeView.AddLogStream', (node) => {
        treeView.AddLogStream(node);
    });
    vscode.commands.registerCommand('CloudWatchTreeView.RemoveLogStream', (node) => {
        treeView.RemoveLogStream(node);
    });
    vscode.commands.registerCommand('CloudWatchTreeView.AddAllLogStreams', (node) => {
        treeView.AddAllLogStreams(node);
    });
    vscode.commands.registerCommand('CloudWatchTreeView.RemoveAllLogStreams', (node) => {
        treeView.RemoveAllLogStreams(node);
    });
    vscode.commands.registerCommand('CloudWatchTreeView.ShowCloudWatchLogView', (node) => {
        treeView.ShowCloudWatchLogView(node);
    });
    vscode.commands.registerCommand('CloudWatchTreeView.SelectAwsProfile', (node) => {
        treeView.SelectAwsProfile(node);
    });
    ui.logToOutput('Aws CloudWatch Extension activation completed');
}
exports.activate = activate;
function deactivate() {
    ui.logToOutput('Aws CloudWatch is now de-active!');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map