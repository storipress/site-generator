import pDefer from 'p-defer'

interface LoadJsonpOptions {
  url: string
  params: Record<string, string>
  callbackKey?: string
}

let i = 0

export function loadJsonp<T>({ url, params, callbackKey = 'callback' }: LoadJsonpOptions): Promise<T> {
  const $script = document.createElement('script')
  const searchParams = new URLSearchParams(params)
  const callbackName = `jsonp${Date.now()}${i++}`
  const deferred = pDefer<T>()
  searchParams.set(callbackKey, callbackName)

  Reflect.set(window, callbackName, (x: T) => {
    setTimeout(() => {
      $script.remove()
      Reflect.deleteProperty(window, callbackName)
    }, 3000)
    deferred.resolve(x)
  })

  $script.src = `${url}?${searchParams.toString()}`
  document.head.append($script)

  return deferred.promise
}
