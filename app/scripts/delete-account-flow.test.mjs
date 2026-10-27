import test from 'node:test'
import assert from 'node:assert/strict'
import { deleteAccountWithAvatarRollback } from '../../supabase/functions/_shared/deleteAccount.ts'

test('restores every staged avatar when Auth deletion fails', async () => {
  const objects = new Set(['user-1/avatar.jpg', 'user-1/nested/old.jpg'])
  const moved = []
  const bucket = {
    async move(from, to) {
      if (!objects.delete(from)) return { error: new Error(`missing ${from}`) }
      objects.add(to)
      moved.push([from, to])
      return { error: null }
    },
    async remove(paths) {
      for (const path of paths) objects.delete(path)
      return { error: null }
    },
    async exists(path) { return { data: objects.has(path), error: null } },
  }
  const result = await deleteAccountWithAvatarRollback({
    userId: 'user-1',
    paths: [...objects],
    operationId: 'op-1',
    bucket,
    deleteUser: async () => ({ error: new Error('Auth unavailable') }),
  })

  assert.equal(result.deleted, false)
  assert.equal(result.avatarRestoreFailed, false)
  assert.deepEqual(objects, new Set(['user-1/avatar.jpg', 'user-1/nested/old.jpg']))
  assert.equal(moved.length, 4)
})

test('restores earlier avatars if staging a later avatar fails', async () => {
  const objects = new Set(['user-1/first.jpg', 'user-1/second.jpg'])
  const bucket = {
    async move(from, to) {
      if (from === 'user-1/second.jpg') return { error: new Error('Storage unavailable') }
      objects.delete(from)
      objects.add(to)
      return { error: null }
    },
    async remove() { return { error: null } },
    async exists(path) { return { data: objects.has(path), error: null } },
  }
  const result = await deleteAccountWithAvatarRollback({
    userId: 'user-1',
    paths: ['user-1/first.jpg', 'user-1/second.jpg'],
    operationId: 'op-2',
    bucket,
    deleteUser: async () => { throw new Error('must not delete account') },
  })

  assert.equal(result.deleted, false)
  assert.equal(result.avatarRestoreFailed, false)
  assert.deepEqual(objects, new Set(['user-1/first.jpg', 'user-1/second.jpg']))
})

test('restores an avatar when Storage moved it but the move response failed', async () => {
  const objects = new Set(['user-1/avatar.jpg'])
  let firstMove = true
  const bucket = {
    async move(from, to) {
      if (!objects.delete(from)) return { error: new Error('missing source') }
      objects.add(to)
      if (firstMove) {
        firstMove = false
        return { error: new Error('response lost after move') }
      }
      return { error: null }
    },
    async remove(paths) { for (const path of paths) objects.delete(path); return { error: null } },
    async exists(path) { return { data: objects.has(path), error: null } },
  }
  const result = await deleteAccountWithAvatarRollback({
    userId: 'user-1', paths: ['user-1/avatar.jpg'], operationId: 'op-3', bucket,
    deleteUser: async () => { throw new Error('must not delete account') },
  })

  assert.equal(result.deleted, false)
  assert.equal(result.avatarRestoreFailed, false)
  assert.deepEqual(objects, new Set(['user-1/avatar.jpg']))
})

test('retries transient staged-avatar cleanup after Auth deletion', async () => {
  const objects = new Set(['user-1/avatar.jpg'])
  let removeCalls = 0
  const bucket = {
    async move(from, to) { objects.delete(from); objects.add(to); return { error: null } },
    async remove(paths) {
      removeCalls++
      if (removeCalls === 1) return { error: new Error('temporary Storage failure') }
      for (const path of paths) objects.delete(path)
      return { error: null }
    },
    async exists(path) { return { data: objects.has(path), error: null } },
  }
  const result = await deleteAccountWithAvatarRollback({
    userId: 'user-1', paths: ['user-1/avatar.jpg'], operationId: 'op-4', bucket,
    deleteUser: async () => ({ error: null }),
  })

  assert.equal(result.deleted, true)
  assert.equal(result.avatarCleanupPending, false)
  assert.equal(removeCalls, 2)
  assert.deepEqual(objects, new Set())
})

test('reports staged cleanup that remains unavailable after retry', async () => {
  const bucket = {
    async move() { return { error: null } },
    async remove() { return { error: new Error('Storage unavailable') } },
    async exists() { return { data: false, error: null } },
  }
  const result = await deleteAccountWithAvatarRollback({
    userId: 'user-1', paths: ['user-1/avatar.jpg'], operationId: 'op-5', bucket,
    deleteUser: async () => ({ error: null }),
  })

  assert.equal(result.deleted, true)
  assert.equal(result.avatarCleanupPending, true)
})
