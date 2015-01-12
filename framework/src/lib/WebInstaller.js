export default class WebInstaller {
  constructor(manifestUrl) {
    this._remoteManifestUrl = manifestUrl;
    this._localManifestPath = 'manifest.json';
    this._storage = new FileStorage('org.navyjs');
  }

  exec() {
    return async(function*(){
      yield this._storage.open();

      var [remoteManifest, localManifest] = yield [
          this._getRemoteManifest(this._remoteManifestUrl),
          this._getLocalManifest(this._localManifestPath)
        ];

      if (remoteManifest.hash === localManifest.hash) {
        return;
      }

      var remoteFiles = remoteManifest.files;
      var localFiles = localManifest.files;
      var updateFiles = this._selectUpdateFiles(remoteFiles, localFiles);
      var removeFiles = this._selectRemoveFiles(remoteFiles, localFiles);

      yield [
        this._updateManifest(remoteManifest),
        this._updateFiles(updateFiles),
        this._removeFiles(removeFiles)
      ];
    }.bind(this));
  }

  _getRemoteManifest(manifestUrl) {
    return async(function*(){
      var remoteManifestText = yield this._request(manifestUrl);
      return JSON.parse(remoteManifestText);
    }.bind(this));
  }

  _getLocalManifest(manifestPath) {
    return async(function*(){
      var localManifestFile = yield this._storage.read(manifestPath);
      if (localManifestFile) {
        return localManifestFile.content;
      } else {
        return {};
      }
    }.bind(this));
  }

  _filesToMap(files) {
    var map = {};
    for (var file of files) {
      map[file.path] = file;
    }
    return map;
  }

  _selectUpdateFiles(remoteFiles, localFiles) {
    var localFilesMap = this._filesToMap(localFiles);
    var downloadFiles = [];
    for (var remoteFile of remoteFiles) {
      var remotePath = remoteFile.path;
      var remoteHash = remoteFile.hash;

      if (remotePath === 'manifest.json') {
        continue;
      }

      if (!localFilesMap[remotePath]) {
        downloadFiles.push(remoteFile);
      } else if (localFilesMap[remotePath].hash !== remoteHash) {
        downloadFiles.push(remoteFile);
      }
    }

    return downloadFiles;
  }

  _selectRemoveFiles(remoteFiles, localFiles) {
    var remoteFilesMap = this._filesToMap(remoteFiles);
    var removeFiles = [];
    for (var localFile of localFiles) {
      var localPath = localFile.path;
      if (!remoteFilesMap[localPath]) {
        removeFiles.push(localFile);
      }
    }

    return removeFiles;
  }

  _request(path) {
    return new Promise((resolve, reject)=>{
      var xhr = new XMLHttpRequest();
      path = `${path}?t=${Date.now()}`;
      xhr.open('GET', path, true);
      xhr.onload = (event)=> {
        resolve(event.target.responseText);
      };
      xhr.onerror = reject;
      xhr.onabort = reject;
      xhr.ontimeout = reject;
      xhr.send();
    });
  }

  _updateManifest(manifest) {
    var manifestFile = {
      path: 'manifest.json',
      content: manifest,
      hash: manifest.hash
    };

    return this._storage.write(manifestFile);
  }

  _updateFile(file) {
    return async(function*(){
      file.content = yield this._request(file.path);
      yield this._storage.write(file);
    }.bind(this));
  }

  _updateFiles(files) {
    return async(function*(){
      var promises = [];
      for (var file of files) {
        var promise = this._updateFile(file);
        promises.push(promise);
      }
      yield promises;
    }.bind(this));
  }

  _removeFiles(files) {
    var paths = files.map((file)=>{return file.path});
    return this._storage.remove(paths);
  }
}
