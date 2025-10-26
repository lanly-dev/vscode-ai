import * as vscode from 'vscode'
import { createHmac } from 'crypto'

async function makeHeaders(context: vscode.ExtensionContext): Promise<Record<string, string>> {
	const cookie = await context.secrets.get('hunyuan3d-cookie')
	if (!cookie) throw new Error('Not authenticated. Please log in first.')

	return {
		Cookie: cookie,
		'Content-Type': 'application/json',
		'x-product': 'hunyuan3d',
		'x-source': 'web',
		'trace-id': crypto.randomUUID(),
		Origin: 'https://3d.hunyuan.tencent.com',
		Referer: 'https://3d.hunyuan.tencent.com/'
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

		// Sign only timestamp+nonce (matches site request interceptor behavior)
		const { sign, timestamp, nonce } = hunyuanSign({})
		const url = `https://3d.hunyuan.tencent.com/api/3d/creations/generations?timestamp=${timestamp}&nonce=${nonce}&sign=${sign}`
		const headers = await makeHeaders(this.context)
		console.log('Generating 3D model with params:', params)
		const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(params) })
		if (!response.ok) throw new Error(`Failed to generate 3D model: ${response.status}`)
		try {
			return await response.json()
		} catch {
			const text = await response.text()
			return { ok: response.ok, status: response.status, body: text }
		}
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

// --- Hunyuan 3D signature algorithm (reverse-engineered) ---

// These constants are from the site bundle (Uint8Array/number[])
const P = new Uint8Array([122,59,92,165,30,79,166,139,142,129,139,89,219,131,101,204])
const F = new Uint8Array([122,59,92,45,30,79,106,139,156,13,46,63,74,91,108,125])
const E = [3,5,2,7,1,4,6,2,5,3,1,4,2,6,3,5]
const Y = [14,11,13,9,15,10,12,8,6,3,5,1,7,2,4,0]

function rotateLeft(byte: number, bits: number): number {
  return ((byte << bits) | (byte >>> (8 - bits))) & 0xff
}

function deriveSecret(): string {
  // Step 1: XOR P and F
  const t = new Uint8Array(16)
  for (let i = 0; i < 16; i++) t[i] = P[i] ^ F[i]
  // Step 2: rotate each by E[i]
  const n = new Uint8Array(16)
  for (let i = 0; i < 16; i++) n[i] = rotateLeft(t[i], E[i])
  // Step 3: reorder by Y
  const r = new Uint8Array(16)
  for (let i = 0; i < 16; i++) r[i] = n[Y[i]]
  // Step 4: decode as UTF-8 up to first zero byte
  let end = r.indexOf(0)
  if (end === -1) end = 16
  return new TextDecoder().decode(r.slice(0, end))
}

function buildQueryString(params: Record<string, any>): string {
  // Filter out null/undefined/empty, convert to string, sort by key
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => [k, String(v)])
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
}

function randomNonce(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < length; i++) out += chars.charAt(Math.floor(Math.random() * chars.length))
  return out
}

/**
 * Generates the Hunyuan 3D API sign, timestamp, and nonce.
 * @param params The request params (body or query) as a flat object.
 * @returns { sign, timestamp, nonce }
 */
export function hunyuanSign(params: Record<string, any>) {
  const timestamp = Math.floor(Date.now() / 1000)
  const nonce = randomNonce(16)
  const base = { ...params, timestamp, nonce }
  const qs = buildQueryString(base)
  const secret = deriveSecret()
  const h = createHmac('sha256', secret)
  h.update(qs)
  const sign = h.digest('hex')
  return { sign, timestamp, nonce }
}
// --- End signature code ---
