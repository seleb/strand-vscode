"use strict";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerDocumentSymbolProvider(
			{ language: "strand" },
			new StrandDocumentSymbolProvider()
		)
	);
}

class StrandDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
	public provideDocumentSymbols(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): Thenable<vscode.SymbolInformation[]> {
		return new Promise((resolve, reject) => {
			const symbols: vscode.SymbolInformation[] = [];

			for (let i = 0; i < document.lineCount; i++) {
				const line = document.lineAt(i);
				if (line.text.startsWith("::")) {
					symbols.push(
						new vscode.SymbolInformation(
							line.text.substring(2),
							vscode.SymbolKind.Object,
							"passage",
							new vscode.Location(document.uri, line.range)
						)
					);
				}
			}

			resolve(symbols);
		});
	}
}
