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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeItemType = exports.CloudWatchTreeItem = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = __importStar(require("vscode"));
class CloudWatchTreeItem extends vscode.TreeItem {
    get IsFav() {
        return this._isFav;
    }
    set IsFav(value) {
        this._isFav = value;
        this.setContextValue();
    }
    get IsHidden() {
        return this._isHidden;
    }
    set IsHidden(value) {
        this._isHidden = value;
        this.setContextValue();
    }
    get ProfileToShow() {
        return this._profileToShow;
    }
    set ProfileToShow(value) {
        this._profileToShow = value;
        this.setContextValue();
    }
    constructor(text, treeItemType) {
        super(text);
        this.Children = [];
        this._profileToShow = "";
        this._isHidden = false;
        this._isFav = false;
        this.Text = text;
        this.TreeItemType = treeItemType;
        this.refreshUI();
    }
    setContextValue() {
        let contextValue = "#";
        contextValue += this.IsFav ? "Fav#" : "!Fav#";
        contextValue += this.IsHidden ? "Hidden#" : "!Hidden#";
        contextValue += this.ProfileToShow ? "Profile#" : "NoProfile#";
        switch (this.TreeItemType) {
            case TreeItemType.Region:
                contextValue += "Region#";
                break;
            case TreeItemType.LogGroup:
                contextValue += "LogGroup#";
                break;
            case TreeItemType.LogStream:
                contextValue += "LogStream#";
                break;
        }
        this.contextValue = contextValue;
    }
    refreshUI() {
        if (this.TreeItemType === TreeItemType.Region) {
            this.iconPath = new vscode.ThemeIcon('globe');
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
        this.setContextValue();
    }
    IsAnyChidrenFav() {
        return this.IsAnyChidrenFavInternal(this);
    }
    IsAnyChidrenFavInternal(node) {
        for (var n of node.Children) {
            if (n.IsFav) {
                return true;
            }
            else if (n.Children.length > 0) {
                return this.IsAnyChidrenFavInternal(n);
            }
        }
        return false;
    }
    IsFilterStringMatch(FilterString) {
        if (this.Text.includes(FilterString)) {
            return true;
        }
        if (this.IsFilterStringMatchAnyChildren(this, FilterString)) {
            return true;
        }
        return false;
    }
    IsFilterStringMatchAnyChildren(node, FilterString) {
        for (var n of node.Children) {
            if (n.Text.includes(FilterString)) {
                return true;
            }
            else if (n.Children.length > 0) {
                return this.IsFilterStringMatchAnyChildren(n, FilterString);
            }
        }
        return false;
    }
}
exports.CloudWatchTreeItem = CloudWatchTreeItem;
var TreeItemType;
(function (TreeItemType) {
    TreeItemType[TreeItemType["Region"] = 1] = "Region";
    TreeItemType[TreeItemType["LogGroup"] = 2] = "LogGroup";
    TreeItemType[TreeItemType["LogStream"] = 3] = "LogStream";
})(TreeItemType || (exports.TreeItemType = TreeItemType = {}));
//# sourceMappingURL=CloudWatchTreeItem.js.map