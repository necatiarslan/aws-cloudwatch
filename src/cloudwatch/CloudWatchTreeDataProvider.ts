/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { CloudWatchTreeItem } from './CloudWatchTreeItem';
import { CloudWatchTreeView } from './CloudWatchTreeView';

export class CloudWatchTreeDataProvider implements vscode.TreeDataProvider<CloudWatchTreeItem>
{
	private _onDidChangeTreeData: vscode.EventEmitter<CloudWatchTreeItem | undefined | void> = new vscode.EventEmitter<CloudWatchTreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<CloudWatchTreeItem | undefined | void> = this._onDidChangeTreeData.event;
	treeItemList: CloudWatchTreeItem[] = [];
	visibletreeItemList: CloudWatchTreeItem[] = [];

	Refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	LoadTreeItems(){
		this.treeItemList = [];
		//TODO aws code
		let treeItem = new CloudWatchTreeItem();
		this.treeItemList.push(treeItem);
	}

	getChildren(element: CloudWatchTreeItem): Thenable<CloudWatchTreeItem[]> {
		if (!element) {
			this.visibletreeItemList = this.GetVisibleTreeItemList();
			return Promise.resolve(this.visibletreeItemList);
		}
		return Promise.resolve([]);
	}

	GetVisibleTreeItemList(): CloudWatchTreeItem[]{
		var result: CloudWatchTreeItem[] = [];
		for (var node of this.treeItemList) {
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.FilterString && !node.doesFilterMatch(CloudWatchTreeView.Current.FilterString)) { continue; }
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.isShowOnlyFavorite && !node.IsFav) { continue; }

			result.push(node);
		}
		return result;
	}

	getTreeItem(element: CloudWatchTreeItem): CloudWatchTreeItem {
		return element;
	}
}