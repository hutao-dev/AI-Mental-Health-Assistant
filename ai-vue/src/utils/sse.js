import { fetchEventSource } from '@microsoft/fetch-event-source'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * 可中断 + 首字节超时 + 指数退避重试 的 SSE 客户端
 * @param {string} url
 * @param {object} opt { headers, body, timeout, retries, baseDelay, handlers }
 */
export function createStream(url, opt) {
  const {
    headers = {},
    body,
    timeout = 10000,
    canRetry = () => true,
    retries = 2,
    baseDelay = 1000,
    handlers = {},
  } = opt

  let ctrl = null
  let stopReason = null      // null | 'user' | 'done' | 'unmount'
  let stopped = false
  let firstByteAt = 0
  let timer = null

  const clearTimer = () => { if (timer) { clearTimeout(timer); timer = null } }

   async function start() {
    stopped = false                                   // ← 挪到 for 之前，整次 start 只重置一次
    for (let attempt = 0; attempt <= retries; attempt++) {
      if (stopped) {                                  // ← 新增：重试等待期内被叫停，立即收手
        handlers.onstopped?.(stopReason || 'user')
        return { ok: false, stopped: true, reason: stopReason || 'user' }
      }
      ctrl = new AbortController()
      stopReason = null
      firstByteAt = 0
      try {
        await new Promise((resolve, reject) => {
          const p = fetchEventSource(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            signal: ctrl.signal,

            async onopen(res) {
              await handlers.onopen?.(res)
              timer = setTimeout(() => {
                if (!firstByteAt && !stopReason) {
                  ctrl.abort(new DOMException('等待首字节超时', 'TimeoutError'))
                }
              }, timeout)
            },

            onmessage(event) {
              if (!firstByteAt) firstByteAt = Date.now()
              handlers.onmessage?.(event)
            },

            onclose() {
              clearTimer()
              handlers.onclose?.()
              resolve()
            },

            onerror(err) {
              clearTimer()
              reject(err)
              throw err   // 不抛的话库会自己无限重连，我们的退避就失效了
            },
          })
          // 库自身的 rejection 已被 onerror 接管，这里吞掉防止 Uncaught (in promise)
          p?.catch?.(() => {})
        })
        return { ok: true, stopped: stopReason === 'user' }
      } catch (err) {
        clearTimer()
        if (stopReason) {
          handlers.onstopped?.(stopReason)
          return { ok: false, stopped: true, reason: stopReason }
        }
        if (attempt === retries || !canRetry()) {
          handlers.onerror?.(err)
          return { ok: false, error: err }
        }
        const delay = baseDelay * 2 ** attempt
        handlers.onretry?.(attempt + 1, delay)
        await sleep(delay)
      }
    }
  }

  function stop(reason = 'user') {
    stopped = true
    if (!ctrl) return
    stopReason = reason
    ctrl.abort()
  }

  return { start, stop }
}
