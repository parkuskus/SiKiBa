import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { getEducationLinkForResult } from '../src/features/edukasi/resultTopics.ts'

assert.deepEqual(getEducationLinkForResult('danger'), { topic: 'bahaya', title: 'Tanda Bahaya Kehamilan' })
assert.deepEqual(getEducationLinkForResult('preeklamsia'), { topic: 'bahaya', title: 'Tanda Bahaya Kehamilan' })
assert.deepEqual(getEducationLinkForResult('mental'), { topic: 'psikologi', title: 'Perubahan Psikologi/Emosi' })
assert.equal(getEducationLinkForResult('dmg'), null, 'do not link to unrelated education when no matching topic exists')
assert.equal(getEducationLinkForResult('ikterus'), null)
assert.equal(getEducationLinkForResult('hipotiroid'), null)

const result = await readFile('src/features/skrining/components/SkriningResultScreen.tsx', 'utf8')
assert.match(result, /onClick=\{onOpenEducation\}/, 'result screen invokes the education destination callback')
assert.match(result, /Baca materi/, 'result only labels the action when a related topic is available')
const app = await readFile('src/App.tsx', 'utf8')
assert.match(app, /initialTopic=\{educationTopic\}/, 'result navigation opens the chosen topic in the education page')

console.log('Tautan hasil skrining hanya mengarah ke materi edukasi yang relevan')
