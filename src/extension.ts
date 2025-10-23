import * as vscode from 'vscode'
import { StatusTreeItem, StatusTreeDataProvider } from './treeview'
import HyLogin from './HyLogin'
export function activate(context: vscode.ExtensionContext) {

	const d1 = vscode.commands.registerCommand('ai.hunyuanLoginWebsite', () => {
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



	// Command to prompt user for email and code
	const hunyuanLoggingIn = vscode.commands.registerCommand('ai.hunyuanLoggingIn', async () => {
		const email = await vscode.window.showInputBox({
			prompt: 'Enter your email for Hunyuan 3D',
			placeHolder: 'your@email.com',
			validateInput: value =>
				!value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)
					? 'Please enter a valid email address.'
					: null
		})
		if (!email) return
		const code = await vscode.window.showInputBox({
			prompt: 'Enter the verification code sent to your email',
			placeHolder: '123456',
			validateInput: value =>
				!value || value.length < 4
					? 'Please enter the code you received.'
					: null
		})
		if (!code) return
		const success = await HyLogin.loginWithEmail(email, code)
		if (success)
			vscode.window.showInformationMessage('✅ Hunyuan 3D Login successful!')
		else
			vscode.window.showErrorMessage('❌ Hunyuan 3D Login failed. Please check your email and code.')

	})
	context.subscriptions.push(hunyuanLoggingIn)

	context.subscriptions.push(statusTreeView, d1)
}

// This method is called when your extension is deactivated
export function deactivate() { }
