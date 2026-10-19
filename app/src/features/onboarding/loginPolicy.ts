export function loginMode(isOnline: boolean, isDemo: boolean): 'offline' | 'otp' | 'demo' {
  if (isDemo) return 'demo'
  return isOnline ? 'otp' : 'offline'
}
