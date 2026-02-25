import { LANGUAGE_STORAGE_KEY, MESSAGES, SUPPORTED_LANGUAGES } from './messages'

export { LANGUAGE_STORAGE_KEY, MESSAGES, SUPPORTED_LANGUAGES }

export function getInitialLanguage() {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
    return savedLanguage
  }

  return window.navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

function getValueByPath(obj, path) {
  return path.split('.').reduce((acc, part) => {
    if (acc == null) {
      return undefined
    }
    return acc[part]
  }, obj)
}

export function t(language, keyPath, fallback = '') {
  const primary = MESSAGES[language] ?? MESSAGES.en
  const primaryValue = getValueByPath(primary, keyPath)

  if (primaryValue !== undefined) {
    return primaryValue
  }

  const englishValue = getValueByPath(MESSAGES.en, keyPath)
  if (englishValue !== undefined) {
    return englishValue
  }

  return fallback || keyPath
}
