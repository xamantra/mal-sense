// eslint-disable-next-line no-unused-vars
class Bootstrapper {
  constructor(paths = [], name) {
    this._paths = paths
    this._name = name
    this._version = '1.1.1'
  }

  start(callback) {
    const url = window.location.href.trim().toLowerCase()
    for (let i = 0; i < this._paths.length; i++) {
      const path = this._paths[i].trim().toLowerCase()
      if (url.includes(path)) {
        console.log(`[MAL Sense - v${this._version}] - Starting "${this._name}" ...`)
        callback()
        break
      }
    }
  }
}
