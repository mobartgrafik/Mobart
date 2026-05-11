import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vrhrtkjsikutdkmiphbs.supabase.co'
const supabaseKey = 'sb_publishable_dmstXYrdCC-v9UJOdVXFYQ_piq6ThBQ'
const configuredRequestTimeout = Number(import.meta.env.VITE_SUPABASE_REQUEST_TIMEOUT_MS)
const SUPABASE_REQUEST_TIMEOUT_MS =
  Number.isFinite(configuredRequestTimeout) && configuredRequestTimeout > 0
    ? configuredRequestTimeout
    : 15000

function fetchWithTimeout(input, init = {}) {
  const controller = new AbortController()
  const upstreamSignal = init.signal
  const timeoutId = globalThis.setTimeout(() => controller.abort(), SUPABASE_REQUEST_TIMEOUT_MS)

  const abortFromUpstream = () => controller.abort()

  if (upstreamSignal) {
    if (upstreamSignal.aborted) {
      controller.abort()
    } else {
      upstreamSignal.addEventListener('abort', abortFromUpstream, { once: true })
    }
  }

  return fetch(input, {
    ...init,
    signal: controller.signal,
  }).finally(() => {
    globalThis.clearTimeout(timeoutId)
    upstreamSignal?.removeEventListener?.('abort', abortFromUpstream)
  })
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: fetchWithTimeout,
  },
})
