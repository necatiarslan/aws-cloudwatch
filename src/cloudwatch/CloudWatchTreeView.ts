/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { CloudWatchTreeItem, TreeItemType } from './CloudWatchTreeItem';
import { CloudWatchTreeDataProvider } from './CloudWatchTreeDataProvider';
import * as ui from '../common/ui';
import * as api from '../common/api';
import { CloudWatchLogView } from './CloudWatchLogView';

export class CloudWatchTreeView {

	public static Current: CloudWatchTreeView | undefined;
	public view: vscode.TreeView<CloudWatchTreeItem>;
	public treeDataProvider: CloudWatchTreeDataProvider;
	public context: vscode.ExtensionContext;
	public FilterString: string = "";
	public isShowOnlyFavorite: boolean = false;
	public AwsProfile: string = "default";
	public AwsEndPoint: string | undefined;
	public LastUsedRegion: string = "us-east-1";
	

	constructor(context: vscode.ExtensionContext) {
		ui.logToOutput('TreeView.constructor Started');
		this.context = context;
		this.treeDataProvider = new CloudWatchTreeDataProvider();
		this.LoadState();
		this.view = vscode.window.createTreeView('CloudWatchTreeView', { treeDataProvider: this.treeDataProvider, showCollapseAll: true });
		this.Refresh();
		context.subscriptions.push(this.view);
		CloudWatchTreeView.Current = this;
		this.SetFilterMessage();
	}

	Refresh(): void {
		ui.logToOutput('CloudWatchTreeView.refresh Started');

		vscode.window.withProgress({
			location: vscode.ProgressLocation.Window,
			title: "Aws Cloudwatch: Loading...",
		}, (progress, token) => {
			progress.report({ increment: 0 });

			this.LoadTreeItems();

			return new Promise<void>(resolve => { resolve(); });
		});
	}

	LoadTreeItems(){
		ui.logToOutput('CloudWatchTreeView.loadTreeItems Started');

		this.treeDataProvider.LoadRegionNodeList();
		this.treeDataProvider.LoadLogGroupNodeList();
		this.treeDataProvider.LoadLogStreamNodeList();
		this.treeDataProvider.Refresh();
		this.SetViewTitle();
	}

	ResetView(): void {
		ui.logToOutput('CloudWatchTreeView.resetView Started');
		this.FilterString = '';

		this.treeDataProvider.Refresh();
		this.SetViewTitle();

		this.SaveState();
		this.Refresh();
	}

	async AddToFav(node: CloudWatchTreeItem) {
		ui.logToOutput('CloudWatchTreeView.AddToFav Started');
		node.IsFav = true;
		node.refreshUI();
	}

	async DeleteFromFav(node: CloudWatchTreeItem) {
		ui.logToOutput('CloudWatchTreeView.DeleteFromFav Started');
		node.IsFav = false;
		node.refreshUI();
	}

	async Filter() {
		ui.logToOutput('CloudWatchTreeView.Filter Started');
		let filterStringTemp = await vscode.window.showInputBox({ value: this.FilterString, placeHolder: 'Enter Your Filter Text' });

		if (filterStringTemp === undefined) { return; }

		this.FilterString = filterStringTemp;
		this.treeDataProvider.Refresh();
		this.SetFilterMessage();
		this.SaveState();
	}

	async ShowOnlyFavorite() {
		ui.logToOutput('CloudWatchTreeView.ShowOnlyFavorite Started');
		this.isShowOnlyFavorite = !this.isShowOnlyFavorite;
		this.treeDataProvider.Refresh();
		this.SetFilterMessage();
		this.SaveState();
	}

	async SetViewTitle(){
		this.view.title = "Aws Cloud Watch";
	}

	SaveState() {
		ui.logToOutput('CloudWatchTreeView.saveState Started');
		try {

			this.context.globalState.update('AwsProfile', this.AwsProfile);
			this.context.globalState.update('FilterString', this.FilterString);
			this.context.globalState.update('ShowOnlyFavorite', this.ShowOnlyFavorite);
			this.context.globalState.update('LogGroupList', this.treeDataProvider.LogGroupList);
			this.context.globalState.update('LogStreamList', this.treeDataProvider.LogStreamList);
			this.context.globalState.update('AwsEndPoint', this.AwsEndPoint);

			ui.logToOutput("CloudWatchTreeView.saveState Successfull");
		} catch (error) {
			ui.logToOutput("CloudWatchTreeView.saveState Error !!!");
		}
	}

