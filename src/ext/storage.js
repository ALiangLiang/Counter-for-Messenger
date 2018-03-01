export default {
  get (key, defaultVal) {
    try {
      const result = JSON.parse(localStorage.getItem(key))
      if (result) {
        return result
      } else {
        localStorage.setItem(key, JSON.stringify(defaultVal))
        return defaultVal
      }
    } catch (e) {
      localStorage.setItem(key, JSON.stringify(defaultVal))
      return defaultVal
    }
  },
  set (key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val))
    } catch (e) {}
  },
  remove (key) {
    try {
      localStorage.removeItem(key)
    } catch (e) {}
  },
  clear () {
    try {
      localStorage.clear()
    } catch (e) {}
  }
}
