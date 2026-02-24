const MAX_LOG_HISTORY = 500

const listeners = new Set()
const history = []

const levelToConsoleMethod = {
  info: 'log',
  warn: 'warn',
  error: 'error',
}

function nextLogId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function emit(level, event, payload = {}) {
  const entry = {
    id: nextLogId(),
    timestamp: new Date().toISOString(),
    level,
    event,
    payload,
  }

  history.push(entry)
  if (history.length > MAX_LOG_HISTORY) {
    history.shift()
  }

  const consoleMethod = levelToConsoleMethod[level] ?? 'log'
  console[consoleMethod](`[${entry.timestamp}] [${level.toUpperCase()}] ${event}`, payload)

  listeners.forEach((listener) => {
    try {
      listener(entry)
    } catch (listenerError) {
      console.error('Diagnostics listener failed', listenerError)
    }
  })

  return entry
}

export const logger = {
  info(event, payload = {}) {
    return emit('info', event, payload)
  },
  warn(event, payload = {}) {
    return emit('warn', event, payload)
  },
  error(event, payload = {}) {
    return emit('error', event, payload)
  },
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getHistory() {
    return [...history]
  },
  clear() {
    history.length = 0
    emit('info', 'diagnostics.cleared', {})
  },
}
