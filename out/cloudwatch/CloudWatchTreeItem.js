"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudWatchTreeItem = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = require("vscode");
class CloudWatchTreeItem extends vscode.TreeItem {
    constructor() {
        super("1234");
        this.IsFav = false;
        this.refreshUI();
    }
    refreshUI() {
        super.label = "1234";
        this.iconPath = new vscode.ThemeIcon('circle-outline');
    }
    doesFilterMatch(filterString) {
        let words = filterString.split(',');
        let matchingWords = [];
        for (var word of words) {
            if (word === 'fav' && this.IsFav) {
                matchingWords.push(word);
                continue;
            }
        }
        return words.length === matchingWords.length;
    }
}
exports.CloudWatchTreeItem = CloudWatchTreeItem;
//# sourceMappingURL=CloudWatchTreeItem.js.map