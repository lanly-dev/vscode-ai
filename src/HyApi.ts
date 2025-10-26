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

	static async getConfig(): Promise<any> {
		const url = 'https://3d.hunyuan.tencent.com/api/3d/config'
		const headers = await makeHeaders(this.context)
		const response = await fetch(url, { method: 'GET', headers })
		if (!response.ok) throw new Error(`Failed to fetch config: ${response.status}`)
		return response.json()
	}

	static async getUserInfo(): Promise<any> {
		const url = 'https://3d.hunyuan.tencent.com/api/3d/getuserinfo'
		const headers = await makeHeaders(this.context)
		const response = await fetch(url, { method: 'GET', headers })
		if (!response.ok) throw new Error(`Failed to fetch user info: ${response.status}`)
		return response.json()
	}

	static async getQuotaInfo(sceneType: string = '3dCreations'): Promise<any> {
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
		style?: string,
		sceneType?: string,
		modelType?: string,
		count?: number,
		enable_pbr?: boolean,
		enableLowPoly?: boolean,
		faceCount?: number
	}): Promise<any> {

		// Style can be empty|cartoon
		// modelType can be modelCreationV3.0|geometryV3.0
		// faceCount 500000 to 15000000
		params.sceneType = params.sceneType ?? 'playGround3D-2.0'
		params.modelType = params.modelType ?? 'modelCreationV3.0'
		params.count = params.count ?? 4
		params.enable_pbr = params.enable_pbr ?? true
		params.enableLowPoly = params.enableLowPoly ?? false
		params.faceCount = params.faceCount ?? 1500000

		const timestamp = Math.floor(Date.now() / 1000)
		const nonce = Math.random().toString(36).substring(2, 18) // we can't bypass this X(
		const sign = Math.random().toString(36).substring(2, 34) // we can't bypass this x(
		const url = `https://3d.hunyuan.tencent.com/api/3d/creations/generations?timestamp=${timestamp}&nonce=${nonce}&sign=${sign}`
		console.log('Generating 3D model with URL:', url)
		const headers = await makeHeaders(this.context)
		console.log('Generating 3D model with params:', params)
		const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(params) })
		console.log('Response:', response)

		const reader = response.body?.getReader()
		let result = ''
		while (reader) {
			const { done, value } = await reader.read()
			if (done) break
			result += new TextDecoder().decode(value)
		}
		// {"id":"b972aad701d9c5a4903cc82a80510dbc","error":"参数不完整","message":"请求异常，签名验证失败:参数不完整"}
		console.log('Response body:', result)

		if (!response.ok) throw new Error(`Failed to generate 3D model: ${response.status}`)
		return response.json()
	}

	static async getCreationDetails(creationsId: string): Promise<any> {
		const url = `https://3d.hunyuan.tencent.com/api/3d/creations/detail?creationsId=${encodeURIComponent(creationsId)}`
		const headers = await makeHeaders(this.context)
		const response = await fetch(url, { method: 'GET', headers })
		if (!response.ok) throw new Error(`Failed to fetch creation details: ${response.status}`)
		return response.json()
	}

	static async listCreations(params: { limit: number, offset: number, sceneTypeList: string[] }): Promise<any> {
		const url = 'https://3d.hunyuan.tencent.com/api/3d/creations/list'
		const headers = await makeHeaders(this.context)
		const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(params) })
		if (!response.ok) throw new Error(`Failed to list creations: ${response.status}`)
		return response.json()
	}
}
