"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudWatchLogView = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = require("vscode");
const ui = require("../common/UI");
class CloudWatchLogView {
    constructor(panel, extensionUri, Region, LogGroup, LogStream) {
        this._disposables = [];
        ui.logToOutput('CloudWatchLogView.constructor Started');
        this.Region = Region;
        this.LogGroup = LogGroup;
        this.LogStream = LogStream;
        this.extensionUri = extensionUri;
        this._panel = panel;
        this._panel.onDidDispose(this.dispose, null, this._disposables);
        this._setWebviewMessageListener(this._panel.webview);
        this.LoadLogs();
        ui.logToOutput('CloudWatchLogView.constructor Completed');
    }
    async RenderHmtl() {
        ui.logToOutput('CloudWatchLogView.RenderHmtl Started');
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, this.extensionUri);
        ui.logToOutput('CloudWatchLogView.RenderHmtl Completed');
    }
    async LoadLogs() {
        this.RenderHmtl();
    }
    static Render(extensionUri, Region, LogGroup, LogStream) {
        ui.logToOutput('CloudWatchLogView.Render Started');
        if (CloudWatchLogView.Current) {
            CloudWatchLogView.Current.Region = Region;
            CloudWatchLogView.Current.LogGroup = LogGroup;
            CloudWatchLogView.Current.LogStream = LogStream;
            CloudWatchLogView.Current._panel.reveal(vscode.ViewColumn.One);
            CloudWatchLogView.Current.RenderHmtl();
        }
        else {
            const panel = vscode.window.createWebviewPanel("CloudWatchLogView", "CloudWatch Logs", vscode.ViewColumn.One, {
                enableScripts: true,
            });
            CloudWatchLogView.Current = new CloudWatchLogView(panel, extensionUri, Region, LogGroup, LogStream);
        }
    }
    _getWebviewContent(webview, extensionUri) {
        ui.logToOutput('CloudWatchLogView._getWebviewContent Started');
        //file URIs
        const toolkitUri = ui.getUri(webview, extensionUri, [
            "node_modules",
            "@vscode",
            "webview-ui-toolkit",
            "dist",
            "toolkit.js", // A toolkit.min.js file is also available
        ]);
        const mainUri = ui.getUri(webview, extensionUri, ["media", "main.js"]);
        const styleUri = ui.getUri(webview, extensionUri, ["media", "style.css"]);
        let result = /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1.0">
        <script type="module" src="${toolkitUri}"></script>
        <script type="module" src="${mainUri}"></script>
        <link rel="stylesheet" href="${styleUri}">
        <title>Logs</title>
      </head>
      <body>  
        ${this.Region} / ${this.LogGroup} / ${this.LogStream}
      </body>
    </html>
    `;
        ui.logToOutput('CloudWatchLogView._getWebviewContent Completed');
        return result;
    }
    _setWebviewMessageListener(webview) {
        ui.logToOutput('CloudWatchLogView._setWebviewMessageListener Started');
        webview.onDidReceiveMessage((message) => {
            const command = message.command;
            ui.logToOutput('CloudWatchLogView._setWebviewMessageListener Message Received ' + message.command);
            switch (command) {
                case "run-trigger-dag":
                    //this.triggerDagWConfig(message.config, message.date);
                    return;
            }
        }, undefined, this._disposables);
    }
    dispose() {
        ui.logToOutput('CloudWatchLogView.dispose Started');
        CloudWatchLogView.Current = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
exports.CloudWatchLogView = CloudWatchLogView;
//# sourceMappingURL=CloudWatchLogView.js.map