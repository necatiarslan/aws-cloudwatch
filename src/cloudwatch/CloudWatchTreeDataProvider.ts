/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { CloudWatchTreeItem, TreeItemType } from './CloudWatchTreeItem';
import { CloudWatchTreeView } from './CloudWatchTreeView';

export class CloudWatchTreeDataProvider implements vscode.TreeDataProvider<CloudWatchTreeItem>
{
	private _onDidChangeTreeData: vscode.EventEmitter<CloudWatchTreeItem | undefined | void> = new vscode.EventEmitter<CloudWatchTreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<CloudWatchTreeItem | undefined | void> = this._onDidChangeTreeData.event;
	LogGroupNodeList: CloudWatchTreeItem[] = [];
	LogStreamNodeList: CloudWatchTreeItem[] = [];
	LogGroupList: [[string,string]] = [["???","???"]];
	LogStreamList: [[string,string,string]] = [["???","???","???"]];

	constructor() {
		this.LogGroupList.splice(0,1);
		this.LogStreamList.splice(0,1);
	}

	Refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	AddLogGroup(Region:string, LogGroup:string){
		for(var lg of this.LogGroupList)
		{
			if(lg[0] === Region && lg[1] === LogGroup)
			{
				return;
			}
		}

		this.LogGroupList.push([Region, LogGroup]);
		this.LoadLogGroupNodeList();
		this.Refresh();
	}

	RemoveLogGroup(Region:string, LogGroup:string){
		for(let i = 0; i < this.LogStreamList.length; i++)
		{
			if(this.LogStreamList[i][0] === Region && this.LogStreamList[i][1] === LogGroup)
			{
				this.LogStreamList.splice(i, 1);
				i--;
			}
		}
		this.LoadLogStreamNodeList();

		for(let i = 0; i < this.LogGroupList.length; i++)
		{
			if(this.LogGroupList[i][0] === Region && this.LogGroupList[i][1] === LogGroup)
			{
				this.LogGroupList.splice(i, 1);
				i--;
			}
		}
		this.LoadLogGroupNodeList();
		this.Refresh();
	}

	RemoveAllLogStreams(Region:string, LogGroup:string){
		for(let i = 0; i < this.LogStreamList.length; i++)
		{
			if(this.LogStreamList[i][0] === Region && this.LogStreamList[i][1] === LogGroup)
			{
				this.LogStreamList.splice(i, 1);
				i--;
			}
		}
		this.LoadLogStreamNodeList();
		this.Refresh();
	}

	AddLogStream(Region:string, LogGroup:string, LogStream:string){
		for(var ls of this.LogStreamList)
		{
			if(ls[0] === Region && ls[1] === LogGroup && ls[2] === LogStream)
			{
				return;
			}
		}


		this.LogStreamList.push([Region, LogGroup, LogStream]);
		this.LoadLogStreamNodeList();
		this.Refresh();
	}

	RemoveLogStream(Region:string, LogGroup:string, LogStream:string){
		for(let i = 0; i < this.LogStreamList.length; i++)
		{
			if(this.LogStreamList[i][0] === Region && this.LogStreamList[i][1] === LogGroup && this.LogStreamList[i][2] === LogStream)
			{
				this.LogStreamList.splice(i, 1);
				i--;
			}
		}
		this.LoadLogStreamNodeList();
		this.Refresh();
	}

	LoadLogGroupNodeList(){
		this.LogGroupNodeList = [];
		
		for(var lg of this.LogGroupList)
		{
			if(lg[0] === "???"){ continue; }
			let treeItem = new CloudWatchTreeItem(lg[1], TreeItemType.LogGroup);
			treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
			treeItem.Region = lg[0];
			treeItem.LogGroup = lg[1];
			this.LogGroupNodeList.push(treeItem);
		}
	}

	LoadLogStreamNodeList(){
		this.LogStreamNodeList = [];
		
		for(var lg of this.LogStreamList)
		{
			if(lg[0] === "???"){ continue; }
			let treeItem = new CloudWatchTreeItem(lg[2], TreeItemType.LogStream);
			treeItem.Region = lg[0];
			treeItem.LogGroup = lg[1];
			treeItem.LogStream = lg[2];
			this.LogStreamNodeList.push(treeItem);
		}
	}

	getChildren(node: CloudWatchTreeItem): Thenable<CloudWatchTreeItem[]> {
		if (!node) {
			let nodes = this.GetLogGroupNodes();
			return Promise.resolve(nodes);
		}
		if(node.TreeItemType === TreeItemType.LogGroup && node.Region && node.LogGroup){
			let nodes = this.GetLogStreamNodes(node.Region, node.LogGroup);
			return Promise.resolve(nodes);
		}

		return Promise.resolve([]);
	}

	GetLogGroupNodes(): CloudWatchTreeItem[]{
		var result: CloudWatchTreeItem[] = [];
		for (var node of this.LogGroupNodeList) {
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.FilterString) { continue; }
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.isShowOnlyFavorite && !node.IsFav) { continue; }

			result.push(node);
		}
		return result;
	}

	GetLogStreamNodes(Region:string, LogGroup:string): CloudWatchTreeItem[]{
		var result: CloudWatchTreeItem[] = [];
		for (var node of this.LogStreamNodeList) {
			if(!(node.Region === Region && node.LogGroup === LogGroup)) { continue; }
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.FilterString) { continue; }
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.isShowOnlyFavorite && !node.IsFav) { continue; }

			result.push(node);
		}
		return result;
	}

	getTreeItem(element: CloudWatchTreeItem): CloudWatchTreeItem {
		return element;
	}
}