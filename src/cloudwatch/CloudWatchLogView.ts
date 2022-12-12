/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import * as ui from '../common/UI';
import * as api from '../common/API';
import * as AWS from "aws-sdk";

export class CloudWatchLogView {
    public static Current: CloudWatchLogView | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private extensionUri: vscode.Uri;

    public Region: string;
    public LogGroup:string;
    public LogStream:string;

    public StartTime:number = 0;
    public LogEvents:AWS.CloudWatchLogs.OutputLogEvents = [];

    private Timer: NodeJS.Timer | undefined;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, Region: string, LogGroup:string, LogStream:string) {
        ui.logToOutput('CloudWatchLogView.constructor Started');

        this.Region = Region;
        this.LogGroup = LogGroup;
        this.LogStream = LogStream;

        this.extensionUri = extensionUri;

        this._panel = panel;
        this._panel.onDidDispose(this.dispose, null, this._disposables);
        this._setWebviewMessageListener(this._panel.webview);
        this.LoadLogs();
        this.StartTimer();
        ui.logToOutput('CloudWatchLogView.constructor Completed');
    }

    public async RenderHmtl() {
        ui.logToOutput('CloudWatchLogView.RenderHmtl Started');
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, this.extensionUri);
        
        ui.logToOutput('CloudWatchLogView.RenderHmtl Completed');
    }

    public async LoadLogs(){
        ui.logToOutput('CloudWatchLogView.LoadLogs Started');
        var result = await api.GetLogEvents(this.Region, this.LogGroup, this.LogStream, this.StartTime);
        if(result.isSuccessful)
        {
            if(result.result.length > 0)
            {
                this.LogEvents = this.LogEvents.concat(result.result);
                this.LogEvents = this.LogEvents.sort(this.CompareEventsFunction);
                if(this.LogEvents.length>0 && this.LogEvents[0].timestamp)
                {
                    this.StartTime = this.LogEvents[0].timestamp + 1;
                }
                this.RenderHmtl();
            }
            else
            {
                ui.logToOutput('CloudWatchLogView.LoadLogs No New Log');
            }
        }   
    }

    public ResetCurrentState(){
        this.LogEvents = [];
        this.StartTime = 0;
    }

    public static Render(extensionUri: vscode.Uri, Region: string, LogGroup:string, LogStream:string) {
        ui.logToOutput('CloudWatchLogView.Render Started');
        if (CloudWatchLogView.Current) {
            CloudWatchLogView.Current.ResetCurrentState();
            CloudWatchLogView.Current.Region = Region;
            CloudWatchLogView.Current.LogGroup = LogGroup;
            CloudWatchLogView.Current.LogStream = LogStream;
            CloudWatchLogView.Current._panel.reveal(vscode.ViewColumn.One);
            CloudWatchLogView.Current.LoadLogs();
        } 
        else 
        {
            const panel = vscode.window.createWebviewPanel("CloudWatchLogView", "CloudWatch Logs", vscode.ViewColumn.One, {
                enableScripts: true,
            });

            CloudWatchLogView.Current = new CloudWatchLogView(panel, extensionUri, Region, LogGroup, LogStream);
        }
    }

    private CompareEventsFunction(a:AWS.CloudWatchLogs.OutputLogEvent, b:AWS.CloudWatchLogs.OutputLogEvent):number
    {
        if(a.timestamp && b.timestamp)
        {
            return a.timestamp > b.timestamp ? -1 : 1;
        }
        return 1;
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
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

        let logRowHtml:string="";
        let rowNumber:number=1;
        if(this.LogEvents)
        {
            rowNumber = this.LogEvents.length;
            for(var event of this.LogEvents){
                let timeString:string = "";
                if(event.timestamp)
                {
                    timeString = new Date(event.timestamp).toLocaleTimeString();
                }
                logRowHtml += '<tr><td>' + rowNumber.toString() + '</td><td>' + event.message + '</td><td>' + timeString + '</td></tr>';
                rowNumber--;
            }
        }
        else
        {
            logRowHtml += '<tr><td colspan=3> no log </td></tr>';
        }

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
        
        <div style="display: flex; align-items: center;">
            <h2>${this.LogStream}</h2>
        </div>

        <table>
            <tr><th width="5px">#</th><th>Message</th><th width="75px">Time</th></tr>
            ${logRowHtml}
            <tr>
                <th colspan=3></th>
            </tr>
        </table>
        <br>
        <table>
            <tr>
                <th style="text-align:left" width="50px">
                <vscode-progress-ring></vscode-progress-ring>
                </th>
                <th style="text-align:left">
                <vscode-button appearance="primary" id="pause_timer" disabled>Pause</vscode-button>
                <vscode-button appearance="primary" id="export_logs" disabled>Export Logs</vscode-button>
                </th>
            </tr>
        </table>
        <br>
        ${this.Region} / ${this.LogGroup} / ${this.LogStream}
      </body>
    </html>
    `;
        ui.logToOutput('CloudWatchLogView._getWebviewContent Completed');
        return result;
    }

    private _setWebviewMessageListener(webview: vscode.Webview) {
        ui.logToOutput('CloudWatchLogView._setWebviewMessageListener Started');
        webview.onDidReceiveMessage(
            (message: any) => {
                const command = message.command;

                ui.logToOutput('CloudWatchLogView._setWebviewMessageListener Message Received ' + message.command);
                switch (command) {
                    case "run-trigger-dag":
                        //this.triggerDagWConfig(message.config, message.date);
                        return;
                }

            },
            undefined,
            this._disposables
        );
    }

    public dispose() {
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

    async StartTimer() {
        ui.logToOutput('CloudWatchLogView.StartTimer Started');

        if (this.Timer) {
            clearInterval(this.Timer);//stop prev checking
        }

        this.Timer = setInterval(this.OnTimerTick, 5 * 1000, this);
    }

    async StopTimer() {
        ui.logToOutput('CloudWatchLogView.StopTimer Started');
        if (this.Timer) {
            clearInterval(this.Timer);//stop prev checking
        }
    }

    async OnTimerTick(CloudWatchLogView: CloudWatchLogView) {
        ui.logToOutput('CloudWatchLogView.OnTimerTick Started');

        CloudWatchLogView.LoadLogs();
    }

}