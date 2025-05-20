"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudWatchTreeView = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = require("vscode");
const CloudWatchTreeItem_1 = require("./CloudWatchTreeItem");
const CloudWatchTreeDataProvider_1 = require("./CloudWatchTreeDataProvider");
const ui = require("../common/ui");
const api = require("../common/api");
const CloudWatchLogView_1 = require("./CloudWatchLogView");
class CloudWatchTreeView {
    constructor(context) {
        this.FilterString = "";
        this.isShowOnlyFavorite = false;
        this.AwsProfile = "default";
        this.LastUsedRegion = "us-east-1";
        ui.logToOutput('TreeView.constructor Started');
        this.context = context;
        this.treeDataProvider = new CloudWatchTreeDataProvider_1.CloudWatchTreeDataProvider();
        this.LoadState();
        this.view = vscode.window.createTreeView('CloudWatchTreeView', { treeDataProvider: this.treeDataProvider, showCollapseAll: true });
        this.Refresh();
        context.subscriptions.push(this.view);
        CloudWatchTreeView.Current = this;
        this.SetFilterMessage();
    }
    Refresh() {
        ui.logToOutput('CloudWatchTreeView.refresh Started');
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: "Aws Cloudwatch: Loading...",
        }, (progress, token) => {
            progress.report({ increment: 0 });
            this.LoadTreeItems();
            return new Promise(resolve => { resolve(); });
        });
    }
    LoadTreeItems() {
        ui.logToOutput('CloudWatchTreeView.loadTreeItems Started');
        this.treeDataProvider.LoadRegionNodeList();
        this.treeDataProvider.LoadLogGroupNodeList();
        this.treeDataProvider.LoadLogStreamNodeList();
        this.treeDataProvider.Refresh();
        this.SetViewTitle();
    }
    ResetView() {
        ui.logToOutput('CloudWatchTreeView.resetView Started');
        this.FilterString = '';
        this.treeDataProvider.Refresh();
        this.SetViewTitle();
        this.SaveState();
        this.Refresh();
    }
    async AddToFav(node) {
        ui.logToOutput('CloudWatchTreeView.AddToFav Started');
        node.IsFav = true;
        node.refreshUI();
    }
    async DeleteFromFav(node) {
        ui.logToOutput('CloudWatchTreeView.DeleteFromFav Started');
        node.IsFav = false;
        node.refreshUI();
    }
    async Filter() {
        ui.logToOutput('CloudWatchTreeView.Filter Started');
        let filterStringTemp = await vscode.window.showInputBox({ value: this.FilterString, placeHolder: 'Enter Your Filter Text' });
        if (filterStringTemp === undefined) {
            return;
        }
        this.FilterString = filterStringTemp;
        this.treeDataProvider.Refresh();
        this.SetFilterMessage();
        this.SaveState();
    }
    async ShowOnlyFavorite() {
        ui.logToOutput('CloudWatchTreeView.ShowOnlyFavorite Started');
        this.isShowOnlyFavorite = !this.isShowOnlyFavorite;
        this.treeDataProvider.Refresh();
        this.SetFilterMessage();
        this.SaveState();
    }
    async SetViewTitle() {
        this.view.title = "Aws Cloud Watch";
    }
    SaveState() {
        ui.logToOutput('CloudWatchTreeView.saveState Started');
        try {
            this.context.globalState.update('AwsProfile', this.AwsProfile);
            this.context.globalState.update('FilterString', this.FilterString);
            this.context.globalState.update('ShowOnlyFavorite', this.ShowOnlyFavorite);
            this.context.globalState.update('LogGroupList', this.treeDataProvider.LogGroupList);
            this.context.globalState.update('LogStreamList', this.treeDataProvider.LogStreamList);
            this.context.globalState.update('AwsEndPoint', this.AwsEndPoint);
            ui.logToOutput("CloudWatchTreeView.saveState Successfull");
        }
        catch (error) {
            ui.logToOutput("CloudWatchTreeView.saveState Error !!!");
        }
    }
    LoadState() {
        ui.logToOutput('CloudWatchTreeView.loadState Started');
        try {
            let AwsProfileTemp = this.context.globalState.get('AwsProfile');
            if (AwsProfileTemp) {
                this.AwsProfile = AwsProfileTemp;
            }
            let filterStringTemp = this.context.globalState.get('FilterString');
            if (filterStringTemp) {
                this.FilterString = filterStringTemp;
            }
            let ShowOnlyFavoriteTemp = this.context.globalState.get('ShowOnlyFavorite');
            if (ShowOnlyFavoriteTemp) {
                this.isShowOnlyFavorite = ShowOnlyFavoriteTemp;
            }
            let LogGroupListTemp = this.context.globalState.get('LogGroupList');
            // remove prev format, you can remove this after some time
            if (LogGroupListTemp && Array.isArray(LogGroupListTemp) && LogGroupListTemp[0] && Array.isArray(LogGroupListTemp[0])) {
                LogGroupListTemp = undefined;
            }
            if (LogGroupListTemp) {
                this.treeDataProvider.LogGroupList = LogGroupListTemp;
            }
            let LogStreamListTemp = this.context.globalState.get('LogStreamList');
            // remove prev format, you can remove this after some time
            if (LogStreamListTemp && Array.isArray(LogStreamListTemp) && LogStreamListTemp[0] && Array.isArray(LogStreamListTemp[0])) {
                LogStreamListTemp = undefined;
            }
            if (LogStreamListTemp) {
                this.treeDataProvider.LogStreamList = LogStreamListTemp;
            }
            let AwsEndPointTemp = this.context.globalState.get('AwsEndPoint');
            this.AwsEndPoint = AwsEndPointTemp;
            ui.logToOutput("CloudWatchTreeView.loadState Successfull");
        }
        catch (error) {
            ui.logToOutput("CloudWatchTreeView.loadState Error !!!");
        }
    }
    SetFilterMessage() {
        this.view.message = "Profile:" + this.AwsProfile + " " + this.GetBoolenSign(this.isShowOnlyFavorite) + "Fav, " + this.FilterString;
    }
    GetBoolenSign(variable) {
        return variable ? "✓" : "𐄂";
    }
    async AddLogGroup() {
        ui.logToOutput('CloudWatchTreeView.AddLogGroup Started');
        let selectedRegion = await vscode.window.showInputBox({ value: this.LastUsedRegion, placeHolder: 'Type Region Name' });
        if (!selectedRegion) {
            return;
        }
        this.LastUsedRegion = selectedRegion;
        var resultLogGroup = await api.GetLogGroupList(selectedRegion);
        if (!resultLogGroup.isSuccessful) {
            return;
        }
        let selectedLogGroupList = await vscode.window.showQuickPick(resultLogGroup.result, { canPickMany: true, placeHolder: 'Select Log Group' });
        if (!selectedLogGroupList || selectedLogGroupList.length === 0) {
            return;
        }
        for (var selectedLogGroup of selectedLogGroupList) {
            this.treeDataProvider.AddLogGroup(selectedRegion, selectedLogGroup);
        }
        this.Refresh();
        this.SaveState();
    }
    async AddLogGroupByName() {
        ui.logToOutput('CloudWatchTreeView.AddLogGroupByName Started');
        let selectedRegion = await vscode.window.showInputBox({ value: this.LastUsedRegion, placeHolder: 'Type Region Name' });
        if (!selectedRegion) {
            return;
        }
        this.LastUsedRegion = selectedRegion;
        let selectedLogGroupName = await vscode.window.showInputBox({ placeHolder: 'Enter Log Group Search Text' });
        if (!selectedLogGroupName) {
            return;
        }
        var resultLogGroup = await api.GetLogGroupList(selectedRegion, selectedLogGroupName);
        if (!resultLogGroup.isSuccessful) {
            return;
        }
        let selectedLogGroupList = await vscode.window.showQuickPick(resultLogGroup.result, { canPickMany: true, placeHolder: 'Select Log Group' });
        if (!selectedLogGroupList || selectedLogGroupList.length === 0) {
            return;
        }
        for (var selectedLogGroup of selectedLogGroupList) {
            this.treeDataProvider.AddLogGroup(selectedRegion, selectedLogGroup);
        }
        this.Refresh();
        this.SaveState();
    }
    async RemoveLogGroup(node) {
        ui.logToOutput('CloudWatchTreeView.RemoveLogGroup Started');
        if (node.TreeItemType !== CloudWatchTreeItem_1.TreeItemType.LogGroup) {
            return;
        }
        if (!node.Region || !node.LogGroup) {
            return;
        }
        this.treeDataProvider.RemoveLogGroup(node.Region, node.LogGroup);
        this.SaveState();
    }
    async AddLogStream(node) {
        ui.logToOutput('CloudWatchTreeView.AddLogStream Started');
        if (!node.Region || !node.LogGroup) {
            return;
        }
        let filterStringTemp = await vscode.window.showInputBox({ placeHolder: 'Log Stream Name Search Text' });
        if (filterStringTemp === undefined) {
            return;
        }
        var resultLogStream = await api.GetLogStreams(node.Region, node.LogGroup, filterStringTemp);
        if (!resultLogStream.isSuccessful) {
            return;
        }
        if (!resultLogStream.result) {
            return;
        }
        if (resultLogStream.result && resultLogStream.result.length === 0) {
            ui.showInfoMessage('No Log Streams Found');
            return;
        }
        let logStreamList = [];
        for (var ls of resultLogStream.result) {
            let date = new Date(ls.creationTime ? ls.creationTime : 1);
            logStreamList.push(ls.logStreamName + " (" + date.toDateString() + ")");
        }
        let selectedLogStreamList = await vscode.window.showQuickPick(logStreamList, { canPickMany: true, placeHolder: 'Select Log Stream' });
        if (!selectedLogStreamList || selectedLogStreamList.length === 0) {
            return;
        }
        for (var ls of resultLogStream.result) {
            if (!ls.logStreamName) {
                continue;
            }
            let lsName = ls.logStreamName;
            if (selectedLogStreamList.find(e => e.includes(lsName))) {
                this.treeDataProvider.AddLogStream(node.Region, node.LogGroup, ls.logStreamName);
            }
        }
        this.SaveState();
    }
    async AddAllLogStreams(node) {
        ui.logToOutput('CloudWatchTreeView.AddLogStream Started');
        if (!node.Region || !node.LogGroup) {
            return;
        }
        var resultLogStream = await api.GetLogStreamList(node.Region, node.LogGroup);
        if (!resultLogStream.isSuccessful) {
            return;
        }
        if (resultLogStream.result && resultLogStream.result.length === 0) {
            ui.showInfoMessage('No Log Streams Found');
            return;
        }
        for (var logStream of resultLogStream.result) {
            this.treeDataProvider.AddLogStream(node.Region, node.LogGroup, logStream);
        }
        this.SaveState();
    }
    async AddLogStreamsByDate(node) {
        ui.logToOutput('CloudWatchTreeView.AddLogStreamsByDate Started');
        if (!node.Region || !node.LogGroup) {
            return;
        }
        let today = new Date().toISOString().split('T')[0];
        let dateTemp = await vscode.window.showInputBox({ value: today, placeHolder: 'Date YYYY-MM-DD' });
        if (dateTemp === undefined) {
            return;
        }
        if (!dateTemp.includes('-')) {
            return;
        }
        if (dateTemp.length !== 10) {
            return;
        }
        let dateParts = dateTemp.split('-');
        let dateFilter = new Date(Date.UTC(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2])));
        var resultLogStream = await api.GetLogStreamList(node.Region, node.LogGroup, false, dateFilter);
        if (!resultLogStream.isSuccessful) {
            return;
        }
        if (resultLogStream.result && resultLogStream.result.length === 0) {
            ui.showInfoMessage('No Log Streams Found');
            return;
        }
        for (var logStream of resultLogStream.result) {
            this.treeDataProvider.AddLogStream(node.Region, node.LogGroup, logStream);
        }
        this.SaveState();
    }
    async RemoveLogStream(node) {
        ui.logToOutput('CloudWatchTreeView.RemoveLogStream Started');
        if (node.TreeItemType !== CloudWatchTreeItem_1.TreeItemType.LogStream) {
            return;
        }
        if (!node.Region || !node.LogGroup || !node.LogStream) {
            return;
        }
        this.treeDataProvider.RemoveLogStream(node.Region, node.LogGroup, node.LogStream);
        this.SaveState();
    }
    async RemoveAllLogStreams(node) {
        ui.logToOutput('CloudWatchTreeView.RemoveAllLogStreams Started');
        if (node.TreeItemType !== CloudWatchTreeItem_1.TreeItemType.LogGroup) {
            return;
        }
        if (!node.Region || !node.LogGroup) {
            return;
        }
        this.treeDataProvider.RemoveAllLogStreams(node.Region, node.LogGroup);
        this.SaveState();
    }
    async ShowCloudWatchLogView(node) {
        ui.logToOutput('CloudWatchTreeView.ShowCloudWatchLogView Started');
        if (node.TreeItemType !== CloudWatchTreeItem_1.TreeItemType.LogStream) {
            return;
        }
        if (!node.Region || !node.LogGroup || !node.LogStream) {
            return;
        }
        CloudWatchLogView_1.CloudWatchLogView.Render(this.context.extensionUri, node.Region, node.LogGroup, node.LogStream);
    }
    async SelectAwsProfile(node) {
        ui.logToOutput('CloudWatchTreeView.SelectAwsProfile Started');
        var result = await api.GetAwsProfileList();
        if (!result.isSuccessful) {
            return;
        }
        let selectedAwsProfile = await vscode.window.showQuickPick(result.result, { canPickMany: false, placeHolder: 'Select Aws Profile' });
        if (!selectedAwsProfile) {
            return;
        }
        this.AwsProfile = selectedAwsProfile;
        this.SaveState();
        this.SetFilterMessage();
    }
    async UpdateAwsEndPoint() {
        ui.logToOutput('CloudWatchTreeView.UpdateAwsEndPoint Started');
        let awsEndPointUrl = await vscode.window.showInputBox({ placeHolder: 'Enter Aws End Point URL (Leave Empty To Return To Default)', value: this.AwsEndPoint });
        if (awsEndPointUrl === undefined) {
            return;
        }
        if (awsEndPointUrl.length === 0) {
            this.AwsEndPoint = undefined;
        }
        else {
            this.AwsEndPoint = awsEndPointUrl;
        }
        this.SaveState();
        ui.showInfoMessage('Aws End Point Updated');
    }
}
exports.CloudWatchTreeView = CloudWatchTreeView;
//# sourceMappingURL=CloudWatchTreeView.js.map