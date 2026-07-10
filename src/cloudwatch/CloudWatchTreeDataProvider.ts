/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { CloudWatchTreeItem, TreeItemType } from './CloudWatchTreeItem';
import { CloudWatchTreeView } from './CloudWatchTreeView';
import { LogStream } from '@aws-sdk/client-cloudwatch-logs';
import * as api from '../common/API';

export class CloudWatchTreeDataProvider implements vscode.TreeDataProvider<CloudWatchTreeItem>
{
	private _onDidChangeTreeData: vscode.EventEmitter<CloudWatchTreeItem | undefined | void> = new vscode.EventEmitter<CloudWatchTreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<CloudWatchTreeItem | undefined | void> = this._onDidChangeTreeData.event;
	RegionNodeList: CloudWatchTreeItem[] = [];
	LogGroupNodeList: CloudWatchTreeItem[] = [];
	LogStreamNodeList: CloudWatchTreeItem[] = [];
	LogGroupList: { Region:string, LogGroup:string }[] = [];
	LogStreamList: { Region:string, LogGroup:string, LogStream:string }[] = [];
	LogStreamCache: { Region:string, LogGroup:string, LogStream: LogStream[] }[] = [];


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
			treeItem.IsPinned = true;
			this.LogStreamNodeList.push(treeItem);
		}
	}

	async getChildren(node: CloudWatchTreeItem): Promise<CloudWatchTreeItem[]> {
		if (!node) {
			return this.GetRegionNodes();
		}

		switch (node.TreeItemType) {
			case TreeItemType.Region:
				return this.GetLogGroupNodesParentRegion(node);
			case TreeItemType.LogGroup:
				return await this.GetLogGroupChildren(node);
			case TreeItemType.Info:
				return await this.GetLogGroupInfoChildren(node);
			case TreeItemType.Today:
				return await this.GetDateFilteredLogStreams(node, 0);
			case TreeItemType.Yesterday:
				return await this.GetDateFilteredLogStreams(node, -1);
			case TreeItemType.History:
				return this.GetHistoryChildren(node);
			default:
				return [];
		}
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

	private async GetLogGroupChildren(logGroupNode: CloudWatchTreeItem): Promise<CloudWatchTreeItem[]> {
		const result: CloudWatchTreeItem[] = [];

		const infoNode = new CloudWatchTreeItem('Info', TreeItemType.Info);
		infoNode.Region = logGroupNode.Region;
		infoNode.LogGroup = logGroupNode.LogGroup;
		infoNode.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		infoNode.Parent = logGroupNode;
		result.push(infoNode);

		const todayNode = new CloudWatchTreeItem('Today', TreeItemType.Today);
		todayNode.Region = logGroupNode.Region;
		todayNode.LogGroup = logGroupNode.LogGroup;
		todayNode.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		todayNode.Parent = logGroupNode;
		todayNode.command = { command: 'CloudWatchTreeView.RefreshDateNode', title: 'Refresh', arguments: [todayNode, 0] };
		result.push(todayNode);

		const yesterdayNode = new CloudWatchTreeItem('Yesterday', TreeItemType.Yesterday);
		yesterdayNode.Region = logGroupNode.Region;
		yesterdayNode.LogGroup = logGroupNode.LogGroup;
		yesterdayNode.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		yesterdayNode.Parent = logGroupNode;
		yesterdayNode.command = { command: 'CloudWatchTreeView.RefreshDateNode', title: 'Refresh', arguments: [yesterdayNode, 1] };
		result.push(yesterdayNode);

		const historyNode = new CloudWatchTreeItem('History', TreeItemType.History);
		historyNode.Region = logGroupNode.Region;
		historyNode.LogGroup = logGroupNode.LogGroup;
		historyNode.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		historyNode.Parent = logGroupNode;
		historyNode.command = { command: 'CloudWatchTreeView.AddLogStreamsByDate', title: 'Add by Date', arguments: [logGroupNode] };
		result.push(historyNode);

		for (var node of this.LogStreamNodeList) {
			if(!(node.Region === logGroupNode.Region && node.LogGroup === logGroupNode.LogGroup)) { continue; }
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.FilterString && !node.IsFilterStringMatch(CloudWatchTreeView.Current.FilterString)) { continue; }
			if (CloudWatchTreeView.Current && CloudWatchTreeView.Current.isShowOnlyFavorite && !(node.IsFav || node.IsAnyChidrenFav())) { continue; }

			node.Parent = logGroupNode;
			if(logGroupNode.Children.indexOf(node) === -1)
			{
				logGroupNode.Children.push(node);
			}
			result.push(node);
		}

		return result;
	}

	private async GetLogGroupInfoChildren(infoNode: CloudWatchTreeItem): Promise<CloudWatchTreeItem[]> {
		const result: CloudWatchTreeItem[] = [];
		if(!infoNode.Region || !infoNode.LogGroup) { return result; }
		const info = await api.GetLogGroupInfo(infoNode.Region, infoNode.LogGroup);
		if (!info.isSuccessful || !info.result) { return result; }
		const detailMap: {label: string, value: string | number | undefined}[] = [
			{ label: 'Log class', value: info.result.logGroupClass },
			{ label: 'ARN', value: info.result.arn },
			{ label: 'Creation time', value: info.result.creationTime ? new Date(info.result.creationTime).toLocaleString() : undefined },
			{ label: 'Retention (days)', value: info.result.retentionInDays },
		];

		for(const detail of detailMap){
			const detailNode = new CloudWatchTreeItem(`${detail.label}: ${detail.value ?? 'N/A'}`, TreeItemType.InfoDetail);
			detailNode.Region = infoNode.Region;
			detailNode.LogGroup = infoNode.LogGroup;
			detailNode.collapsibleState = vscode.TreeItemCollapsibleState.None;
			detailNode.Parent = infoNode;
			result.push(detailNode);
		}

		return result;
	}

	private async GetDateFilteredLogStreams(dateNode: CloudWatchTreeItem, dayOffset: number): Promise<CloudWatchTreeItem[]> {
		const result: CloudWatchTreeItem[] = [];
		if(!dateNode.Region || !dateNode.LogGroup) { return result; }

		// Check if children are already loaded
		if (dateNode.Children && dateNode.Children.length > 0) {
			return dateNode.Children;
		}

		// Load streams on expand
		const start = new Date();
		start.setHours(0,0,0,0);
		start.setDate(start.getDate() + dayOffset);
		const end = new Date(start.getTime() + 86400000);

		const detailedStreams = await this.GetLogStreamsDetailed(dateNode.Region, dateNode.LogGroup);
		for(const ds of detailedStreams){
			if(!ds.lastEventTimestamp) { continue; }
			if(ds.lastEventTimestamp < start.getTime() || ds.lastEventTimestamp >= end.getTime()) { continue; }
			if(!ds.logStreamName) { continue; }

			const streamNode = new CloudWatchTreeItem(ds.logStreamName, TreeItemType.LogStream);
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

	public async LoadDateFilteredLogStreams(dateNode: CloudWatchTreeItem, dayOffset: number): Promise<void> {
		if(!dateNode.Region || !dateNode.LogGroup) { return; }

		const start = new Date();
		start.setHours(0,0,0,0);
		start.setDate(start.getDate() + dayOffset);
		const end = new Date(start.getTime() + 86400000);

		const result: CloudWatchTreeItem[] = [];
		const detailedStreams = await this.GetLogStreamsDetailed(dateNode.Region, dateNode.LogGroup);
		for(const ds of detailedStreams){
			if(!ds.lastEventTimestamp) { continue; }
			if(ds.lastEventTimestamp < start.getTime() || ds.lastEventTimestamp >= end.getTime()) { continue; }
			if(!ds.logStreamName) { continue; }

			const streamNode = new CloudWatchTreeItem(ds.logStreamName, TreeItemType.LogStream);
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

	private GetHistoryChildren(historyNode: CloudWatchTreeItem): CloudWatchTreeItem[] {
		const result: CloudWatchTreeItem[] = [];
		return result;
	}

	private async GetLogStreamsDetailed(Region?: string, LogGroup?: string): Promise<LogStream[]> {
		if(!Region || !LogGroup) { return []; }
		if(!this.LogStreamCache.find(c => c.Region === Region && c.LogGroup === LogGroup))
		{
			const result = await api.GetLogStreams(Region, LogGroup);
			if(result.isSuccessful && result.result)
			{
				this.LogStreamCache.push({ Region:Region, LogGroup:LogGroup, LogStream: result.result });
			}
		}
		
		return this.LogStreamCache.find(c => c.Region === Region && c.LogGroup === LogGroup)?.LogStream || [];
	}

	private FormatLastEventTime(timestamp?: number): string | undefined {
		if(!timestamp) { return undefined; }
		return new Date(timestamp).toLocaleString();
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