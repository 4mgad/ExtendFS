(function(global) {
  if ((typeof window !== 'undefined' && !!window.window) || typeof require !== 'function') {
    throw(new Error("ExtendFS.js can only be used within node.js"));
  }

  var fs = require('fs');

  var ExtendFS = (function() {

    var _copyFile = function(src, dest, onCopy) {
      var rd = fs.createReadStream(src);
      rd.on("error", function(err) {
        onCopy(err);
      });
      var wr = fs.createWriteStream(dest);
      wr.on("error", function(err) {
        onCopy(err);
      });
      wr.on("close", function(err) {
        onCopy(err);
      });
      rd.pipe(wr);
    };

    var _copyDir = function(src, dest, onCopyDir, onCopyFile) {
      onCopyFile = onCopyFile || function() {
      };
      onCopyDir = onCopyDir || function() {
      };
      if (fs.existsSync(src)) {
        fs.mkdir(dest, function(err) {
          if (err) {
            onCopyDir(err);
          } else {
            fs.readdir(src, function(err, files) {
              if (err) {
                onCopyDir(err);
              } else {
                var count = files.length;
                var check = function(decrement) {
                  decrement && count--;
                  if (count <= 0) {
                    onCopyDir(null, src, dest);
                  }
                };
                check();
                files.forEach(function(file) {
                  var sf = src + "/" + file;
                  var df = dest + "/" + file;
                  if (fs.statSync(sf).isDirectory()) {// copy dir recuresively
                    _copyDir(sf, df, function(err, sd, dd) {
                      onCopyDir(err, sd, dd);
                      if (!err && sf === sd && df === dd) {
                        check(true);
                      }
                    }, onCopyFile);
                  } else {
                    _copyFile(sf, df, function(err) {
                      if (err) {
                        onCopyFile(err);
                      } else {
                        onCopyFile(null, sf, df);
                        check(true);
                      }
                    });
                  }
                });
              }
            });
          }
        });
      } else {
        onCopyDir(src + " does not exist");
      }
    };

    var _deleteDir = function(dirPath, onDeleteDir, onDeleteFile) {
      onDeleteDir = onDeleteDir || function() {
      };
      onDeleteFile = onDeleteFile || function() {
      };
      if (fs.existsSync(dirPath)) {
        var files = fs.readdirSync(dirPath);
        var count = files.length;
        var check = function(decrement) {
          decrement && count--;
          if (count <= 0) {
            fs.rmdir(dirPath, function(err) {
              if (err) {
                onDeleteDir(err);
              } else {
                onDeleteDir(null, dirPath);
              }
            });
          }
        };
        check();
        files.forEach(function(file) {
          var filePath = dirPath + "/" + file;
          if (fs.statSync(filePath).isDirectory()) {// delete dir recuresively
            _deleteDir(filePath, function(err, dPath) {
              onDeleteDir(err, dPath);
              if (!err && dPath === filePath) {
                check(true);
              }
            }, onDeleteFile);
          } else { // delete file
            fs.unlink(filePath, function(err) {
              if (err) {
                onDeleteFile(err);
              } else {
                onDeleteFile(null, filePath);
                check(true);
              }
            });
          }
        }
        );
      } else {
        onDeleteDir(dirPath + " does not exist");
      }
    };

    var _createDirs = function(dirPath, onCreateDir) {
      onCreateDir = onCreateDir || function() {
      };
      var createDir = function(dir) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
          onCreateDir(null, dir);
        }
      };
      var dirArr = dirPath.split('/');
      var currDir = '';
      try {
        dirArr.forEach(function(dir, idx) {
          if (dir === '.') {
            currDir += dir + '/';
          } else if (dir === '..') {
            currDir += dir + '/';
          } else if (dir === '') {
            currDir += '/' + dir;
          } else {
            currDir += dir;
            if (idx < (dirArr.length - 1)) {
              currDir += '/';
            }
            createDir(currDir);
          }
        });
      } catch (err) {
        onCreateDir(err);
      }
    };

    return {
      getExtension: function(filePath) {
        var i = filePath.lastIndexOf('.');
        return (i < 0) ? '' : filePath.substr(i + 1);
      },
      copyFile: function(src, dest, onCopy) {
        _copyFile(src, dest, onCopy);
      },
      copyDir: function(src, dest, onCopy, onCopyDir, onCopyFile) {
        onCopy = onCopy || function() {
        };
        onCopyDir = onCopyDir || function() {
        };
        onCopyFile = onCopyFile || function() {
        };
        _copyDir(src, dest, function(err, _src, _dest) {
          if (err) {
            onCopy(err);
          } else {
            onCopyDir(null, _src, _dest);
            if (dest === _dest) {
              onCopy(null, src, dest);
            }
          }
        }, onCopyFile);
      },
      deleteDir: function(dirPath, onDelete, onDeleteDir, onDeleteFile) {
        onDelete = onDelete || function() {
        };
        onDeleteDir = onDeleteDir || function() {
        };
        onDeleteFile = onDeleteFile || function() {
        };
        _deleteDir(dirPath, function(err, deletedDir) {
          if (err) {
            onDelete(err);
          } else {
            onDeleteDir(null, deletedDir);
            if (deletedDir === dirPath) {
              onDelete(null, deletedDir);
            }
          }
        }, onDeleteFile);
      },
      createDirs: function(dirPath, onComplete, onCreateDir) {
        onComplete = onComplete || function() {
        };
        onCreateDir = onCreateDir || function() {
        };
        if (fs.existsSync(dirPath)) {
          onComplete(null, dirPath);
        } else {
          _createDirs(dirPath, function(err, createdDir) {
            if (err) {
              onComplete(err);
            } else {
              onCreateDir(null, createdDir);
              if (createdDir === dirPath) {
                onComplete(null, createdDir);
              }
            }
          });
        }
      }
    };
  })();

  for (var key in fs) {
    ExtendFS[key] = fs[key];
  }
  module["exports"] = ExtendFS;
})(this);
