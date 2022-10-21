"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const ui = require("./ui");
function activate(context) {
    ui.logToOutput('Aws CloudWatch is now active!');
    vscode.commands.registerCommand('aws-cloudwatch-vscode-extension.CheckAccessibility', () => {
        ui.showInfoMessage("CheckAccessibility DONE");
    });
}
exports.activate = activate;
function deactivate() {
    ui.logToOutput('Aws CloudWatch is now de-active!');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map