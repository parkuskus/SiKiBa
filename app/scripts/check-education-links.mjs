import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { getEducationTopicForResult } from '../src/features/edukasi/resultTopics.ts'

assert.equal(getEducationTopicForResult('danger'), 'bahaya')
assert.equal(getEducationTopicForResult('preeklamsia'), 'bahaya')
assert.equal(getEducationTopicForResult('mental'), 'psikologi')
assert.equal(getEducationTopicForResult('dmg'), null, 'do not link to unrelated education when no matching topic exists')
assert.equal(getEducationTopicForResult('ikterus'), null)

const result = await readFile('src/features/skrining/components/SkriningResultScreen.tsx', 'utf8')
assert.match(result, /onClick=\{onOpenEducation\}/, 'result screen invokes the education destination callback')
assert.match(result, /Baca materi terkait/, 'result only labels the action when a related topic is available')
const app = await readFile('src/App.tsx', 'utf8')
assert.match(app, /initialTopic=\{educationTopic\}/, 'result navigation opens the chosen topic in the education page')

console.log('Tautan hasil skrining hanya mengarah ke materi edukasi yang relevan')
