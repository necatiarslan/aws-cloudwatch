/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';

export class CloudWatchTreeItem extends vscode.TreeItem {
	public IsFav: boolean = false;
	public TreeItemType:TreeItemType;
	public Text:string;
	public Region:string | undefined;
	public LogGroup:string | undefined;
	public LogStream:string | undefined;

	constructor(text:string, treeItemType:TreeItemType) {
		super(text);
		this.Text = text;
		this.TreeItemType = treeItemType;
		this.refreshUI();
	}


	public refreshUI() {
		super.label = this.Text;

		if(this.TreeItemType === TreeItemType.Region)
		{
			this.iconPath = new vscode.ThemeIcon('archive');
		}
		else if(this.TreeItemType === TreeItemType.LogGroup)
		{
			this.iconPath = new vscode.ThemeIcon('folder');
		}
		else if(this.TreeItemType === TreeItemType.LogStream)
		{
			this.iconPath = new vscode.ThemeIcon('output');
		}
		else
		{
			this.iconPath = new vscode.ThemeIcon('circle-outline');
		}
	}
}

export enum TreeItemType{
	Region = 1,
	LogGroup = 2,
	LogStream = 3,
}