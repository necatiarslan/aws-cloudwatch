"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudWatchTreeView = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = require("vscode");
const CloudWatchTreeItem_1 = require("./CloudWatchTreeItem");
const CloudWatchTreeDataProvider_1 = require("./CloudWatchTreeDataProvider");
const ui = require("../common/UI");
const api = require("../common/API");
class CloudWatchTreeView {
    constructor(context) {
        this.FilterString = '';
        this.isShowOnlyFavorite = false;
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
        let filterStringTemp = await vscode.window.showInputBox({ value: this.FilterString, placeHolder: 'Enter your filters seperated by comma' });
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
            this.context.globalState.update('FilterString', this.FilterString);
            this.context.globalState.update('ShowOnlyFavorite', this.ShowOnlyFavorite);
            this.context.globalState.update('LogGroupList', this.treeDataProvider.LogGroupList);
            this.context.globalState.update('LogStreamList', this.treeDataProvider.LogStreamList);
        }
        catch (error) {
            ui.logToOutput("CloudWatchTreeView.saveState Error !!!");
        }
    }
    LoadState() {
        ui.logToOutput('CloudWatchTreeView.loadState Started');
        try {
            let filterStringTemp = this.context.globalState.get('FilterString');
            if (filterStringTemp) {
                this.FilterString = filterStringTemp;
                this.SetFilterMessage();
            }
            let ShowOnlyFavoriteTemp = this.context.globalState.get('ShowOnlyFavorite');
            if (ShowOnlyFavoriteTemp) {
                this.isShowOnlyFavorite = ShowOnlyFavoriteTemp;
            }
            let LogGroupListTemp = this.context.globalState.get('LogGroupList');
            if (LogGroupListTemp) {
                this.treeDataProvider.LogGroupList = LogGroupListTemp;
            }
            let LogStreamListTemp = this.context.globalState.get('LogStreamList');
            if (LogStreamListTemp) {
                this.treeDataProvider.LogStreamList = LogStreamListTemp;
            }
        }
        catch (error) {
            ui.logToOutput("CloudWatchTreeView.loadState Error !!!");
        }
    }
    SetFilterMessage() {
        this.view.message = this.GetBoolenSign(this.isShowOnlyFavorite) + 'Fav, ' + this.FilterString;
    }
    GetBoolenSign(variable) {
        return variable ? "✓" : "𐄂";
    }
    async AddLogGroup() {
        ui.logToOutput('CloudWatchTreeView.AddLogGroup Started');
        //TODO
        //var resultRegions = await api.GetRegionList();
        //if(!resultRegions.isSuccessful){ return; }
        //let selectedRegion = await vscode.window.showQuickPick(resultRegions.result, {canPickMany:false, placeHolder: 'Select Region'});
        //if(!selectedRegion){ return; }
        let selectedRegion = "us-east-1";
        var resultLogGroup = await api.GetLogGroupList(selectedRegion);
        if (!resultLogGroup.isSuccessful) {
            return;
        }
        let selectedLogGroup = await vscode.window.showQuickPick(resultLogGroup.result, { canPickMany: false, placeHolder: 'Select Log Group' });
        if (!selectedLogGroup) {
            return;
        }
        this.treeDataProvider.AddLogGroup(selectedRegion, selectedLogGroup);
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
        var resultLogStream = await api.GetLogStreamList(node.Region, node.LogGroup);
        if (!resultLogStream.isSuccessful) {
            return;
        }
        let selectedLogStream = await vscode.window.showQuickPick(resultLogStream.result, { canPickMany: false, placeHolder: 'Select Log Stream' });
        if (!selectedLogStream) {
            return;
        }
        this.treeDataProvider.AddLogStream(node.Region, node.LogGroup, selectedLogStream);
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
}
exports.CloudWatchTreeView = CloudWatchTreeView;
//# sourceMappingURL=CloudWatchTreeView.js.map