type AvatarBucket = {
  move: (from: string, to: string) => Promise<{ error: unknown | null }>
  remove: (paths: string[]) => Promise<{ error: unknown | null }>
  exists: (path: string) => Promise<{ data: boolean; error: unknown | null }>
}

export async function deleteAccountWithAvatarRollback(input: {
  userId: string
  paths: string[]
  operationId: string
  bucket: AvatarBucket
  deleteUser: () => Promise<{ error: unknown | null }>
}): Promise<{ deleted: boolean; avatarRestoreFailed: boolean; avatarCleanupPending: boolean }> {
  const staged: Array<{ original: string; temporary: string }> = []
  const restore = async () => {
    let failed = false
    for (const { original, temporary } of staged.reverse()) {
      try {
        if ((await input.bucket.move(temporary, original)).error) {
          const state = await input.bucket.exists(original)
          if (state.error || !state.data) failed = true
        }
      } catch {
        try {
          const state = await input.bucket.exists(original)
          if (state.error || !state.data) failed = true
        } catch {
          failed = true
        }
      }
    }
    return failed
  }

  for (const original of input.paths) {
    const temporary = `${input.userId}/.delete-${input.operationId}/${original.slice(input.userId.length + 1)}`
    staged.push({ original, temporary })
    try {
      const { error } = await input.bucket.move(original, temporary)
      if (error) return { deleted: false, avatarRestoreFailed: await restore(), avatarCleanupPending: false }
    } catch {
      return { deleted: false, avatarRestoreFailed: await restore(), avatarCleanupPending: false }
    }
  }

  try {
    if ((await input.deleteUser()).error) {
      return { deleted: false, avatarRestoreFailed: await restore(), avatarCleanupPending: false }
    }
  } catch {
    return { deleted: false, avatarRestoreFailed: await restore(), avatarCleanupPending: false }
  }

  try {
    for (let offset = 0; offset < staged.length; offset += 100) {
      const paths = staged.slice(offset, offset + 100).map(({ temporary }) => temporary)
      let removed = false
      for (let attempt = 0; attempt < 2 && !removed; attempt++) {
        try {
          removed = !(await input.bucket.remove(paths)).error
        } catch {
          // Retry once because Auth is already deleted and this cleanup cannot be rolled back.
        }
      }
      if (!removed) return { deleted: true, avatarRestoreFailed: false, avatarCleanupPending: true }
    }
    return { deleted: true, avatarRestoreFailed: false, avatarCleanupPending: false }
  } catch {
    return { deleted: true, avatarRestoreFailed: false, avatarCleanupPending: true }
  }
}
