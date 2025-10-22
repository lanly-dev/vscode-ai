import * as vscode from 'vscode'
import { StatusTreeItem, StatusTreeDataProvider } from './treeview'

export function activate(context: vscode.ExtensionContext) {

	const d1 = vscode.commands.registerCommand('ai.hunyuanLogin', () => {
		const panel = vscode.window.createWebviewPanel(
			'hunyuanLogin',
			'Hunyuan Login',
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

	// Register the TreeView
	const statusTreeView = vscode.window.createTreeView('aiTreeView', {
		treeDataProvider: new StatusTreeDataProvider(),
		showCollapseAll: false
	})
	context.subscriptions.push(statusTreeView, d1)
}

// This method is called when your extension is deactivated
export function deactivate() { }
