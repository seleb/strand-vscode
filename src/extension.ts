'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerDocumentSymbolProvider({ language: 'strand' }, new StrandDocumentSymbolProvider()),
		vscode.languages.registerFoldingRangeProvider({ language: 'strand' }, new StrandFoldingRangeProvider()),
		vscode.languages.registerCompletionItemProvider({ language: 'strand' }, new StrandCompletionItemProvider(), '[', "'", '"', '>'),
	);
}

function getPassageLines(document: vscode.TextDocument) {
	const passageLines: number[] = [];
	for (let i = 0; i < document.lineCount; ++i) {
		const line = document.lineAt(i);
		if (line.text.startsWith('::')) {
			passageLines.push(i);
		}
	}
	return passageLines;
}

class StrandDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
	public provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[]> {
		const symbols: vscode.SymbolInformation[] = [];

		const passageLines = getPassageLines(document);

		symbols.push(
			new vscode.SymbolInformation(
				'top',
				vscode.SymbolKind.Constant,
				'',
				new vscode.Location(document.uri, new vscode.Position(0, 0))
			)
		);
		symbols.push(
			new vscode.SymbolInformation(
				'bottom',
				vscode.SymbolKind.Constant,
				'',
				new vscode.Location(document.uri, new vscode.Position(document.lineCount-1, 0))
			)
		);
		for (let i = 0; i < passageLines.length - 1; ++i) {
			const line = document.lineAt(passageLines[i]);
			symbols.push(
				new vscode.SymbolInformation(
					line.text.substring(2),
					vscode.SymbolKind.Object,
					'passage',
					new vscode.Location(document.uri, new vscode.Range(new vscode.Position(passageLines[i], 0), new vscode.Position(passageLines[i + 1] - 1, 0)))
				)
			);
		}

		return symbols;
	}
}

class StrandFoldingRangeProvider implements vscode.FoldingRangeProvider {
	public provideFoldingRanges(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FoldingRange[]> {
		const foldingRanges: vscode.FoldingRange[] = [];

		const passageLines = getPassageLines(document);

		for (let i = 0; i < passageLines.length - 1; ++i) {
			foldingRanges.push(new vscode.FoldingRange(passageLines[i], passageLines[i + 1] - 1));
		}
		return foldingRanges;
	}
}

class StrandCompletionItemProvider implements vscode.CompletionItemProvider {
	public provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		context: vscode.CompletionContext
	): vscode.ProviderResult<vscode.CompletionItem[]> {
		const line = document.lineAt(position.line);
		const before = line.text.substring(0, position.character);
		let showPassages = false;
		{
			const start = before.lastIndexOf('[[');
			showPassages = showPassages || (start >= 0 && !before.substring(start).includes(']]'));
		}
		{
			const start = before.lastIndexOf("this.goto('");
			showPassages = showPassages || (start >= 0 && !before.substring(start).includes("')"));
		}
		{
			const start = before.lastIndexOf('this.goto("');
			showPassages = showPassages || (start >= 0 && !before.substring(start).includes('")'));
		}
		return showPassages ? getPassageLines(document).map(i => new vscode.CompletionItem(document.lineAt(i).text.substring(2), vscode.CompletionItemKind.Reference)) : [];
	}
}
