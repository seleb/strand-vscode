'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerDocumentSymbolProvider({ language: 'strand' }, new StrandDocumentSymbolProvider()),
		vscode.languages.registerFoldingRangeProvider({ language: 'strand' }, new StrandFoldingRangeProvider())
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
