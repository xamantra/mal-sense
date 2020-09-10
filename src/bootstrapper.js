// eslint-disable-next-line no-unused-vars
class Bootstrapper {
  constructor(paths = [], name) {
    this._paths = paths
    this._name = name
    this._version = '1.0.6'
  }

  start(callback) {
    const url = window.location.href.trim().toLowerCase()
    let canStart = false
    for (let i = 0; i < this._paths.length; i++) {
      const path = this._paths[i].trim().toLowerCase()
      console.log(`Checking url for path "${path}"`)
      if (url.includes(path)) {
        canStart = true
      }

      if (i === (this._paths.length - 1)) {
        if (canStart && !callback) {
          console.log(`[MAL Sense - v${this._version}] - Starting "${this._name}" ...`)
          callback()
        } else {
          console.log(`Skipping bootstrap on page "${window.location.href}" for "${this._name}".`)
        }
      }
    }
  }
}
