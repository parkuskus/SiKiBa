import assert from 'node:assert/strict'
import { loginMode } from '../src/features/onboarding/loginPolicy.ts'

assert.equal(loginMode(false, false), 'offline', 'email tersimpan bukan autentikasi saat offline')
assert.equal(loginMode(true, false), 'otp', 'akun biasa selalu masuk lewat OTP saat online')
assert.equal(loginMode(false, true), 'demo', 'jalur OTP demo tetap tersedia offline')

console.log('Kebijakan masuk offline terverifikasi')
