/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { CloudWatchTreeItem } from './CloudWatchTreeItem';
import { CloudWatchTreeDataProvider } from './CloudWatchTreeDataProvider';
import * as ui from '../common/ui';

export class CloudWatchTreeView {

	public static Current: CloudWatchTreeView | undefined;
	public view: vscode.TreeView<CloudWatchTreeItem>;
	public treeDataProvider: CloudWatchTreeDataProvider;
	public context: vscode.ExtensionContext;
	public FilterString: string = '';
	public isShowOnlyFavorite: boolean = false;

	constructor(context: vscode.ExtensionContext) {
		ui.logToOutput('TreeView.constructor Started');
		this.context = context;
		this.LoadState();
		this.treeDataProvider = new CloudWatchTreeDataProvider();
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

		//TODO: Get TreeItems from Aws
		this.treeDataProvider.LoadTreeItems();
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
	}

	async DeleteFromFav(node: CloudWatchTreeItem) {
		ui.logToOutput('CloudWatchTreeView.DeleteFromFav Started');
		node.IsFav = false;
	}


	async Filter() {
		ui.logToOutput('CloudWatchTreeView.Filter Started');
		let filterStringTemp = await vscode.window.showInputBox({ value: this.FilterString, placeHolder: 'Enter your filters seperated by comma' });

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

			this.context.globalState.update('FilterString', this.FilterString);
			this.context.globalState.update('ShowOnlyFavorite', this.ShowOnlyFavorite);

		} catch (error) {
			ui.logToOutput("CloudWatchTreeView.saveState Error !!!");
		}
	}

	LoadState() {
		ui.logToOutput('CloudWatchTreeView.loadState Started');
		try {

			let filterStringTemp: string | undefined = this.context.globalState.get('FilterString');
			if (filterStringTemp) {
				this.FilterString = filterStringTemp;
				this.SetFilterMessage();
			}

			let ShowOnlyFavoriteTemp: boolean | undefined = this.context.globalState.get('ShowOnlyFavorite');
			if (ShowOnlyFavoriteTemp) { this.isShowOnlyFavorite = ShowOnlyFavoriteTemp; }

		} catch (error) {
			ui.logToOutput("CloudWatchTreeView.loadState Error !!!");
		}
	}

	SetFilterMessage(){
		this.view.message = this.GetBoolenSign(this.isShowOnlyFavorite) + 'Fav, ' + this.FilterString;
	}

	GetBoolenSign(variable: boolean){
		return variable ? "✓" : "𐄂";
	}

}
