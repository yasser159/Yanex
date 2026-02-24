import { logger } from '../logging/logger'

let entries = logger.getHistory()
const subscribers = new Set()

function notify() {
  subscribers.forEach((subscriber) => {
    subscriber(entries)
  })
}

logger.subscribe((entry) => {
  entries = [...entries, entry].slice(-500)
  notify()
})

export const diagnosticsStore = {
  getEntries() {
    return entries
  },
  subscribe(subscriber) {
    subscribers.add(subscriber)
    return () => subscribers.delete(subscriber)
  },
  clear() {
    entries = []
    logger.clear()
    notify()
  },
}
