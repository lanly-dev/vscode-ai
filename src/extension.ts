import * as vscode from 'vscode'
import { StatusTreeDataProvider } from './treeview'
import HyLogin from './HyLogin'
import HyApi from './HyApi'
export function activate(context: vscode.ExtensionContext) {
	HyLogin.setContext(context)
	HyApi.setContext(context)

	const dWebview = vscode.commands.registerCommand('ai.loginWebsite', () => {
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
	const dTreeView = vscode.window.createTreeView('aiTreeView', {
		treeDataProvider: new StatusTreeDataProvider(),
		showCollapseAll: false
	})

	// Command to prompt user for email and code
	const dLoggingIn = vscode.commands.registerCommand('ai.loggingIn', async () => {
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
		if (success) vscode.window.showInformationMessage('✅ Hunyuan 3D Login successful!')
		else vscode.window.showErrorMessage('❌ Hunyuan 3D Login failed. Please check your email and code.')
	})

	const d1 = vscode.commands.registerCommand('ai.getConfig', async () => {
		try {
			const config = await HyApi.getConfig()
			vscode.window.showInformationMessage(`Hunyuan Config fetched: ${JSON.stringify(config)}`)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			vscode.window.showErrorMessage(`Error fetching Hunyuan Config: ${errorMessage}`)
		}
	})

	const d2 = vscode.commands.registerCommand('ai.getUserInfo', async () => {
		try {
			const userInfo = await HyApi.getUserInfo()
			vscode.window.showInformationMessage(`User Info fetched: ${JSON.stringify(userInfo)}`)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			vscode.window.showErrorMessage(`Error fetching User Info: ${errorMessage}`)
		}
	})

	const d3 = vscode.commands.registerCommand('ai.getQuotaInfo', async () => {
		try {
			const quotaInfo = await HyApi.getQuotaInfo()
			vscode.window.showInformationMessage(`Quota Info fetched: ${JSON.stringify(quotaInfo)}`)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			vscode.window.showErrorMessage(`Error fetching Quota Info: ${errorMessage}`)
		}
	})

	const d4 = vscode.commands.registerCommand('ai.generate3DModel', async () => {
		try {
			const model = await HyApi.generate3DModel({
				prompt: 'A futuristic cityscape with flying cars',
				title: 'A futuristic cityscape with flying cars'
			})
			vscode.window.showInformationMessage(`3D Model generated: ${JSON.stringify(model)}`)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			vscode.window.showErrorMessage(`Error generating 3D Model: ${errorMessage}`)
		}
	})

	const d5 = vscode.commands.registerCommand('ai.getCreationDetails', async () => {
		try {
			const creationDetails = await HyApi.getCreationDetails('example-creation-id')
			vscode.window.showInformationMessage(`Creation Details fetched: ${JSON.stringify(creationDetails)}`)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			vscode.window.showErrorMessage(`Error fetching Creation Details: ${errorMessage}`)
		}
	})

	const d6 = vscode.commands.registerCommand('ai.listCreations', async () => {
		try {
			const items = await HyApi.listCreations({ limit: 20, offset: 0, sceneTypeList: [] })
			vscode.window.showInformationMessage(`Fetched ${items.length} 3D items.`)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			vscode.window.showErrorMessage(`Error fetching 3D items: ${errorMessage}`)
		}
	})

	context.subscriptions.push(dWebview, dLoggingIn, dTreeView, d1, d2, d3, d4, d5, d6)
}

// This method is called when your extension is deactivated
export function deactivate() { }
