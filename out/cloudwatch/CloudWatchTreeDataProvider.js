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
        this.treeItemList = [];
        this.visibletreeItemList = [];
    }
    Refresh() {
        this._onDidChangeTreeData.fire();
    }
    LoadTreeItems() {
        this.treeItemList = [];
        //TODO aws code
        let treeItem = new CloudWatchTreeItem_1.CloudWatchTreeItem();
        this.treeItemList.push(treeItem);
    }
    getChildren(element) {
        if (!element) {
            this.visibletreeItemList = this.GetVisibleTreeItemList();
            return Promise.resolve(this.visibletreeItemList);
        }
        return Promise.resolve([]);
    }
    GetVisibleTreeItemList() {
        var result = [];
        for (var node of this.treeItemList) {
            if (CloudWatchTreeView_1.CloudWatchTreeView.Current && CloudWatchTreeView_1.CloudWatchTreeView.Current.FilterString && !node.doesFilterMatch(CloudWatchTreeView_1.CloudWatchTreeView.Current.FilterString)) {
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