	LoadState() {
		ui.logToOutput('CloudWatchTreeView.loadState Started');
		try {

			let AwsProfileTemp: string | undefined = this.context.globalState.get('AwsProfile');
			if (AwsProfileTemp) {
				this.AwsProfile = AwsProfileTemp;
			}

			let filterStringTemp: string | undefined = this.context.globalState.get('FilterString');
			if (filterStringTemp) {
				this.FilterString = filterStringTemp;
			}

			let ShowOnlyFavoriteTemp: boolean | undefined = this.context.globalState.get('ShowOnlyFavorite');
			if (ShowOnlyFavoriteTemp) { this.isShowOnlyFavorite = ShowOnlyFavoriteTemp; }

			let LogGroupListTemp:{ Region:string, LogGroup:string }[] | undefined = this.context.globalState.get('LogGroupList');
			
			// remove prev format, you can remove this after some time
			if(LogGroupListTemp && Array.isArray(LogGroupListTemp) && LogGroupListTemp[0] && Array.isArray(LogGroupListTemp[0]))
			{
				LogGroupListTemp = undefined
			}
			
			if(LogGroupListTemp)
			{
				this.treeDataProvider.LogGroupList = LogGroupListTemp;
			}

			let LogStreamListTemp:{ Region:string, LogGroup:string, LogStream:string }[] | undefined  = this.context.globalState.get('LogStreamList');
			
			// remove prev format, you can remove this after some time
			if(LogStreamListTemp && Array.isArray(LogStreamListTemp) && LogStreamListTemp[0] && Array.isArray(LogStreamListTemp[0]))
			{
				LogStreamListTemp = undefined
			}

			if(LogStreamListTemp)
			{
				this.treeDataProvider.LogStreamList = LogStreamListTemp;
			}

			let AwsEndPointTemp: string | undefined = this.context.globalState.get('AwsEndPoint');
			this.AwsEndPoint = AwsEndPointTemp;

			ui.logToOutput("CloudWatchTreeView.loadState Successfull");

		} 
		catch (error) 
		{
			ui.logToOutput("CloudWatchTreeView.loadState Error !!!");
		}
	}

	SetFilterMessage(){
		this.view.message = "Profile:" + this.AwsProfile + " " + this.GetBoolenSign(this.isShowOnlyFavorite) + "Fav, " + this.FilterString;
	}

	GetBoolenSign(variable: boolean){
		return variable ? "✓" : "𐄂";
	}

	async AddLogGroup(){
		ui.logToOutput('CloudWatchTreeView.AddLogGroup Started');

		let selectedRegion = await vscode.window.showInputBox({value: this.LastUsedRegion, placeHolder: 'Type Region Name'});
		if(!selectedRegion){ return; }

		var resultLogGroup = await api.GetLogGroupList(selectedRegion);
		if(!resultLogGroup.isSuccessful){ return; }


		let selectedLogGroupList = await vscode.window.showQuickPick(resultLogGroup.result, {canPickMany:true, placeHolder: 'Select Log Group'});
		if(!selectedLogGroupList || selectedLogGroupList.length===0){ return; }

		for(var selectedLogGroup of selectedLogGroupList)
		{
			this.treeDataProvider.AddLogGroup(selectedRegion, selectedLogGroup);
		}

		this.SaveState();
	}

	async AddLogGroupByName(){
		ui.logToOutput('CloudWatchTreeView.AddLogGroupByName Started');

		let selectedRegion = await vscode.window.showInputBox({value: this.LastUsedRegion, placeHolder: 'Type Region Name'});
		if(!selectedRegion){ return; }

		let selectedLogGroupName = await vscode.window.showInputBox({ placeHolder: 'Enter Log Group Search Text' });
		if(!selectedLogGroupName){ return; }

		var resultLogGroup = await api.GetLogGroupList(selectedRegion, selectedLogGroupName);
		if(!resultLogGroup.isSuccessful){ return; }

		let selectedLogGroupList = await vscode.window.showQuickPick(resultLogGroup.result, {canPickMany:true, placeHolder: 'Select Log Group'});
		if(!selectedLogGroupList || selectedLogGroupList.length===0){ return; }

		for(var selectedLogGroup of selectedLogGroupList)
		{
			this.treeDataProvider.AddLogGroup(selectedRegion, selectedLogGroup);
		}
		this.SaveState();
	}

	async RemoveLogGroup(node: CloudWatchTreeItem) {
		ui.logToOutput('CloudWatchTreeView.RemoveLogGroup Started');
		
		if(node.TreeItemType !== TreeItemType.LogGroup) { return;}
		if(!node.Region || !node.LogGroup) { return; }
		
		this.treeDataProvider.RemoveLogGroup(node.Region, node.LogGroup);
		this.SaveState();
	}

