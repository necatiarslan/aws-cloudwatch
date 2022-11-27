"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const ui = require("./common/ui");
const treeView_1 = require("./cloudwatch/treeView");
function activate(context) {
    ui.logToOutput('Aws CloudWatch Extension activation started');
    let treeView = new treeView_1.TreeView(context);
    vscode.commands.registerCommand('aws-cloudwatch-vscode-extension.CheckAccessibility', () => {
        ui.showInfoMessage("CheckAccessibility DONE");
    });
    vscode.commands.registerCommand('aws-cloudwatch-vscode-extension.Filter', () => {
        treeView.Filter();
    });
    vscode.commands.registerCommand('aws-cloudwatch-vscode-extension.ShowOnlyFavorite', () => {
        treeView.ShowOnlyFavorite();
    });
    vscode.commands.registerCommand('aws-cloudwatch-vscode-extension.AddToFav', (node) => {
        treeView.AddToFav(node);
    });
    vscode.commands.registerCommand('aws-cloudwatch-vscode-extension.DeleteFromFav', (node) => {
        treeView.DeleteFromFav(node);
    });
    ui.logToOutput('Aws CloudWatch Extension activation completed');
}
exports.activate = activate;
function deactivate() {
    ui.logToOutput('Aws CloudWatch is now de-active!');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map