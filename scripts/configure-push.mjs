// One-time provisioning. Only the public VAPID key is printed; private material goes to Edge Secrets.
import { createECDH } from 'node:crypto'
import { execSync } from 'node:child_process'

const key = createECDH('prime256v1')
key.generateKeys()
const publicKey = key.getPublicKey().toString('base64url')
const privateKey = key.getPrivateKey().toString('base64url')
try {
  execSync(`npx supabase secrets set VAPID_PUBLIC_KEY=${publicKey} VAPID_PRIVATE_KEY=${privateKey} VAPID_SUBJECT=https://siagabunda.riset-19e.workers.dev`, { stdio: 'pipe' })
  console.log(`Public VAPID key: ${publicKey}`)
  console.log('Edge Secrets configured. Use this public key in the frontend; never regenerate while subscriptions are active.')
} catch {
  console.error('Could not configure Edge Secrets. Check Supabase CLI login and project link.')
  process.exitCode = 1
}
