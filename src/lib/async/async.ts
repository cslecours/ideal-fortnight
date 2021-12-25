// Not really used, likely to get deleted

export function rejectWhenTimeout<T>(promise: Promise<T>, ms: number) {
  if (!ms) return promise

  return new Promise((resolve, reject) => {
    const h = setTimeout(() => {
      reject(new Error("timeout"))
    }, ms)
    promise.then((x) => {
      clearTimeout(h)
      resolve(x)
    })
  })
}

export function delay(ms: number): Promise<number> {
  return new Promise((resolve) => setTimeout(() => resolve(ms), ms))
}
