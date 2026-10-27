export function requiresExternalChatConsent(isOnline: boolean, consentGiven: boolean): boolean {
  return isOnline && !consentGiven
}
