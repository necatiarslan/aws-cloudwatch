/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { CloudWatchTreeItem, TreeItemType } from './CloudWatchTreeItem';
import { CloudWatchTreeView } from './CloudWatchTreeView';

export class CloudWatchTreeDataProvider implements vscode.TreeDataProvider<CloudWatchTreeItem>
{
	private _onDidChangeTreeData: vscode.EventEmitter<CloudWatchTreeItem | undefined | void> = new vscode.EventEmitter<CloudWatchTreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<CloudWatchTreeItem | undefined | void> = this._onDidChangeTreeData.event;
	RegionNodeList: CloudWatchTreeItem[] = [];
	LogGroupNodeList: CloudWatchTreeItem[] = [];
	LogStreamNodeList: CloudWatchTreeItem[] = [];
	LogGroupList: { Region:string, LogGroup:string }[] = [];
	LogStreamList: { Region:string, LogGroup:string, LogStream:string }[] = [];

	constructor() {
	}

	Refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	AddLogGroup(Region:string, LogGroup:string){
		for(var lg of this.LogGroupList)
		{
			if(lg.Region === Region && lg.LogGroup=== LogGroup)
			{
				return;
			}
		}

		this.LogGroupList.push({ Region:Region, LogGroup:LogGroup });
		this.LoadLogGroupNodeList();
		this.LoadRegionNodeList();
		this.Refresh();
	}

	RemoveLogGroup(Region:string, LogGroup:string){
		for(let i = 0; i < this.LogStreamList.length; i++)
		{
			if(this.LogStreamList[i].Region === Region && this.LogStreamList[i].LogGroup === LogGroup)
			{
				this.LogStreamList.splice(i, 1);
				i--;
			}
		}
		this.LoadLogStreamNodeList();

		for(let i = 0; i < this.LogGroupList.length; i++)
		{
			if(this.LogGroupList[i].Region === Region && this.LogGroupList[i].LogGroup === LogGroup)
			{
				this.LogGroupList.splice(i, 1);
				i--;
			}
		}
		this.LoadLogGroupNodeList();
		this.LoadRegionNodeList();
		this.Refresh();
	}

	RemoveAllLogStreams(Region:string, LogGroup:string){
		for(let i = 0; i < this.LogStreamList.length; i++)
		{
			if(this.LogStreamList[i].Region === Region && this.LogStreamList[i].LogGroup === LogGroup)
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
			if(ls.Region === Region && ls.LogGroup === LogGroup && ls.LogStream === LogStream)
			{
				return;
			}
		}


		this.LogStreamList.push({ Region:Region, LogGroup:LogGroup, LogStream:LogStream });
		this.LoadLogStreamNodeList();
		this.Refresh();
	}

	RemoveLogStream(Region:string, LogGroup:string, LogStream:string){
		for(let i = 0; i < this.LogStreamList.length; i++)
		{
			if(this.LogStreamList[i].Region === Region && this.LogStreamList[i].LogGroup === LogGroup && this.LogStreamList[i].LogStream === LogStream)
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
			let treeItem = new CloudWatchTreeItem(lg.LogGroup, TreeItemType.LogGroup);
			treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
			treeItem.Region = lg.Region;
			treeItem.LogGroup = lg.LogGroup;
			this.LogGroupNodeList.push(treeItem);
		}
	}

	LoadRegionNodeList(){
		this.LogGroupNodeList = [];
		
		for(var lg of this.LogGroupList)
		{
			if(this.GetRegionNode(lg.Region) === undefined)
			{
				let treeItem = new CloudWatchTreeItem(lg.Region, TreeItemType.Region);
				treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
				treeItem.Region = lg.Region;
				this.RegionNodeList.push(treeItem);
			}
		}
	}

	GetRegionNode(Region:string):CloudWatchTreeItem | undefined{
		for(var node of this.RegionNodeList)
		{
			if(node.Region === Region)
			{
				return node;
			}
		}
		return undefined;
	}

	LoadLogStreamNodeList(){
		this.LogStreamNodeList = [];
		
		for(var lg of this.LogStreamList)
		{
			let treeItem = new CloudWatchTreeItem(lg.LogStream, TreeItemType.LogStream);
			treeItem.Region = lg.Region;
			treeItem.LogGroup = lg.LogGroup;
			treeItem.LogStream = lg.LogStream;
			this.LogStreamNodeList.push(treeItem);
		}
	}

