// Session management for single sign-on enforcement
export class SessionManager {
  private static sessionToken: string | null = null
  private static checkInterval: NodeJS.Timeout | null = null

  static async createSession(): Promise<string> {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' })
      })

      const data = await res.json()
      if (res.ok && data.sessionToken) {
        this.sessionToken = data.sessionToken
        localStorage.setItem('session_token', data.sessionToken)
        this.startSessionValidation()
        return data.sessionToken
      }
      throw new Error(data.error || 'Failed to create session')
    } catch (error) {
      console.error('Session creation failed:', error)
      throw error
    }
  }

  static async validateSession(): Promise<boolean> {
    const token = this.sessionToken || localStorage.getItem('session_token')
    if (!token) return false

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', sessionToken: token })
      })

      const data = await res.json()
      if (!res.ok || !data.valid) {
        this.invalidateSession()
        return false
      }
      return true
    } catch (error) {
      console.error('Session validation failed:', error)
      this.invalidateSession()
      return false
    }
  }

  static invalidateSession() {
    this.sessionToken = null
    localStorage.removeItem('session_token')
    this.stopSessionValidation()
    
    // Force logout and redirect
    window.location.href = '/login?message=Session expired. Please sign in again.'
  }

  static startSessionValidation() {
    this.stopSessionValidation()
    
    // Check session every 30 seconds
    this.checkInterval = setInterval(async () => {
      const isValid = await this.validateSession()
      if (!isValid) {
        this.invalidateSession()
      }
    }, 30000)
  }

  static stopSessionValidation() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  static getSessionToken(): string | null {
    return this.sessionToken || localStorage.getItem('session_token')
  }
}