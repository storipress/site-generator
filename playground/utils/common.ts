export function withTimeout<T>(promise: Promise<T>, timeout = 1000, throwError = false): Promise<T | null> {
  const timeoutPromise = new Promise<T | null>((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      if (throwError) {
        reject(new Error('Operation timed out'))
      }
      resolve(null)
    }, timeout)
  })

  return Promise.race([promise, timeoutPromise])
}