	async AddLogStream(node: CloudWatchTreeItem) {
		ui.logToOutput('CloudWatchTreeView.AddLogStream Started');
		if(!node.Region || !node.LogGroup) { return; }

		let filterStringTemp = await vscode.window.showInputBox({ placeHolder: 'Log Stream Filter ?' });
		if (filterStringTemp === undefined) { return; }

		var resultLogStream = await api.GetLogStreams(node.Region, node.LogGroup, filterStringTemp);
		if(!resultLogStream.isSuccessful || !resultLogStream.result){ return; }

		let logStreamList:string[]=[];
		for(var ls of resultLogStream.result)
		{
			let date = new Date(ls.creationTime?ls.creationTime:1);
			logStreamList.push(ls.logStreamName + " (" + date.toDateString() + ")");
		}

		let selectedLogStreamList = await vscode.window.showQuickPick(logStreamList, {canPickMany:true, placeHolder: 'Select Log Stream'});
		if(!selectedLogStreamList || selectedLogStreamList.length === 0){ return; }

		for(var ls of resultLogStream.result)
		{
			if(!ls.logStreamName) {continue;}
			let lsName:string = ls.logStreamName;
			if(selectedLogStreamList.find(e => e.includes(lsName)))
			{
				this.treeDataProvider.AddLogStream(node.Region, node.LogGroup, ls.logStreamName);
			}
		}

		this.SaveState();
	}

	async AddAllLogStreams(node: CloudWatchTreeItem) {
		ui.logToOutput('CloudWatchTreeView.AddLogStream Started');
		if(!node.Region || !node.LogGroup) { return; }

		var resultLogStream = await api.GetLogStreamList(node.Region, node.LogGroup);
		if(!resultLogStream.isSuccessful){ return; }

		for(var logStream of resultLogStream.result)
		{
			this.treeDataProvider.AddLogStream(node.Region, node.LogGroup, logStream);
		}
		this.SaveState();
	}

	async RemoveLogStream(node: CloudWatchTreeItem) {
		ui.logToOutput('CloudWatchTreeView.RemoveLogStream Started');

		if(node.TreeItemType !== TreeItemType.LogStream) { return;}
		if(!node.Region || !node.LogGroup || !node.LogStream ) { return; }
		
		this.treeDataProvider.RemoveLogStream(node.Region, node.LogGroup, node.LogStream);
		this.SaveState();
	}

	async RemoveAllLogStreams(node: CloudWatchTreeItem) {
		ui.logToOutput('CloudWatchTreeView.RemoveAllLogStreams Started');
		
		if(node.TreeItemType !== TreeItemType.LogGroup) { return;}
		if(!node.Region || !node.LogGroup) { return; }
		
		this.treeDataProvider.RemoveAllLogStreams(node.Region, node.LogGroup);
		this.SaveState();
	}

	async ShowCloudWatchLogView(node: CloudWatchTreeItem) {
		ui.logToOutput('CloudWatchTreeView.ShowCloudWatchLogView Started');
		
		if(node.TreeItemType !== TreeItemType.LogStream) { return;}
		if(!node.Region || !node.LogGroup || !node.LogStream) { return; }
		
		CloudWatchLogView.Render(this.context.extensionUri, node.Region, node.LogGroup, node.LogStream);
	}

	async SelectAwsProfile(node: CloudWatchTreeItem) {
		ui.logToOutput('CloudWatchTreeView.SelectAwsProfile Started');

		var result = await api.GetAwsProfileList();
		if(!result.isSuccessful){ return; }

		let selectedAwsProfile = await vscode.window.showQuickPick(result.result, {canPickMany:false, placeHolder: 'Select Aws Profile'});
		if(!selectedAwsProfile){ return; }

		this.AwsProfile = selectedAwsProfile;
		this.SaveState();
		this.SetFilterMessage();
	}

	async UpdateAwsEndPoint() {
		ui.logToOutput('CloudWatchTreeView.UpdateAwsEndPoint Started');

		let awsEndPointUrl = await vscode.window.showInputBox({ placeHolder: 'Enter Aws End Point URL (Leave Empty To Return To Default)', value: this.AwsEndPoint });
		if(awsEndPointUrl===undefined){ return; }
		if(awsEndPointUrl.length===0) { this.AwsEndPoint = undefined; }
		else
		{
			this.AwsEndPoint = awsEndPointUrl;
		}
		this.SaveState();
		ui.showInfoMessage('Aws End Point Updated');
	}

}
