/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { TreeItem } from './treeItem';
import { TreeDataProvider } from './treeDataProvider';
import * as ui from '../common/ui';

export class TreeView {

	public static Current: TreeView | undefined;
	public view: vscode.TreeView<TreeItem>;
	public treeDataProvider: TreeDataProvider;
	public context: vscode.ExtensionContext;
	public FilterString: string = '';
	public isShowOnlyFavorite: boolean = false;

	constructor(context: vscode.ExtensionContext) {
		ui.logToOutput('TreeView.constructor Started');
		this.context = context;
		this.LoadState();
		this.treeDataProvider = new TreeDataProvider();
		this.view = vscode.window.createTreeView('dagTreeView', { treeDataProvider: this.treeDataProvider, showCollapseAll: true });
		this.Refresh();
		context.subscriptions.push(this.view);
		TreeView.Current = this;
		this.SetFilterMessage();
	}

	Refresh(): void {
		ui.logToOutput('TreeView.refresh Started');

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
		ui.logToOutput('TreeView.loadTreeItems Started');

		//TODO: Get TreeItems from Aws
		this.treeDataProvider.LoadTreeItems();
		this.treeDataProvider.Refresh();
		this.SetViewTitle();
	}

	ResetView(): void {
		ui.logToOutput('TreeView.resetView Started');
		this.FilterString = '';

		this.treeDataProvider.Refresh();
		this.SetViewTitle();

		this.SaveState();
		this.Refresh();
	}

	async AddToFav(node: TreeItem) {
		ui.logToOutput('TreeView.addToFavDAG Started');
		node.IsFav = true;
	}

	async DeleteFromFav(node: TreeItem) {
		ui.logToOutput('TreeView.deleteFromFavDAG Started');
		node.IsFav = false;
	}


	async Filter() {
		ui.logToOutput('TreeView.filter Started');
		let filterStringTemp = await vscode.window.showInputBox({ value: this.FilterString, placeHolder: 'Enter your filters seperated by comma' });

		if (filterStringTemp === undefined) { return; }

		this.FilterString = filterStringTemp;
		this.treeDataProvider.Refresh();
		this.SetFilterMessage();
		this.SaveState();
	}

	async ShowOnlyFavorite() {
		ui.logToOutput('TreeView.showOnlyFavorite Started');
		this.isShowOnlyFavorite = !this.isShowOnlyFavorite;
		this.treeDataProvider.Refresh();
		this.SetFilterMessage();
		this.SaveState();
	}

	async SetViewTitle(){
		this.view.title = "Aws Cloud Watch";
	}

	SaveState() {
		ui.logToOutput('TreeView.saveState Started');
		try {

			this.context.globalState.update('FilterString', this.FilterString);
			this.context.globalState.update('ShowOnlyFavorite', this.ShowOnlyFavorite);

		} catch (error) {
			ui.logToOutput("TreeView.saveState Error !!!");
		}
	}

	LoadState() {
		ui.logToOutput('TreeView.loadState Started');
		try {

			let filterStringTemp: string | undefined = this.context.globalState.get('filterString');
			if (filterStringTemp) {
				this.FilterString = filterStringTemp;
				this.SetFilterMessage();
			}

			let ShowOnlyFavoriteTemp: boolean | undefined = this.context.globalState.get('ShowOnlyFavorite');
			if (ShowOnlyFavoriteTemp) { this.isShowOnlyFavorite = ShowOnlyFavoriteTemp; }

		} catch (error) {
			ui.logToOutput("dagTreeView.loadState Error !!!");
		}
	}

	SetFilterMessage(){
		this.view.message = this.GetBoolenSign(this.isShowOnlyFavorite) + 'Fav, ' + this.FilterString;
	}

	GetBoolenSign(variable: boolean){
		return variable ? "✓" : "𐄂";
	}

}
