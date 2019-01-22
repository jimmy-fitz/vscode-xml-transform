# vscode-xml-transform

Sample POC used to transform Xml to HTML through XSL stylesheet.    

_It was never intended to be a full transformation engine.  It wraps an existing Xslt engine found on NPM which has known limitations. The project was about getting a simple task done that was helpful for another project while learning the VS Code extension framework._

## Features

Exposes an editor title command to transform an Xml file with an Xsl file.

> Tip: The command will use the context of the Xsl or Xml file as the path for the file and prompt for the other.  The command can also be run stand-alone which will prompt for both files.

## Requirements

run npm install

_There are no tests setup at this time_

## Extension Settings

This extension contributes the following settings:

* `xml-transform.outputPath`: set output `path/file`
* `xml-transform.usePreview`: enable/disable showing output in preview window