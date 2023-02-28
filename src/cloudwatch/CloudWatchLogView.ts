/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import * as ui from '../common/UI';
import * as api from '../common/API';
import * as AWS from "aws-sdk";
import { CloudWatchTreeView } from "./CloudWatchTreeView";
import { bool } from "aws-sdk/clients/signer";

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
    public SearchText:string = "";
    public HideText:string = "";

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

    public async RenderHtml() {
        ui.logToOutput('CloudWatchLogView.RenderHmtl Started');
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, this.extensionUri);
        
        ui.logToOutput('CloudWatchLogView.RenderHmtl Completed');
    }

    public async LoadLogs(){
        ui.logToOutput('CloudWatchLogView.LoadLogs Started');
        if(!CloudWatchTreeView.Current){return;}

        var result = await api.GetLogEvents(CloudWatchTreeView.Current.AwsProfile, this.Region, this.LogGroup, this.LogStream, this.StartTime);
        if(result.isSuccessful)
        {
            if(result.result.length > 0)
            {
                this.LogEvents = this.LogEvents.concat(result.result);
                //this.LogEvents = this.LogEvents.sort(this.CompareEventsFunction);
                if(this.LogEvents.length>0)
                {
                    let latestTimeStamp = this.LogEvents[this.LogEvents.length-1].timestamp;
                    if(!latestTimeStamp) { latestTimeStamp=0; }

                    this.StartTime = latestTimeStamp + 1;
                    let now = new Date();
                    now.setHours(now.getHours() - 1);
                    if(new Date(this.StartTime) < now)
                    {
                        this.StopTimer();
                    }
                }
            }
            else
            {
                ui.logToOutput('CloudWatchLogView.LoadLogs No New Log');
            }
            this.RenderHtml();
        }
        else
        {
            this.StopTimer();
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

    private SetCustomColorCoding(message:string | undefined) : string | undefined
    {
        if(!message) { return message; }
        let result:string = message;

        //result=result.replace(/"([^"]*)"/g, (match, capture1) => `<span class="color_code_blue">"${capture1}"</span>`);//any string between ""
        //result=result.replace(/'([^']*)'/g, (match, capture1) => `<span class="color_code_blue">'${capture1}'</span>`);//any string between ''
        result=result.replace(/(error)/i, (match, capture1) => `<span class="color_code_red">${capture1}</span>`);
        // result=result.replace(/([error])/g, (match, capture1) => `<span class="color_code_red">${capture1}</span>`);
        result=result.replace(/(exception)/i, (match, capture1) => `<span class="color_code_red">${capture1}</span>`);
        // result=result.replace(/([exception])/g, (match, capture1) => `<span class="color_code_red">${capture1}</span>`);
        // result=result.replace(/(failure)/g, (match, capture1) => `<span class="color_code_red">${capture1}</span>`);
        // result=result.replace(/([failure])/g, (match, capture1) => `<span class="color_code_red">${capture1}</span>`);
        //result=result.replace(/(\[info\])/i, (match, capture1) => `<span class="color_code_yellow">${capture1}</span>`);
        // result=result.replace(/([info])/g, (match, capture1) => `<span class="color_code_yellow">${capture1}</span>`);
        // result=result.replace(/(warning)/g, (match, capture1) => `<span class="color_code_yellow">${capture1}</span>`);
        // result=result.replace(/([warning])/g, (match, capture1) => `<span class="color_code_yellow">${capture1}</span>`);
        //result=result.replace(/(\d{4}-\d{2}-\d{2})/g, (match, capture1) => `<span class="color_code_green">${capture1}</span>`);
        //result=result.replace(/(\d{2}\/\d{2}\/\d{4})/g, (match, capture1) => `<span class="color_code_green">${capture1}</span>`);
        //result=result.replace(/(\d{2}:\d{2}:\d{2})/g, (match, capture1) => `<span class="color_code_green">${capture1}</span>`);

        if(this.SearchText)
        {
            const regex = new RegExp("(" + this.SearchText + ")", "i");
            result=result.replace(regex, (match, capture1) => `<span class="color_code_search_result">${capture1}</span>`);
        }

        return result;
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
        const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));


        let logRowHtml:string="";
        
        if(this.LogEvents && this.LogEvents.length > 0)
        {
            let rowNumber:number=0;
            for(var event of this.LogEvents){
                rowNumber++;

                if (this.IsHideEvent(event)) { continue; }

                let timeString:string = "";
                if(event.timestamp)
                {
                    timeString = new Date(event.timestamp).toLocaleTimeString();
                }
                logRowHtml += '<tr><td>' + rowNumber.toString() + '</td><td>' + this.SetCustomColorCoding(event.message) + '</td><td style="white-space:nowrap;">' + timeString + '</td></tr>';
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
        <link href="${codiconsUri}" rel="stylesheet" />
        <title>Logs</title>
      </head>
      <body>  
        
        <div style="display: flex; align-items: center;">
            <h2>${this.LogStream}</h2>
        </div>

        <table>
            <tr>
                <td style="text-align:left" width="20px">
                    <div style="visibility: ${this.IsTimerTicking() ? "visible" : "hidden"}; display: flex; align-items: center;">
                    <vscode-progress-ring></vscode-progress-ring>
                    </div>
                </td>
                <td style="text-align:left">
                    <vscode-button appearance="primary" id="pause_timer" >${this.IsTimerTicking()?"Pause":"Resume"}</vscode-button>
                    <vscode-button appearance="primary" id="refresh" >Refresh</vscode-button>
                    <vscode-button appearance="primary" id="export_logs" >Export Logs</vscode-button>
                </td>
                <td style="text-align:right">
                    <vscode-text-field id="hide_text" placeholder="Hide" value="${this.HideText}">
                        <span slot="start" class="codicon codicon-eye-closed"></span>
                    </vscode-text-field>
                    <vscode-text-field id="search_text" placeholder="Search" value="${this.SearchText}">
                        <span slot="start" class="codicon codicon-search"></span>
                    </vscode-text-field>
                </vscode-text-field></td>
            </tr>
        </table>

        <table>
            <tr>
                <th width="5px">#</th>
                <th>Message</th>
                <th  width="50px">Time</th>
            </tr>

            ${logRowHtml}

        </table>

        <br>
        ${this.Region} / ${this.LogGroup} / ${this.LogStream}
        
        <br>
        <br>
        <br>
                    
        <table>
            <tr>
                <td colspan="3">
                    <vscode-link href="https://github.com/necatiarslan/aws-cloudwatch/issues/new">Bug Report & Feature Request</vscode-link>
                </td>
            </tr>
        </table>
      </body>
    </html>
    `;
        ui.logToOutput('CloudWatchLogView._getWebviewContent Completed');
        return result;
    }

    private IsHideEvent(event: AWS.CloudWatchLogs.OutputLogEvent) : boolean
    {
        if(this.SearchText.length > 0)
        {
            let searchTerms = this.SearchText.split(",");
            for (var term of searchTerms) {
                const regex = new RegExp(term.trim(), "i");
                if (event.message?.search(regex) !== -1) { return false; }
            }
            return true;
        }

        if(this.HideText.length > 0)
        {
            let hideTerms = this.HideText.split(",");
            for (var term of hideTerms) {
                const regex = new RegExp(term.trim(), "i");
                if (event.message?.search(regex) !== -1) { return true; }
            }
            return false;
        }

        return false;
    }

    private _setWebviewMessageListener(webview: vscode.Webview) {
        ui.logToOutput('CloudWatchLogView._setWebviewMessageListener Started');
        webview.onDidReceiveMessage(
            (message: any) => {
                const command = message.command;

                ui.logToOutput('CloudWatchLogView._setWebviewMessageListener Message Received ' + message.command);
                switch (command) {
                    case "refresh":
                        this.SearchText = message.search_text;
                        this.HideText = message.hide_text;
                        this.LoadLogs();;
                        this.RenderHtml();
                        return;

                    case "pause_timer":
                        this.IsTimerTicking() ? this.StopTimer() : this.StartTimer();
                        this.RenderHtml();
                        return;
                    
                    case "export_logs":
                        this.ExportLogs();
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
            this.Timer = undefined;
        }

        this.Timer = setInterval(this.OnTimerTick, 5 * 1000, this);
    }

    async StopTimer() {
        ui.logToOutput('CloudWatchLogView.StopTimer Started');
        if (this.Timer) {
            clearInterval(this.Timer);//stop prev checking
            this.Timer = undefined;
        }
    }

    public IsTimerTicking(){
        return (this.Timer !== undefined);
    }

    async OnTimerTick(CloudWatchLogView: CloudWatchLogView) {
        ui.logToOutput('CloudWatchLogView.OnTimerTick Started');

        CloudWatchLogView.LoadLogs();
    }

    async ExportLogs(){
        ui.logToOutput('CloudWatchLogView.ExportLogs Started');

        try 
        {
            const tmp = require('tmp');
            var fs = require('fs');
    
            let fileName = this.LogStream.replace(/[^a-zA-Z0-9]/g, "_");
            const tmpFile = tmp.fileSync({ mode: 0o644, prefix: fileName, postfix: '.log' });
            fs.appendFileSync(tmpFile.name, this.Region + "/" + this.LogGroup + "/" + this.LogStream);
            for(var message of this.LogEvents)
            {
                fs.appendFileSync(tmpFile.name, "\n" + "----------------------------------------------------------");
                fs.appendFileSync(tmpFile.name, "\n" + message.message);
            }
            fs.appendFileSync(tmpFile.name, "\n" + "---------------------------END OF LOGS--------------------");
            ui.openFile(tmpFile.name);    
        } 
        catch (error:any) 
        {
            ui.showErrorMessage('ExportLogs Error !!!', error);
            ui.logToOutput("ExportLogs Error !!!", error); 
        }

    }
}