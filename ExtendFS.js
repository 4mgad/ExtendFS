'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getExtension = getExtension;
exports.copyFile = copyFile;
exports.copyDir = copyDir;
exports.deleteDir = deleteDir;
exports.createDirs = createDirs;

var _fs = require('fs');

Object.keys(_fs).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function get() {
			return _fs[key];
		}
	});
});

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _copyDir = function _copyDir(src, dest, onCopyDir, onCopyFile) {
	onCopyFile = onCopyFile || function () {};
	onCopyDir = onCopyDir || function () {};
	if (_fs2.default.existsSync(src)) {
		_fs2.default.mkdir(dest, function (err) {
			if (err) {
				onCopyDir(err);
			} else {
				var rsrc = _fs2.default.realpathSync(src);
				var rdest = _fs2.default.realpathSync(dest);
				if (rdest.substr(0, rsrc.length) === rsrc) {
					deleteDir(rdest, function (err, deletedDir) {
						if (err) {
							onCopyDir(err);
						}
					});
					onCopyDir('Copying to a sub directory is not allowed');
				} else {
					_fs2.default.readdir(src, function (err, files) {
						if (err) {
							onCopyDir(err);
						} else {
							var count = files.length;
							var check = function check(decrement) {
								decrement && count--;
								if (count <= 0) {
									onCopyDir(null, src, dest);
								}
							};
							check();
							files.forEach(function (file) {
								var sf = src + "/" + file;
								var df = dest + "/" + file;
								if (_fs2.default.statSync(sf).isDirectory()) {
									// copy dir recuresively
									_copyDir(sf, df, function (err, sd, dd) {
										onCopyDir(err, sd, dd);
										if (!err && sf === sd && df === dd) {
											check(true);
										}
									}, onCopyFile);
								} else {
									copyFile(sf, df, function (err) {
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
			}
		});
	} else {
		onCopyDir(src + " does not exist");
	}
};

var _deleteDir = function _deleteDir(dirPath, onDeleteDir, onDeleteFile) {
	onDeleteDir = onDeleteDir || function () {};
	onDeleteFile = onDeleteFile || function () {};
	if (_fs2.default.existsSync(dirPath)) {
		var files = _fs2.default.readdirSync(dirPath);
		var count = files.length;
		var check = function check(decrement) {
			decrement && count--;
			if (count <= 0) {
				_fs2.default.rmdir(dirPath, function (err) {
					if (err) {
						onDeleteDir(err);
					} else {
						onDeleteDir(null, dirPath);
					}
				});
			}
		};
		check();
		files.forEach(function (file) {
			var filePath = dirPath + "/" + file;
			if (_fs2.default.statSync(filePath).isDirectory()) {
				// delete dir recuresively
				_deleteDir(filePath, function (err, dPath) {
					onDeleteDir(err, dPath);
					if (!err && dPath === filePath) {
						check(true);
					}
				}, onDeleteFile);
			} else {
				// delete file
				_fs2.default.unlink(filePath, function (err) {
					if (err) {
						onDeleteFile(err);
					} else {
						onDeleteFile(null, filePath);
						check(true);
					}
				});
			}
		});
	} else {
		onDeleteDir(dirPath + " does not exist");
	}
};

var _createDirs = function _createDirs(dirPath, onCreateDir) {
	onCreateDir = onCreateDir || function () {};
	var createDir = function createDir(dir) {
		if (!_fs2.default.existsSync(dir)) {
			_fs2.default.mkdirSync(dir);
			onCreateDir(null, dir);
		}
	};
	var dirArr = dirPath.split('/');
	var currDir = '';
	try {
		dirArr.forEach(function (dir, idx) {
			if (dir === '.') {
				currDir += dir + '/';
			} else if (dir === '..') {
				currDir += dir + '/';
			} else if (dir === '') {
				currDir += '/' + dir;
			} else {
				currDir += dir;
				if (idx < dirArr.length - 1) {
					currDir += '/';
				}
				createDir(currDir);
			}
		});
	} catch (err) {
		onCreateDir(err);
	}
};

function getExtension(filePath) {
	var i = filePath.lastIndexOf('.');
	return i < 0 ? '' : filePath.substr(i + 1);
}

function copyFile(src, dest, onCopy) {
	var rd = _fs2.default.createReadStream(src);
	rd.on("error", function (err) {
		onCopy(err);
	});
	var wr = _fs2.default.createWriteStream(dest);
	wr.on("error", function (err) {
		onCopy(err);
	});
	wr.on("close", function (err) {
		onCopy(err);
	});
	rd.pipe(wr);
}

function copyDir(src, dest, onCopy, onCopyDir, onCopyFile) {
	onCopy = onCopy || function () {};
	onCopyDir = onCopyDir || function () {};
	onCopyFile = onCopyFile || function () {};
	_copyDir(src, dest, function (err, _src, _dest) {
		if (err) {
			onCopy(err);
		} else {
			onCopyDir(null, _src, _dest);
			if (dest === _dest) {
				onCopy(null, src, dest);
			}
		}
	}, onCopyFile);
}

function deleteDir(dirPath, onDelete, onDeleteDir, onDeleteFile) {
	onDelete = onDelete || function () {};
	onDeleteDir = onDeleteDir || function () {};
	onDeleteFile = onDeleteFile || function () {};
	_deleteDir(dirPath, function (err, deletedDir) {
		if (err) {
			onDelete(err);
		} else {
			onDeleteDir(null, deletedDir);
			if (deletedDir === dirPath) {
				onDelete(null, deletedDir);
			}
		}
	}, onDeleteFile);
}

function createDirs(dirPath, onComplete, onCreateDir) {
	onComplete = onComplete || function () {};
	onCreateDir = onCreateDir || function () {};
	if (_fs2.default.existsSync(dirPath)) {
		onComplete(null, dirPath);
	} else {
		_createDirs(dirPath, function (err, createdDir) {
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
