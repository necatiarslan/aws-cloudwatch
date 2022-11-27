/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { TreeItem } from './treeItem';
import { TreeView } from './treeView';

export class TreeDataProvider implements vscode.TreeDataProvider<TreeItem>
{
	private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | void> = new vscode.EventEmitter<TreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | void> = this._onDidChangeTreeData.event;
	treeItemList: TreeItem[] = [];
	visibletreeItemList: TreeItem[] = [];

	Refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	LoadTreeItems(){
		this.treeItemList = [];

		let treeItem = new TreeItem();
		this.treeItemList.push(treeItem);
	}

	GetChildren(element: TreeItem): Thenable<TreeItem[]> {
		if (!element) {
			this.visibletreeItemList = this.GetVisibleTreeItemList();
			return Promise.resolve(this.visibletreeItemList);
		}
		return Promise.resolve([]);
	}

	GetVisibleTreeItemList(): TreeItem[]{
		var result: TreeItem[] = [];
		for (var node of this.treeItemList) {
			if (TreeView.Current && TreeView.Current.FilterString && !node.doesFilterMatch(TreeView.Current.FilterString)) { continue; }
			if (TreeView.Current && TreeView.Current.isShowOnlyFavorite && !node.IsFav) { continue; }

			result.push(node);
		}
		return result;
	}

	GetTreeItem(element: TreeItem): TreeItem {
		return element;
	}
}