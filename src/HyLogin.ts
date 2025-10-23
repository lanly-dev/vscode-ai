
export default class HyLogin {
  constructor() { }

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
        credentials: 'include' // Important: stores cookies automatically
      })

      if (response.ok) {
        console.log(`✅ Login successful for ${email}. Cookies set.`)
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
}
