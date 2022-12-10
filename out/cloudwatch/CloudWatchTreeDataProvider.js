"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudWatchTreeDataProvider = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = require("vscode");
const CloudWatchTreeItem_1 = require("./CloudWatchTreeItem");
const CloudWatchTreeView_1 = require("./CloudWatchTreeView");
class CloudWatchTreeDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.LogGroupNodeList = [];
        this.LogStreamNodeList = [];
        this.LogGroupList = [["???", "???"]];
        this.LogStreamList = [["???", "???", "???"]];
    }
    Refresh() {
        this._onDidChangeTreeData.fire();
    }
    AddLogGroup(Region, LogGroup) {
        for (var lg of this.LogGroupList) {
            if (lg[0] === Region && lg[1] === LogGroup) {
                return;
            }
        }
        this.LogGroupList.push([Region, LogGroup]);
        this.LoadLogGroupNodeList();
        this.Refresh();
    }
    RemoveLogGroup(Region, LogGroup) {
        //TODO
    }
    AddLogStream(Region, LogGroup, LogStream) {
        for (var ls of this.LogStreamList) {
            if (ls[0] === Region && ls[1] === LogGroup && ls[2] === LogStream) {
                return;
            }
        }
        this.LogStreamList.push([Region, LogGroup, LogStream]);
        this.LoadLogStreamNodeList();
        this.Refresh();
    }
    RemoveLogStream(Region, LogGroup, LogStream) {
        //TODO
    }
    LoadLogGroupNodeList() {
        this.LogGroupNodeList = [];
        for (var lg of this.LogGroupList) {
            if (lg[0] === "???") {
                continue;
            }
            let treeItem = new CloudWatchTreeItem_1.CloudWatchTreeItem(lg[1], CloudWatchTreeItem_1.TreeItemType.LogGroup);
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            treeItem.Region = lg[0];
            treeItem.LogGroup = lg[1];
            this.LogGroupNodeList.push(treeItem);
        }
    }
    LoadLogStreamNodeList() {
        this.LogStreamNodeList = [];
        for (var lg of this.LogStreamList) {
            if (lg[0] === "???") {
                continue;
            }
            let treeItem = new CloudWatchTreeItem_1.CloudWatchTreeItem(lg[2], CloudWatchTreeItem_1.TreeItemType.LogStream);
            treeItem.Region = lg[0];
            treeItem.LogGroup = lg[1];
            treeItem.LogStream = lg[2];
            this.LogStreamNodeList.push(treeItem);
        }
    }
    getChildren(node) {
        if (!node) {
            let nodes = this.GetLogGroupNodes();
            return Promise.resolve(nodes);
        }
        if (node.TreeItemType === CloudWatchTreeItem_1.TreeItemType.LogGroup && node.Region && node.LogGroup) {
            let nodes = this.GetLogStreamNodes(node.Region, node.LogGroup);
            return Promise.resolve(nodes);
        }
        return Promise.resolve([]);
    }
    GetLogGroupNodes() {
        var result = [];
        for (var node of this.LogGroupNodeList) {
            if (CloudWatchTreeView_1.CloudWatchTreeView.Current && CloudWatchTreeView_1.CloudWatchTreeView.Current.FilterString) {
                continue;
            }
            if (CloudWatchTreeView_1.CloudWatchTreeView.Current && CloudWatchTreeView_1.CloudWatchTreeView.Current.isShowOnlyFavorite && !node.IsFav) {
                continue;
            }
            result.push(node);
        }
        return result;
    }
    GetLogStreamNodes(Region, LogGroup) {
        var result = [];
        for (var node of this.LogStreamNodeList) {
            if (!(node.Region === Region && node.LogGroup === LogGroup)) {
                continue;
            }
            if (CloudWatchTreeView_1.CloudWatchTreeView.Current && CloudWatchTreeView_1.CloudWatchTreeView.Current.FilterString) {
                continue;
            }
            if (CloudWatchTreeView_1.CloudWatchTreeView.Current && CloudWatchTreeView_1.CloudWatchTreeView.Current.isShowOnlyFavorite && !node.IsFav) {
                continue;
            }
            result.push(node);
        }
        return result;
    }
    getTreeItem(element) {
        return element;
    }
}
exports.CloudWatchTreeDataProvider = CloudWatchTreeDataProvider;
//# sourceMappingURL=CloudWatchTreeDataProvider.js.map