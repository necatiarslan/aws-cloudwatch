/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';

export class CloudWatchTreeItem extends vscode.TreeItem {
	public TreeItemType:TreeItemType;
	public Text:string;
	public Region:string | undefined;
	public LogGroup:string | undefined;
	public LogStream:string | undefined;
	public DetailValue:string | undefined;
	public DateFilter:Date | undefined;
	public Parent:CloudWatchTreeItem | undefined;
	public Children:CloudWatchTreeItem[] = [];
	private _profileToShow: string = "";
	private _isHidden: boolean = false;
	private _isFav: boolean = false;
	private _isPinned: boolean = false;

	public get IsFav(): boolean {
		return this._isFav;
	}
	public set IsFav(value: boolean) {
		this._isFav = value;
		this.setContextValue();
	}

	public get IsHidden(): boolean {
		return this._isHidden;
	}
	public set IsHidden(value: boolean) {
		this._isHidden = value;
		this.setContextValue();
	}
	
	public get ProfileToShow(): string {
		return this._profileToShow;
	}
	public set ProfileToShow(value: string) {
		this._profileToShow = value;
		this.setContextValue();
	}

	public get IsPinned(): boolean {
		return this._isPinned;
	}
	public set IsPinned(value: boolean) {
		this._isPinned = value;
		this.setContextValue();
	}

	constructor(text:string, treeItemType:TreeItemType) {
		super(text);
		this.Text = text;
		this.TreeItemType = treeItemType;
		this.refreshUI();
	}

	public setContextValue(){
		let contextValue = "#";
		contextValue += this.IsFav ? "Fav#" : "!Fav#";
		contextValue += this.IsHidden ? "Hidden#" : "!Hidden#";
		contextValue += this.IsPinned ? "Pinned#" : "NotPinned#";
		contextValue += this.ProfileToShow ? "Profile#" : "NoProfile#";
		switch(this.TreeItemType)
		{
			case TreeItemType.Region:
				contextValue += "Region#";
				break;
			case TreeItemType.LogGroup:
				contextValue += "LogGroup#";
				break;
			case TreeItemType.LogStream:
				contextValue += "LogStream#";
				break;
			case TreeItemType.Info:
				contextValue += "Info#";
				break;
			case TreeItemType.InfoDetail:
				contextValue += "InfoDetail#";
				break;
			case TreeItemType.Today:
				contextValue += "Today#";
				break;
			case TreeItemType.Yesterday:
				contextValue += "Yesterday#";
				break;
			case TreeItemType.History:
				contextValue += "History#";
				break;
			case TreeItemType.RefreshAction:
				contextValue += "RefreshAction#";
				break;
		}

		this.contextValue = contextValue;
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
		else if(this.TreeItemType === TreeItemType.Info)
		{
			this.iconPath = new vscode.ThemeIcon('info');
		}
		else if(this.TreeItemType === TreeItemType.InfoDetail)
		{
			this.iconPath = new vscode.ThemeIcon('circle-filled');
		}
		else if(this.TreeItemType === TreeItemType.Today || this.TreeItemType === TreeItemType.Yesterday || this.TreeItemType === TreeItemType.History)
		{
			this.iconPath = new vscode.ThemeIcon('calendar');
		}
		else if(this.TreeItemType === TreeItemType.RefreshAction)
		{
			this.iconPath = new vscode.ThemeIcon('refresh');
		}
		else if(this.TreeItemType === TreeItemType.LogStream)
		{
			this.iconPath = new vscode.ThemeIcon('output');
		}
		else
		{
			this.iconPath = new vscode.ThemeIcon('circle-outline');
		}

		this.setContextValue();
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
	Info = 4,
	InfoDetail = 5,
	Today = 6,
	Yesterday = 7,
	History = 8,
	RefreshAction = 9,
}