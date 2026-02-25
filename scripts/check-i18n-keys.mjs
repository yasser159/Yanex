import { MESSAGES } from '../src/i18n/messages.js'

function collectPaths(value, prefix = '') {
  if (Array.isArray(value)) {
    const lengthPath = prefix ? `${prefix}[]` : '[]'
    const paths = [lengthPath]
    value.forEach((item, index) => {
      const itemPrefix = `${prefix}[${index}]`
      paths.push(...collectPaths(item, itemPrefix))
    })
    return paths
  }

  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, nestedValue]) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key
      return [nextPrefix, ...collectPaths(nestedValue, nextPrefix)]
    })
  }

  return prefix ? [prefix] : []
}

function compareLocaleKeys(baseLocale, compareLocale) {
  const baseKeys = new Set(collectPaths(MESSAGES[baseLocale]))
  const compareKeys = new Set(collectPaths(MESSAGES[compareLocale]))

  const missingInCompare = [...baseKeys].filter((key) => !compareKeys.has(key)).sort()
  const extraInCompare = [...compareKeys].filter((key) => !baseKeys.has(key)).sort()

  return { missingInCompare, extraInCompare }
}

const { missingInCompare, extraInCompare } = compareLocaleKeys('en', 'zh')

if (missingInCompare.length === 0 && extraInCompare.length === 0) {
  console.log('i18n key check passed: en and zh are synchronized.')
  process.exit(0)
}

console.error('i18n key mismatch detected between en and zh.')
if (missingInCompare.length > 0) {
  console.error('\nMissing in zh:')
  missingInCompare.forEach((key) => console.error(`- ${key}`))
}
if (extraInCompare.length > 0) {
  console.error('\nExtra in zh:')
  extraInCompare.forEach((key) => console.error(`- ${key}`))
}

process.exit(1)
