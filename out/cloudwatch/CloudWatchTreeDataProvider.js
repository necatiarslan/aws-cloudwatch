"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewType = exports.CloudWatchTreeDataProvider = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = __importStar(require("vscode"));
const CloudWatchTreeItem_1 = require("./CloudWatchTreeItem");
const CloudWatchTreeView_1 = require("./CloudWatchTreeView");
const api = __importStar(require("../common/API"));
class CloudWatchTreeDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.RegionNodeList = [];
        this.LogGroupNodeList = [];
        this.LogStreamNodeList = [];
        this.LogGroupList = [];
        this.LogStreamList = [];
        this.LogStreamCache = [];
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
            treeItem.IsPinned = true;
            this.LogStreamNodeList.push(treeItem);
        }
    }
    async getChildren(node) {
        if (!node) {
            return this.GetRegionNodes();
        }
        switch (node.TreeItemType) {
            case CloudWatchTreeItem_1.TreeItemType.Region:
                return this.GetLogGroupNodesParentRegion(node);
            case CloudWatchTreeItem_1.TreeItemType.LogGroup:
                return await this.GetLogGroupChildren(node);
            case CloudWatchTreeItem_1.TreeItemType.Info:
                return await this.GetLogGroupInfoChildren(node);
            case CloudWatchTreeItem_1.TreeItemType.Today:
                return await this.GetDateFilteredLogStreams(node, 0);
            case CloudWatchTreeItem_1.TreeItemType.Yesterday:
                return await this.GetDateFilteredLogStreams(node, -1);
            case CloudWatchTreeItem_1.TreeItemType.History:
                return this.GetHistoryChildren(node);
            default:
                return [];
        }
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
    async GetLogGroupChildren(logGroupNode) {
        const result = [];
        const infoNode = new CloudWatchTreeItem_1.CloudWatchTreeItem('Info', CloudWatchTreeItem_1.TreeItemType.Info);
        infoNode.Region = logGroupNode.Region;
        infoNode.LogGroup = logGroupNode.LogGroup;
        infoNode.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        infoNode.Parent = logGroupNode;
        result.push(infoNode);
        const todayNode = new CloudWatchTreeItem_1.CloudWatchTreeItem('Today', CloudWatchTreeItem_1.TreeItemType.Today);
        todayNode.Region = logGroupNode.Region;
        todayNode.LogGroup = logGroupNode.LogGroup;
        todayNode.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        todayNode.Parent = logGroupNode;
        todayNode.command = { command: 'CloudWatchTreeView.RefreshDateNode', title: 'Refresh', arguments: [todayNode, 0] };
        result.push(todayNode);
        const yesterdayNode = new CloudWatchTreeItem_1.CloudWatchTreeItem('Yesterday', CloudWatchTreeItem_1.TreeItemType.Yesterday);
        yesterdayNode.Region = logGroupNode.Region;
        yesterdayNode.LogGroup = logGroupNode.LogGroup;
        yesterdayNode.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        yesterdayNode.Parent = logGroupNode;
        yesterdayNode.command = { command: 'CloudWatchTreeView.RefreshDateNode', title: 'Refresh', arguments: [yesterdayNode, 1] };
        result.push(yesterdayNode);
        const historyNode = new CloudWatchTreeItem_1.CloudWatchTreeItem('History', CloudWatchTreeItem_1.TreeItemType.History);
        historyNode.Region = logGroupNode.Region;
        historyNode.LogGroup = logGroupNode.LogGroup;
        historyNode.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        historyNode.Parent = logGroupNode;
        historyNode.command = { command: 'CloudWatchTreeView.AddLogStreamsByDate', title: 'Add by Date', arguments: [logGroupNode] };
        result.push(historyNode);
        for (var node of this.LogStreamNodeList) {
            if (!(node.Region === logGroupNode.Region && node.LogGroup === logGroupNode.LogGroup)) {
                continue;
            }
            if (CloudWatchTreeView_1.CloudWatchTreeView.Current && CloudWatchTreeView_1.CloudWatchTreeView.Current.FilterString && !node.IsFilterStringMatch(CloudWatchTreeView_1.CloudWatchTreeView.Current.FilterString)) {
                continue;
            }
            if (CloudWatchTreeView_1.CloudWatchTreeView.Current && CloudWatchTreeView_1.CloudWatchTreeView.Current.isShowOnlyFavorite && !(node.IsFav || node.IsAnyChidrenFav())) {
                continue;
            }
            node.Parent = logGroupNode;
            if (logGroupNode.Children.indexOf(node) === -1) {
                logGroupNode.Children.push(node);
            }
            result.push(node);
        }
        return result;
    }
    async GetLogGroupInfoChildren(infoNode) {
        const result = [];
        if (!infoNode.Region || !infoNode.LogGroup) {
            return result;
        }
        const info = await api.GetLogGroupInfo(infoNode.Region, infoNode.LogGroup);
        if (!info.isSuccessful || !info.result) {
            return result;
        }
        const detailMap = [
            { label: 'Log class', value: info.result.logGroupClass },
            { label: 'ARN', value: info.result.arn },
            { label: 'Creation time', value: info.result.creationTime ? new Date(info.result.creationTime).toLocaleString() : undefined },
            { label: 'Retention (days)', value: info.result.retentionInDays },
        ];
        for (const detail of detailMap) {
            const detailNode = new CloudWatchTreeItem_1.CloudWatchTreeItem(`${detail.label}: ${detail.value ?? 'N/A'}`, CloudWatchTreeItem_1.TreeItemType.InfoDetail);
            detailNode.Region = infoNode.Region;
            detailNode.LogGroup = infoNode.LogGroup;
            detailNode.collapsibleState = vscode.TreeItemCollapsibleState.None;
            detailNode.Parent = infoNode;
            result.push(detailNode);
        }
        return result;
    }
    async GetDateFilteredLogStreams(dateNode, dayOffset) {
        const result = [];
        if (!dateNode.Region || !dateNode.LogGroup) {
            return result;
        }
        // Check if children are already loaded
        if (dateNode.Children && dateNode.Children.length > 0) {
            return dateNode.Children;
        }
        // Load streams on expand
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() + dayOffset);
        const end = new Date(start.getTime() + 86400000);
        const detailedStreams = await this.GetLogStreamsDetailed(dateNode.Region, dateNode.LogGroup);
        for (const ds of detailedStreams) {
            if (!ds.lastEventTimestamp) {
                continue;
            }
            if (ds.lastEventTimestamp < start.getTime() || ds.lastEventTimestamp >= end.getTime()) {
                continue;
            }
            if (!ds.logStreamName) {
                continue;
            }
            const streamNode = new CloudWatchTreeItem_1.CloudWatchTreeItem(ds.logStreamName, CloudWatchTreeItem_1.TreeItemType.LogStream);
            streamNode.Region = dateNode.Region;
            streamNode.LogGroup = dateNode.LogGroup;
            streamNode.LogStream = ds.logStreamName;
            streamNode.description = this.FormatLastEventTime(ds.lastEventTimestamp);
            streamNode.IsPinned = false;
            streamNode.collapsibleState = vscode.TreeItemCollapsibleState.None;
            streamNode.Parent = dateNode;
            result.push(streamNode);
        }
        // Cache the loaded children
        dateNode.Children = result;
        return result;
    }
    async LoadDateFilteredLogStreams(dateNode, dayOffset) {
        if (!dateNode.Region || !dateNode.LogGroup) {
            return;
        }
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() + dayOffset);
        const end = new Date(start.getTime() + 86400000);
        const result = [];
        const detailedStreams = await this.GetLogStreamsDetailed(dateNode.Region, dateNode.LogGroup);
        for (const ds of detailedStreams) {
            if (!ds.lastEventTimestamp) {
                continue;
            }
            if (ds.lastEventTimestamp < start.getTime() || ds.lastEventTimestamp >= end.getTime()) {
                continue;
            }
            if (!ds.logStreamName) {
                continue;
            }
            const streamNode = new CloudWatchTreeItem_1.CloudWatchTreeItem(ds.logStreamName, CloudWatchTreeItem_1.TreeItemType.LogStream);
            streamNode.Region = dateNode.Region;
            streamNode.LogGroup = dateNode.LogGroup;
            streamNode.LogStream = ds.logStreamName;
            streamNode.description = this.FormatLastEventTime(ds.lastEventTimestamp);
            streamNode.IsPinned = false;
            streamNode.collapsibleState = vscode.TreeItemCollapsibleState.None;
            streamNode.Parent = dateNode;
            result.push(streamNode);
        }
        // Cache the loaded children
        dateNode.Children = result;
        this.Refresh();
    }
    GetHistoryChildren(historyNode) {
        const result = [];
        return result;
    }
    async GetLogStreamsDetailed(Region, LogGroup) {
        if (!Region || !LogGroup) {
            return [];
        }
        if (!this.LogStreamCache.find(c => c.Region === Region && c.LogGroup === LogGroup)) {
            const result = await api.GetLogStreams(Region, LogGroup);
            if (result.isSuccessful && result.result) {
                this.LogStreamCache.push({ Region: Region, LogGroup: LogGroup, LogStream: result.result });
            }
        }
        return this.LogStreamCache.find(c => c.Region === Region && c.LogGroup === LogGroup)?.LogStream || [];
    }
    FormatLastEventTime(timestamp) {
        if (!timestamp) {
            return undefined;
        }
        return new Date(timestamp).toLocaleString();
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
})(ViewType || (exports.ViewType = ViewType = {}));
//# sourceMappingURL=CloudWatchTreeDataProvider.js.map