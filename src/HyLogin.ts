import * as vscode from 'vscode'

export default class HyLogin {
  private static context: vscode.ExtensionContext

  static setContext(context: vscode.ExtensionContext) {
    this.context = context
  }

  static async loginWithEmail(email: string, verificationCode: string): Promise<boolean> {
    const url = 'https://3d.hunyuan.tencent.com/api/login/email/login'
    const payload = {
      email: email,
      verificationCode: verificationCode
    }
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
      'x-product': 'hunyuan3d',
      'x-source': 'web',
      'trace-id': crypto.randomUUID(),
      Origin: 'https://3d.hunyuan.tencent.com',
      Referer: 'https://3d.hunyuan.tencent.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        credentials: 'include'
      })
      if (response.ok) {
        // Try to get the set-cookie header (may not be available in fetch API)
        // If not, you may need to extract from response headers or use a library
        const cookie = response.headers.get('set-cookie')
        const reader = response.body?.getReader();
        let result = ''
        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          result += new TextDecoder().decode(value);
        }
        console.log('Response body:', result)
        // if (cookie) {
        //   await this.context.secrets.store('hunyuan3d-cookie', cookie)
        //   console.log('✅ Cookie stored in SecretStorage')
        // } else console.warn('No set-cookie header found in response')

        console.log(`✅ Login successful for ${email}.`)
        return true
      } else {
        console.error(`❌ Login failed. Status: ${response.status}`)
        return false
      }
    } catch (error) {
      console.error(`❌ Error during login: ${error}`)
      return false
    }
  }

  static async getStoredCookie(): Promise<string | undefined> {
    return this.context.secrets.get('hunyuan3d-cookie')
  }
}
