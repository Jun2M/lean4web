export function getApiBase(): string {
  try {
    const searchParams = new URLSearchParams(window.location.search)
    const fromQuery = searchParams.get('apiBase')
    const fromGlobal = (window as any).__LEANWEB_API_BASE__
    const base = fromQuery || fromGlobal || window.location.origin
    return base.replace(/\/$/, '')
  } catch (_e) {
    return window.location.origin.replace(/\/$/, '')
  }
}

export function getWsBase(): string {
  try {
    const searchParams = new URLSearchParams(window.location.search)
    const fromQuery = searchParams.get('wsBase')
    const fromGlobal = (window as any).__LEANWEB_WS_BASE__
    if (fromQuery || fromGlobal) {
      const base = (fromQuery || fromGlobal) as string
      return base.replace(/\/$/, '')
    }
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${proto}//${window.location.host}`
  } catch (_e) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${proto}//${window.location.host}`
  }
}