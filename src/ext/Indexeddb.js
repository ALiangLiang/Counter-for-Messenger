function promisifyRequestResult (request) {
  return new Promise(function (resolve, reject) {
    request.onerror = (event) => reject(event)
    request.onsuccess = (event) => resolve(request.result)
  })
}

export default class Indexeddb {
  constructor (selfId) {
    this._indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    if (!this._indexedDB) {
      window.alert('Your browser doesn\'t support a stable version of IndexedDB. Such and such feature will not be available.')
    }
    this._loaded = false
    const request = this._indexedDB.open(selfId)
    request.onerror = function (err) { console.error(err) }
    request.onsuccess = (event) => {
      this._db = event.currentTarget.result
      if (this._onload) {
        this._loaded = true
        this._onload()
      }
    }
    request.onupgradeneeded = function (event) {
      event.currentTarget.result.createObjectStore('Threads', {
        keyPath: 'id'
      })
    }
  }

  set onload (cb) {
    this._onload = cb
    if (this._loaded) cb()
  }

  get onload () {
    return this._onload
  }

  get (senderID) {
    const request = this._db.transaction('Threads')
      .objectStore('Threads')
      .get(senderID)
    return promisifyRequestResult(request)
  }

  getAll () {
    const request = this._db.transaction('Threads')
      .objectStore('Threads')
      .getAll()
    return promisifyRequestResult(request)
  }

  add (values) {
    values = (values instanceof Array) ? values : [values]
    console.log(this._db)
    const objectStore = this._db.transaction('Threads', 'readwrite').objectStore('Threads')
    return Promise.all(values.map((val) => promisifyRequestResult(objectStore.add(val))))
  }

  put (values) {
    values = (values instanceof Array) ? values : [values]
    const objectStore = this._db.transaction('Threads', 'readwrite').objectStore('Threads')
    return Promise.all(values.map((val) => promisifyRequestResult(objectStore.put(val))))
  }

  remove (senderID) {
    const request = this._db.transaction('Threads')
      .objectStore('Threads')
      .delete(senderID)
    return promisifyRequestResult(request)
  }

  destroy () {
    const request = this._indexedDB.deleteDatabase(this._selfId)
    return promisifyRequestResult(request)
  }
}
