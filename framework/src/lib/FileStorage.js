export default class FileStorage {
  constructor(name) {
    this._version = 1;
    this._name = name;
    this._db = null;
    this._storeName = 'files';
  }

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

  _onUpgrade(event) {
    var db = event.target.result;
    db.createObjectStore(this._storeName, {keyPath: 'path'});
  }

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

  deleteStorage() {
    return new Promise((resolve, reject)=> {
      this._db.close();
      var request = indexedDB.deleteDatabase(this._name);
      request.onsuccess = (event)=> {
        resolve(event);
      };
      reject.onerror = reject;
    });
  }

  _validateFile(file) {
    return !! file.path;
  }
}
