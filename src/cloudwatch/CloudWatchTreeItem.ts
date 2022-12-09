/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';

export class CloudWatchTreeItem extends vscode.TreeItem {
	public IsFav: boolean = false;

	constructor() {
		super("1234");
		this.refreshUI();
	}


	public refreshUI() {
		super.label = "1234";
        this.iconPath = new vscode.ThemeIcon('circle-outline');
	}

	public doesFilterMatch(filterString: string): boolean {
		let words: string[] = filterString.split(',');
		let matchingWords: string[] = [];
		for (var word of words) {
			if (word === 'fav' && this.IsFav) { matchingWords.push(word); continue; }
		}

		return words.length === matchingWords.length;
	}
}