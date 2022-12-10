"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeItemType = exports.CloudWatchTreeItem = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = require("vscode");
class CloudWatchTreeItem extends vscode.TreeItem {
    constructor(text, treeItemType) {
        super(text);
        this.IsFav = false;
        this.Text = text;
        this.TreeItemType = treeItemType;
        this.refreshUI();
    }
    refreshUI() {
        super.label = this.Text;
        if (this.TreeItemType === TreeItemType.Region) {
            this.iconPath = new vscode.ThemeIcon('archive');
        }
        else if (this.TreeItemType === TreeItemType.LogGroup) {
            this.iconPath = new vscode.ThemeIcon('folder');
        }
        else if (this.TreeItemType === TreeItemType.LogStream) {
            this.iconPath = new vscode.ThemeIcon('output');
        }
        else {
            this.iconPath = new vscode.ThemeIcon('circle-outline');
        }
    }
}
exports.CloudWatchTreeItem = CloudWatchTreeItem;
var TreeItemType;
(function (TreeItemType) {
    TreeItemType[TreeItemType["Region"] = 1] = "Region";
    TreeItemType[TreeItemType["LogGroup"] = 2] = "LogGroup";
    TreeItemType[TreeItemType["LogStream"] = 3] = "LogStream";
})(TreeItemType = exports.TreeItemType || (exports.TreeItemType = {}));
//# sourceMappingURL=CloudWatchTreeItem.js.map