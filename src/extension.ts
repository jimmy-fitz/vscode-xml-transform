// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const xsltProcessor = require('xslt-processor');
const read = require('read-file');
const ab2str = require('arraybuffer-to-string');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
		console.log('Congratulations, your extension "vscode-xml-transform" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.xml-transform', (uri:vscode.Uri) => {
		// The code you place here will be executed every time your command is executed
		
		let xmlBuffer = read.sync(uri.fsPath);
		let xmlString = ab2str(xmlBuffer);
		let xslBuffer = read.sync('C:/temp/TestXml/test.xsl');
		let xslString = ab2str(xslBuffer);

		let xml = xsltProcessor.xmlParse(xmlString);
		let xsl = xsltProcessor.xmlParse(xslString);

		const transformedXml = xsltProcessor.xsltProcess(
			xml,
			xsl
		);

		// Create and show panel
		const panel = vscode.window.createWebviewPanel(
			'xmlTransform',
			'Xml Transformation',
			vscode.ViewColumn.One,
			{}
		);

		// And set its HTML content
		panel.webview.html = transformedXml;
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
