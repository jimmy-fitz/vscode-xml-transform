// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const xsltProcessor = require('xslt-processor');
const read = require('read-file');
const write = require('write-file');
const ab2str = require('arraybuffer-to-string');

async function GetFile(uri:vscode.Uri, fileExtensionFilter:string) {
	let fileToUse;
	let activeTextEditor = await vscode.window.activeTextEditor;

	if (activeTextEditor !== undefined && activeTextEditor.document.fileName !== "" && activeTextEditor.document.fileName.endsWith(fileExtensionFilter)) {
		fileToUse = activeTextEditor.document.fileName;
	}
	else if (uri !== undefined && uri.fsPath !== "" && uri.fsPath.endsWith(fileExtensionFilter)) {
		fileToUse = uri.fsPath;
	}
	else {
		let uris = await vscode.workspace.findFiles('**/*' + fileExtensionFilter);
		let files = uris.map( (value:vscode.Uri, index:number) => {
			return value.fsPath;
		});
		
		fileToUse = await vscode.window.showQuickPick(files, {placeHolder: "Select " + fileExtensionFilter + " file to use for the transform..."});		
	}

	return fileToUse;
}

async function Transform(uri:vscode.Uri) {
		
	//Reference or get the source Xsl File
	var xslFileToUse = await GetFile(uri, ".xsl");

	//Reference or get the source xml File
	var xmlFileToTransform = await GetFile(uri, ".xml");

	//Exit if either file cannot be returned (user didnt pick, 'esc' etc.)
	if (xslFileToUse === undefined || xmlFileToTransform === undefined) {
		return;
	}

	//Read and convert xml/xsl to string
	let xmlBuffer = read.sync(xmlFileToTransform);
	let xmlString = ab2str(xmlBuffer);
	let xslBuffer = read.sync(xslFileToUse);
	let xslString = ab2str(xslBuffer);

	//Parse and transform
	let xml = xsltProcessor.xmlParse(xmlString);
	let xsl = xsltProcessor.xmlParse(xslString);

	let transformedXml = xsltProcessor.xsltProcess(
		xml,
		xsl
	);

	//"Cleanup" html
	transformedXml = transformedXml.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;&amp;/g,"&&").replace(/&amp;nbsp;/,"&nbsp;").replace(/&amp;/g,"&");

	let configuration = vscode.workspace.getConfiguration('xml-transform');
	
	//Create and show panel
	if (configuration.usePreview) {
		const panel = vscode.window.createWebviewPanel(
			'xmlTransform',
			'Xml Transformation',
			vscode.ViewColumn.One,
			{}
		);
		panel.webview.html = transformedXml;
	}

	//Create and save file
	let outputFile = configuration.outputPath;
	if (outputFile !== null && outputFile !== undefined && outputFile.length > 0) {
		write(outputFile, transformedXml, function (err:any) {
			if (err)  {
				console.log(err);
				return;
			}
			vscode.workspace.openTextDocument(outputFile).then(doc => {
				vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside, preview: false});
			});
		});
	}
}

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
		Transform(uri);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