	getChildren(node: CloudWatchTreeItem): Thenable<CloudWatchTreeItem[]> {
		let result:CloudWatchTreeItem[] = [];

		result = this.GetNodesRegionLogGroupLogStream(node);

		return Promise.resolve(result);
	}

	GetNodesRegionLogGroupLogStream(node: CloudWatchTreeItem):CloudWatchTreeItem[]
	{
		let result:CloudWatchTreeItem[] = [];

		if (!node) {
			result = this.GetRegionNodes();
		}
		else if(node.TreeItemType === TreeItemType.Region){
			result = this.GetLogGroupNodesParentRegion(node);
		}
		else if(node.TreeItemType === TreeItemType.LogGroup){
			result = this.GetLogStreamNodesParentLogGroup(node);
		}

		return result;
	}

	GetRegionNodes():CloudWatchTreeItem[]
	{
		var result: CloudWatchTreeItem[] = [];
		for (var node of this.RegionNodeList) {
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.FilterString && !node.IsFilterStringMatch(CloudWatchTreeView.Current.FilterString)) { continue; }
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.isShowOnlyFavorite && !(node.IsFav || node.IsAnyChidrenFav())) { continue; }

			result.push(node);
		}
		return result;
	}

	GetNodesLogStream(node: CloudWatchTreeItem):CloudWatchTreeItem[]
	{
		let result:CloudWatchTreeItem[] = [];
		result = this.GetLogStreamNodes();
		return result;
	}

	GetNodesLogGroupLogStream(node: CloudWatchTreeItem):CloudWatchTreeItem[]
	{
		let result:CloudWatchTreeItem[] = [];
		
		if (!node) {
			result = this.GetLogGroupNodes();
		}
		else if(node.TreeItemType === TreeItemType.LogGroup){
			result = this.GetLogStreamNodesParentLogGroup(node);
		}

		return result;
	}

	GetLogGroupNodes(): CloudWatchTreeItem[]{
		var result: CloudWatchTreeItem[] = [];
		for (var node of this.LogGroupNodeList) {
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.FilterString && !node.IsFilterStringMatch(CloudWatchTreeView.Current.FilterString)) { continue; }
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.isShowOnlyFavorite && !(node.IsFav || node.IsAnyChidrenFav())) { continue; }

			result.push(node);
		}
		return result;
	}

	GetLogGroupNodesParentRegion(RegionNode: CloudWatchTreeItem): CloudWatchTreeItem[]{
		var result: CloudWatchTreeItem[] = [];
		for (var node of this.LogGroupNodeList) {
			if(node.Region !== RegionNode.Region) { continue; }
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.FilterString && !node.IsFilterStringMatch(CloudWatchTreeView.Current.FilterString)) { continue; }
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.isShowOnlyFavorite && !(node.IsFav || node.IsAnyChidrenFav())) { continue; }

			node.Parent = RegionNode;
			if(RegionNode.Children.indexOf(node) === -1)
			{
				RegionNode.Children.push(node);
			}

			result.push(node);
		}
		return result;
	}

	GetLogStreamNodesParentLogGroup(LogGroupNode:CloudWatchTreeItem): CloudWatchTreeItem[]{
		var result: CloudWatchTreeItem[] = [];
		for (var node of this.LogStreamNodeList) {
			if(!(node.Region === LogGroupNode.Region && node.LogGroup === LogGroupNode.LogGroup)) { continue; }
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.FilterString && !node.IsFilterStringMatch(CloudWatchTreeView.Current.FilterString)) { continue; }
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.isShowOnlyFavorite && !(node.IsFav || node.IsAnyChidrenFav())) { continue; }

			node.Parent = LogGroupNode;
			if(LogGroupNode.Children.indexOf(node) === -1)
			{
				LogGroupNode.Children.push(node);
			}
			result.push(node);
		}
		return result;
	}

	GetLogStreamNodes(): CloudWatchTreeItem[]{
		var result: CloudWatchTreeItem[] = [];
		for (var node of this.LogStreamNodeList) {
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.FilterString && !node.IsFilterStringMatch(CloudWatchTreeView.Current.FilterString)) { continue; }
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.isShowOnlyFavorite && !(node.IsFav || node.IsAnyChidrenFav())) { continue; }

			result.push(node);
		}
		return result;
	}
	
	getTreeItem(element: CloudWatchTreeItem): CloudWatchTreeItem {
		return element;
	}

}

export enum ViewType{
	Region_LogGroup_LogStream = 1,
	LogGroup_LogStream = 2,
	LogStream = 3,
}