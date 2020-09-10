// eslint-disable-next-line no-unused-vars
class Bootstrapper {
  constructor(paths = [], name, callback) {
    this._paths = paths
    this._name = name
    this._callback = callback
    this._version = '1.0.2'
  }

  start() {
    const url = window.location.href.trim().toLowerCase()
    let canStart = false
    for (let i = 0; i < this._paths.length; i++) {
      const path = this._paths[i].trim().toLowerCase()
      if (url.includes(path)) {
        canStart = true
        break
      }
    }

    if (canStart && !this._callback) {
      console.log(`[MAL Sense - v${this._version}] - Starting "${this._name}" ...`)
      this._callback()
    }
  }
}
