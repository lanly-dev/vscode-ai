import * as vscode from 'vscode'

export default class HyLogin {
  private static context: vscode.ExtensionContext

  static setContext(context: vscode.ExtensionContext) {
    this.context = context
  }

  static async loginWithEmail(email: string, verificationCode: string): Promise<boolean> {
    const url = 'https://3d.hunyuan.tencent.com/api/login/email/login'
    const payload = { email, verificationCode }
    const headers = {
      Accept: 'application/json, text/plain, */*',
      'x-product': 'hunyuan3d',
      'x-source': 'web',
      'trace-id': crypto.randomUUID()
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        credentials: 'include'
      })
      if (response.ok) {
        const setCookie = response.headers.get('set-cookie')

        const c = setCookie?.split('; ') ?? []
        console.log(c)
        let neededCookie = 'hunyuan_source=web;'
        let found = 0
        for (const part of c) {
          if (part.startsWith('hunyuan_user=')) {
            neededCookie += part + ';'
            found++
          }
          else if (part.includes('hunyuan_token=')) {
            const p = part.replace('Max-Age=0, ', '').replace('HttpOnly, ', '')
            neededCookie += p + ';'
            found++
          }
          if (found === 2) break
        }

        // RESULT FROM BODY: {"isInCoolingPeriod":false,"token":"","userId":"","source":""}
        // const reader = response.body?.getReader()
        // let result = ''
        // while (reader) {
        //   const { done, value } = await reader.read()
        //   if (done) break
        //   result += new TextDecoder().decode(value)
        // }
        // console.log('Response body:', result)

        if (neededCookie) {
          await this.context.secrets.store('HY-EMAIL', email)
          await this.context.secrets.store('hunyuan3d-cookie', neededCookie)
        } else console.warn('No valid cookie found in response')
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
