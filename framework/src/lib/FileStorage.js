/**
 * @classdesc
 * FileStorage writes and reads {@link FileStorage.File}.
 * this uses [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) as backend storage.
 *
 * example
 *
 * ```
 * async(function*(){
 *   var storage = new FileStorage('com.example');
 *   yield storage.open();
 *   yield storage.write({path: '/foo.txt', content: 'this is foo'});
 *   var result = yield storage.read('/foo.txt');
 *   console.log(result);
 * });
 * ```
 *
 * @class
 * @desc
 * Creates the file storage.
 * But preparation of read and write has not been completed.
 * You need to call the {@link FileStorage#open} method.
 * @param {string} name Storage name.
 */
export default class FileStorage {
  constructor(name) {
    this._version = 1;
    this._name = name;
    this._db = null;
    this._storeName = 'files';
  }

  /**
   * Open a file storage to read and write.
   * @return {Window.Promise} This Promise#then does not have a value.
   */
  open() {
    return new Promise((resolve, reject)=>{
      var request = indexedDB.open(this._name, this._version);

      request.onsuccess = (event)=> {
        this._db = event.target.result;
        resolve();
      };

      request.onupgradeneeded = (event)=> {
        try {
          this._onUpgrade(event);
        } catch(e) {
          reject(e);
        }
      };

      request.onerror = reject;
      request.onblocked = reject;
    });
  }

  /**
   * Create object store.
   * @param {{target:{result: IDBDatabase}}} event
   * @private
   */
  _onUpgrade(event) {
    var db = event.target.result;
    db.createObjectStore(this._storeName, {keyPath: 'path'});
  }

  /**
   * Write file(s) to storage.
   * @param {FileStorage.File | FileStorage.File[]} files File(s) for writing to storage.
   * @returns {Window.Promise} this Promise#then does not have a value.
   */
  write(files) {
    return new Promise((resolve, reject)=> {
      if (!Array.isArray(files)) {
        files = [files];
      }

      var transaction = this._db.transaction(this._storeName, 'readwrite');
      transaction.oncomplete = resolve;
      transaction.onerror = reject;
      transaction.onabort = reject;

      var store = transaction.objectStore(this._storeName);
      for (var file of files) {
        if (this._validateFile(file)) {
          store.put(file);
        } else {
          return reject(new Error(`file is not valid. file = ${file}`));
        }
      }
    });
  }

  /**
   * Read file(s) from storage.
   * @param {string | string[]} paths Path(s) for reading from storage.
   * @returns {Window.Promise} This Promise#then has {@link FileStorage.File} or array of {@link FileStorage.File}.
   */
  read(paths) {
    return new Promise((resolve, reject)=> {
      var isSinglePath = false;
      if (!Array.isArray(paths)) {
        paths = [paths];
        isSinglePath = true;
      }

      var transaction = this._db.transaction(this._storeName, 'readonly');
      transaction.oncomplete = (event)=> {
        if (isSinglePath) {
          resolve(files[0]);
        } else {
          resolve(files);
        }
      };
      transaction.onerror = reject;
      transaction.onabort = reject;

      var files = [];
      var store = transaction.objectStore(this._storeName);
      for (var path of paths) {
        var request = store.get(path);
        request.onsuccess = (event)=> {
          if (event.target.result) {
            files.push(event.target.result);
          }
        };

        request.onerror = reject;
      }
    })
  }

  /**
   * Read all files from storage.
   * @returns {Window.Promise} This Promise#then has array of {@link FileStorage.File}.
   */
  readAll() {
    return new Promise((resolve, reject)=> {
      var files = [];

      var transaction = this._db.transaction(this._storeName, 'readonly');
      transaction.oncomplete = ()=> {
        resolve(files);
      };
      transaction.onerror = reject;
      transaction.onabort = reject;

      var store = transaction.objectStore(this._storeName);
      var request = store.openCursor();
      request.onsuccess = (event)=> {
        var cursor = event.target.result;
        if (cursor) {
          files.push(cursor.value);
          cursor.continue();
        }
      }
    });
  }

  /**
   * Remove file(s) from storage.
   * @param {string | string[]} paths Path(s) for removing from storage.
   * @returns {Window.Promise} This Promise#then does not have a value.
   */
  remove(paths) {
    return new Promise((resolve, reject)=> {
      if (!Array.isArray(paths)) {
        paths = [paths];
      }

      var transaction = this._db.transaction(this._storeName, 'readwrite');
      transaction.oncomplete = resolve;
      transaction.onerror = reject;
      transaction.onabort = reject;

      var store = transaction.objectStore(this._storeName);
      for (var path of paths) {
        store.delete(path);
      }
    });
  }

  /**
   * Remove all files from storage.
   * @returns {Window.Promise} This Promise#then does not have a value.
   */
  removeAll() {
    return new Promise((resolve, reject)=> {

      var transaction = this._db.transaction(this._storeName, 'readwrite');
      transaction.oncomplete = resolve;
      transaction.onerror = reject;
      transaction.onabort = reject;

      var store = transaction.objectStore(this._storeName);
      store.clear();
    });
  }

  /**
   * Delete storage from browser.
   * Must not use this storage, after call this method.
   */
  deleteStorage() {
    if (this._db) {
      this._db.close();
    }

    var request = indexedDB.deleteDatabase(this._name);
    request.onerror = ()=> {
      throw new request.error;
    };
  }

  /**
   * Validate file.
   * @param {FileStorage.File} file
   * @returns {boolean}
   * @private
   */
  _validateFile(file) {
    return !! file.path;
  }
}

/**
 * @typedef {Object} FileStorage.File
 * @property {!string} path A File path.
 * @property {?string} content A file content.
 * @property {?string} hash A file hash(md5, sha1, base64, etc).
 * @property {?string} mime A file mime type(text/javascript, text/html, text/stylesheet, etc).
 */
