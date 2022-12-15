/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';

export class CloudWatchTreeItem extends vscode.TreeItem {
	public IsFav: boolean = false;
	public TreeItemType:TreeItemType;
	public Text:string;
	public Region:string | undefined;
	public LogGroup:string | undefined;
	public LogStream:string | undefined;
	public Parent:CloudWatchTreeItem | undefined;
	public Children:CloudWatchTreeItem[] = [];

	constructor(text:string, treeItemType:TreeItemType) {
		super(text);
		this.Text = text;
		this.TreeItemType = treeItemType;
		this.refreshUI();
	}

	public refreshUI() {

		if(this.TreeItemType === TreeItemType.Region)
		{
			this.iconPath = new vscode.ThemeIcon('globe');
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

	public IsAnyChidrenFav(){
		return this.IsAnyChidrenFavInternal(this);
	}

	public IsAnyChidrenFavInternal(node:CloudWatchTreeItem): boolean{
		for(var n of node.Children)
		{
			if(n.IsFav)
			{
				return true;
			}
			else if (n.Children.length > 0)
			{
				return this.IsAnyChidrenFavInternal(n);
			}
		}

		return false;
	}

	public IsFilterStringMatch(FilterString:string){
		if(this.Text.includes(FilterString))
		{
			return true;
		}

		if(this.IsFilterStringMatchAnyChildren(this, FilterString))
		{
			return true;
		}

		return false;
	}

	public IsFilterStringMatchAnyChildren(node:CloudWatchTreeItem, FilterString:string): boolean{
		for(var n of node.Children)
		{
			if(n.Text.includes(FilterString))
			{
				return true;
			}
			else if (n.Children.length > 0)
			{
				return this.IsFilterStringMatchAnyChildren(n, FilterString);
			}
		}

		return false;
	}
}

export enum TreeItemType{
	Region = 1,
	LogGroup = 2,
	LogStream = 3,
}