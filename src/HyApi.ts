import * as vscode from 'vscode'

async function makeHeaders(context: vscode.ExtensionContext): Promise<Record<string, string>> {
	const cookie = await context.secrets.get('hunyuan3d-cookie')
	if (!cookie) throw new Error('Not authenticated. Please log in first.')

	return {
		Cookie: cookie,
		'Content-Type': 'application/json',
		'x-product': 'hunyuan3d',
		'x-source': 'web',
		'trace-id': crypto.randomUUID()
	}
}

export default class HyApi {
	// 2. Get User Info
	static async getUserInfo(context: vscode.ExtensionContext): Promise<any> {
		const url = 'https://3d.hunyuan.tencent.com/api/3d/getuserinfo'
		const headers = await makeHeaders(context)
		const response = await fetch(url, { method: 'GET', headers })
		if (!response.ok) throw new Error(`Failed to fetch user info: ${response.status}`)
		return response.json()
	}

	// 3. Get Configuration
	static async getConfig(context: vscode.ExtensionContext): Promise<any> {
		const url = 'https://3d.hunyuan.tencent.com/api/3d/config'
		const headers = await makeHeaders(context)
		const response = await fetch(url, { method: 'GET', headers })
		if (!response.ok) throw new Error(`Failed to fetch config: ${response.status}`)
		return response.json()
	}

	// 4. Get Quota Info
	static async getQuotaInfo(context: vscode.ExtensionContext, sceneType: string): Promise<any> {
		const url = 'https://3d.hunyuan.tencent.com/api/3d/quotainfo'
		const headers = await makeHeaders(context)
		const payload = { sceneType }
		const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) })
		if (!response.ok) throw new Error(`Failed to fetch quota info: ${response.status}`)
		return response.json()
	}

	// 5. Generate 3D Model
	static async generate3DModel(context: vscode.ExtensionContext, params: {
		prompt: string,
		title: string,
		style: string,
		sceneType: string,
		modelType: string,
		count: number,
		enable_pbr: boolean,
		enableLowPoly: boolean
	}): Promise<any> {
		const url = 'https://3d.hunyuan.tencent.com/api/3d/creations/generations'
		const headers = await makeHeaders(context)
		const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(params) })
		if (!response.ok) throw new Error(`Failed to generate 3D model: ${response.status}`)
		return response.json()
	}

	// 6. Get Creation Details
	static async getCreationDetails(context: vscode.ExtensionContext, creationsId: string): Promise<any> {
		const url = `https://3d.hunyuan.tencent.com/api/3d/creations/detail?creationsId=${encodeURIComponent(creationsId)}`
		const headers = await makeHeaders(context)
		const response = await fetch(url, { method: 'GET', headers })
		if (!response.ok) throw new Error(`Failed to fetch creation details: ${response.status}`)
		return response.json()
	}

	// 7. List Creations
	static async listCreations(context: vscode.ExtensionContext, params: {
		limit: number,
		offset: number,
		sceneTypeList: string[]
	}): Promise<any> {
		const url = 'https://3d.hunyuan.tencent.com/api/3d/creations/list'
		const headers = await makeHeaders(context)
		const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(params) })
		if (!response.ok) throw new Error(`Failed to list creations: ${response.status}`)
		return response.json()
	}
}
