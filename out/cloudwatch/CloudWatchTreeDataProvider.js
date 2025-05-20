"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewType = exports.CloudWatchTreeDataProvider = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = require("vscode");
const CloudWatchTreeItem_1 = require("./CloudWatchTreeItem");
const CloudWatchTreeView_1 = require("./CloudWatchTreeView");
class CloudWatchTreeDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.RegionNodeList = [];
        this.LogGroupNodeList = [];
        this.LogStreamNodeList = [];
        this.LogGroupList = [];
        this.LogStreamList = [];
    }
    Refresh() {
        this._onDidChangeTreeData.fire();
    }
    AddLogGroup(Region, LogGroup) {
        for (var lg of this.LogGroupList) {
            if (lg.Region === Region && lg.LogGroup === LogGroup) {
                return;
            }
        }
        this.LogGroupList.push({ Region: Region, LogGroup: LogGroup });
        this.LoadLogGroupNodeList();
        this.LoadRegionNodeList();
        this.Refresh();
    }
    RemoveLogGroup(Region, LogGroup) {
        for (let i = 0; i < this.LogStreamList.length; i++) {
            if (this.LogStreamList[i].Region === Region && this.LogStreamList[i].LogGroup === LogGroup) {
                this.LogStreamList.splice(i, 1);
                i--;
            }
        }
        this.LoadLogStreamNodeList();
        for (let i = 0; i < this.LogGroupList.length; i++) {
            if (this.LogGroupList[i].Region === Region && this.LogGroupList[i].LogGroup === LogGroup) {
                this.LogGroupList.splice(i, 1);
                i--;
            }
        }
        this.LoadLogGroupNodeList();
        this.LoadRegionNodeList();
        this.Refresh();
    }
    RemoveAllLogStreams(Region, LogGroup) {
        for (let i = 0; i < this.LogStreamList.length; i++) {
            if (this.LogStreamList[i].Region === Region && this.LogStreamList[i].LogGroup === LogGroup) {
                this.LogStreamList.splice(i, 1);
                i--;
            }
        }
        this.LoadLogStreamNodeList();
        this.Refresh();
    }
    AddLogStream(Region, LogGroup, LogStream) {
        for (var ls of this.LogStreamList) {
            if (ls.Region === Region && ls.LogGroup === LogGroup && ls.LogStream === LogStream) {
                return;
            }
        }
        this.LogStreamList.push({ Region: Region, LogGroup: LogGroup, LogStream: LogStream });
        this.LoadLogStreamNodeList();
        this.Refresh();
    }
    RemoveLogStream(Region, LogGroup, LogStream) {
        for (let i = 0; i < this.LogStreamList.length; i++) {
            if (this.LogStreamList[i].Region === Region && this.LogStreamList[i].LogGroup === LogGroup && this.LogStreamList[i].LogStream === LogStream) {
                this.LogStreamList.splice(i, 1);
                i--;
            }
        }
        this.LoadLogStreamNodeList();
        this.Refresh();
    }
    LoadLogGroupNodeList() {
        this.LogGroupNodeList = [];
        for (var lg of this.LogGroupList) {
            let treeItem = new CloudWatchTreeItem_1.CloudWatchTreeItem(lg.LogGroup, CloudWatchTreeItem_1.TreeItemType.LogGroup);
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            treeItem.Region = lg.Region;
            treeItem.LogGroup = lg.LogGroup;
            this.LogGroupNodeList.push(treeItem);
        }
    }
    LoadRegionNodeList() {
        this.LogGroupNodeList = [];
        for (var lg of this.LogGroupList) {
            if (this.GetRegionNode(lg.Region) === undefined) {
                let treeItem = new CloudWatchTreeItem_1.CloudWatchTreeItem(lg.Region, CloudWatchTreeItem_1.TreeItemType.Region);
                treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
                treeItem.Region = lg.Region;
                this.RegionNodeList.push(treeItem);
            }
        }
    }
    GetRegionNode(Region) {
        for (var node of this.RegionNodeList) {
            if (node.Region === Region) {
                return node;
            }
        }
        return undefined;
    }
    LoadLogStreamNodeList() {
        this.LogStreamNodeList = [];
        for (var lg of this.LogStreamList) {
            let treeItem = new CloudWatchTreeItem_1.CloudWatchTreeItem(lg.LogStream, CloudWatchTreeItem_1.TreeItemType.LogStream);
            treeItem.Region = lg.Region;
            treeItem.LogGroup = lg.LogGroup;
            treeItem.LogStream = lg.LogStream;
            this.LogStreamNodeList.push(treeItem);
        }
    }
    getChildren(node) {
        let result = [];
        result = this.GetNodesRegionLogGroupLogStream(node);
        return Promise.resolve(result);
    }
    GetNodesRegionLogGroupLogStream(node) {
        let result = [];
        if (!node) {
            result = this.GetRegionNodes();
        }
        else if (node.TreeItemType === CloudWatchTreeItem_1.TreeItemType.Region) {
            result = this.GetLogGroupNodesParentRegion(node);
        }
        else if (node.TreeItemType === CloudWatchTreeItem_1.TreeItemType.LogGroup) {
            result = this.GetLogStreamNodesParentLogGroup(node);
        }
        return result;
    }
    GetRegionNodes() {
        var result = [];
        for (var node of this.RegionNodeList) {
            if (CloudWatchTreeView_1.CloudWatchTreeView.Current && CloudWatchTreeView_1.CloudWatchTreeView.Current.FilterString && !node.IsFilterStringMatch(CloudWatchTreeView_1.CloudWatchTreeView.Current.FilterString)) {
                continue;
            }
            if (CloudWatchTreeView_1.CloudWatchTreeView.Current && CloudWatchTreeView_1.CloudWatchTreeView.Current.isShowOnlyFavorite && !(node.IsFav || node.IsAnyChidrenFav())) {
                continue;
            }
            result.push(node);
        }
        return result;
    }
    GetNodesLogStream(node) {
        let result = [];
        result = this.GetLogStreamNodes();
        return result;
    }
    GetNodesLogGroupLogStream(node) {
        let result = [];
        if (!node) {
            result = this.GetLogGroupNodes();
        }
        else if (node.TreeItemType === CloudWatchTreeItem_1.TreeItemType.LogGroup) {
            result = this.GetLogStreamNodesParentLogGroup(node);
        }
        return result;
    }
    GetLogGroupNodes() {
        var result = [];
        for (var node of this.LogGroupNodeList) {
            if (CloudWatchTreeView_1.CloudWatchTreeView.Current && CloudWatchTreeView_1.CloudWatchTreeView.Current.FilterString && !node.IsFilterStringMatch(CloudWatchTreeView_1.CloudWatchTreeView.Current.FilterString)) {
                continue;
            }
            if (CloudWatchTreeView_1.CloudWatchTreeView.Current && CloudWatchTreeView_1.CloudWatchTreeView.Current.isShowOnlyFavorite && !(node.IsFav || node.IsAnyChidrenFav())) {
                continue;
            }
            result.push(node);
        }
        return result;
    }
    GetLogGroupNodesParentRegion(RegionNode) {
        var result = [];
        for (var node of this.LogGroupNodeList) {
            if (node.Region !== RegionNode.Region) {
                continue;
            }
            if (CloudWatchTreeView_1.CloudWatchTreeView.Current && CloudWatchTreeView_1.CloudWatchTreeView.Current.FilterString && !node.IsFilterStringMatch(CloudWatchTreeView_1.CloudWatchTreeView.Current.FilterString)) {
                continue;
            }
            if (CloudWatchTreeView_1.CloudWatchTreeView.Current && CloudWatchTreeView_1.CloudWatchTreeView.Current.isShowOnlyFavorite && !(node.IsFav || node.IsAnyChidrenFav())) {
                continue;
            }
            node.Parent = RegionNode;
            if (RegionNode.Children.indexOf(node) === -1) {
                RegionNode.Children.push(node);
            }
            result.push(node);
        }
        return result;
    }
    GetLogStreamNodesParentLogGroup(LogGroupNode) {
        var result = [];
        for (var node of this.LogStreamNodeList) {
            if (!(node.Region === LogGroupNode.Region && node.LogGroup === LogGroupNode.LogGroup)) {
                continue;
            }
            if (CloudWatchTreeView_1.CloudWatchTreeView.Current && CloudWatchTreeView_1.CloudWatchTreeView.Current.FilterString && !node.IsFilterStringMatch(CloudWatchTreeView_1.CloudWatchTreeView.Current.FilterString)) {
                continue;
            }
            if (CloudWatchTreeView_1.CloudWatchTreeView.Current && CloudWatchTreeView_1.CloudWatchTreeView.Current.isShowOnlyFavorite && !(node.IsFav || node.IsAnyChidrenFav())) {
                continue;
            }
            node.Parent = LogGroupNode;
            if (LogGroupNode.Children.indexOf(node) === -1) {
                LogGroupNode.Children.push(node);
            }
            result.push(node);
        }
        return result;
    }
    GetLogStreamNodes() {
        var result = [];
        for (var node of this.LogStreamNodeList) {
            if (CloudWatchTreeView_1.CloudWatchTreeView.Current && CloudWatchTreeView_1.CloudWatchTreeView.Current.FilterString && !node.IsFilterStringMatch(CloudWatchTreeView_1.CloudWatchTreeView.Current.FilterString)) {
                continue;
            }
            if (CloudWatchTreeView_1.CloudWatchTreeView.Current && CloudWatchTreeView_1.CloudWatchTreeView.Current.isShowOnlyFavorite && !(node.IsFav || node.IsAnyChidrenFav())) {
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
var ViewType;
(function (ViewType) {
    ViewType[ViewType["Region_LogGroup_LogStream"] = 1] = "Region_LogGroup_LogStream";
    ViewType[ViewType["LogGroup_LogStream"] = 2] = "LogGroup_LogStream";
    ViewType[ViewType["LogStream"] = 3] = "LogStream";
})(ViewType = exports.ViewType || (exports.ViewType = {}));
//# sourceMappingURL=CloudWatchTreeDataProvider.js.map