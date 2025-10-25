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
	static context: vscode.ExtensionContext

	static setContext(context: vscode.ExtensionContext) {
		this.context = context
	}

	// 2. Get User Info
	static async getUserInfo(): Promise<any> {
		const url = 'https://3d.hunyuan.tencent.com/api/3d/getuserinfo'
		const headers = await makeHeaders(this.context)
		const response = await fetch(url, { method: 'GET', headers })
		if (!response.ok) throw new Error(`Failed to fetch user info: ${response.status}`)
		return response.json()
	}

	// 3. Get Configuration
	static async getConfig(): Promise<any> {
		const url = 'https://3d.hunyuan.tencent.com/api/3d/config'
		const headers = await makeHeaders(this.context)
		const response = await fetch(url, { method: 'GET', headers })
		if (!response.ok) throw new Error(`Failed to fetch config: ${response.status}`)
		return response.json()
	}

	// 4. Get Quota Info
	static async getQuotaInfo(sceneType: string): Promise<any> {
		const url = 'https://3d.hunyuan.tencent.com/api/3d/quotainfo'
		const headers = await makeHeaders(this.context)
		const payload = { sceneType }
		const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) })
		if (!response.ok) throw new Error(`Failed to fetch quota info: ${response.status}`)
		return response.json()
	}

	// 5. Generate 3D Model
	static async generate3DModel(params: {
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
		const headers = await makeHeaders(this.context)
		const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(params) })
		if (!response.ok) throw new Error(`Failed to generate 3D model: ${response.status}`)
		return response.json()
	}

	// 6. Get Creation Details
	static async getCreationDetails(creationsId: string): Promise<any> {
		const url = `https://3d.hunyuan.tencent.com/api/3d/creations/detail?creationsId=${encodeURIComponent(creationsId)}`
		const headers = await makeHeaders(this.context)
		const response = await fetch(url, { method: 'GET', headers })
		if (!response.ok) throw new Error(`Failed to fetch creation details: ${response.status}`)
		return response.json()
	}

	// 7. List Creations
	static async listCreations(params: {
		limit: number,
		offset: number,
		sceneTypeList: string[]
	}): Promise<any> {
		const url = 'https://3d.hunyuan.tencent.com/api/3d/creations/list'
		const headers = await makeHeaders(this.context)
		const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(params) })
		if (!response.ok) throw new Error(`Failed to list creations: ${response.status}`)
		return response.json()
	}
}
