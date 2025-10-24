import * as vscode from 'vscode'

export default class HyApi {
	static async query3DItems(context: vscode.ExtensionContext): Promise<any> {
		const cookie = await context.secrets.get('hunyuan3d-cookie')
		if (!cookie) throw new Error('Not authenticated. Please log in first.')
		console.log('Using cookie:', cookie)
		const url = 'https://3d.hunyuan.tencent.com/api/3d/getuserinfo' // Replace with actual endpoint if different
		const headers = {
			'Content-Type': 'application/json',
			Cookie: cookie,
			'trace-id': crypto.randomUUID(),
			'x-product': 'hunyuan3d',
			'x-source': 'web'
		}
		const response = await fetch(url, {
			method: 'GET',
			headers: headers
		})
		console.log('Response status:', response)
		if (!response.ok) throw new Error(`Failed to fetch 3D items: ${response.status}`)
		return response.json()
	}
}
