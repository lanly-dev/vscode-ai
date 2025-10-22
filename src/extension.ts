import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {

	// Output diagnostic information
	console.log('Congratulations, your extension "ai" is now active!')

	// Register the command to open the Hunyuan 3D login page in a Webview
	const openLoginWebview = vscode.commands.registerCommand('ai.openHunyuanLogin', () => {
		const panel = vscode.window.createWebviewPanel(
			'hunyuanLogin',
			'Hunyuan 3D Login',
			vscode.ViewColumn.One,
			{
				enableScripts: true
			}
		)
		panel.webview.html = `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Hunyuan 3D Login</title>
				<style>body,html{margin:0;padding:0;height:100%;width:100%;}</style>
			</head>
			<body style="height:100vh;width:100vw;margin:0;padding:0;">
				<iframe src="https://3d.hunyuan.tencent.com/login" style="border:none;width:100vw;height:100vh;"></iframe>
			</body>
			</html>
		`
	})
	context.subscriptions.push(openLoginWebview)

	// Tree Item for status
	class StatusTreeItem extends vscode.TreeItem {
		constructor(label: string) {
			super(label, vscode.TreeItemCollapsibleState.None)
			this.contextValue = 'statusItem'
			this.command = {
				command: 'ai.openHunyuanLogin',
				title: 'Login',
				tooltip: 'Open Hunyuan 3D Login'
			}
			this.description = 'Not Login'
			this.iconPath = new vscode.ThemeIcon('account')
			// Inline buttons are not supported in TreeItem; use command for click action
		}
	}

	// Tree Data Provider
	class StatusTreeDataProvider implements vscode.TreeDataProvider<StatusTreeItem> {
		getTreeItem(element: StatusTreeItem): vscode.TreeItem {
			return element
		}
		getChildren(element?: StatusTreeItem): Thenable<StatusTreeItem[]> {
			if (!element) {
				return Promise.resolve([
					new StatusTreeItem('Not Login')
				])
			}
			return Promise.resolve([])
		}
	}

	// Register the TreeView
	const statusTreeView = vscode.window.createTreeView('aiStatusTree', {
		treeDataProvider: new StatusTreeDataProvider(),
		showCollapseAll: false
	})
	context.subscriptions.push(statusTreeView)

	// Keep the original helloWorld command
	const disposable = vscode.commands.registerCommand('ai.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from ai!')
	})
	context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate() {}
