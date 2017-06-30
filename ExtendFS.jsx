import fs from 'fs';

const _copyDir = (src, dest, onCopyDir, onCopyFile) => {
	onCopyFile = onCopyFile || (() => {});
	onCopyDir = onCopyDir || (() => {});
	if (fs.existsSync(src)) {
		fs.mkdir(dest, (err) => {
			if (err) {
				onCopyDir(err);
			} else {
				let rsrc = fs.realpathSync(src);
				let rdest = fs.realpathSync(dest);
				if (rdest.substr(0, rsrc.length) === rsrc) {
					deleteDir(rdest, (err, deletedDir) => {
						if (err) {
							onCopyDir(err);
						}
					});
					onCopyDir('Copying to a sub directory is not allowed');
				} else {
					fs.readdir(src, (err, files) => {
						if (err) {
							onCopyDir(err);
						} else {
							let count = files.length;
							let check = (decrement) => {
								decrement && count--;
								if (count <= 0) {
									onCopyDir(null, src, dest);
								}
							};
							check();
							files.forEach((file) => {
								let sf = src + "/" + file;
								let df = dest + "/" + file;
								if (fs.statSync(sf).isDirectory()) {// copy dir recuresively
									_copyDir(sf, df, (err, sd, dd) => {
										onCopyDir(err, sd, dd);
										if (!err && sf === sd && df === dd) {
											check(true);
										}
									}, onCopyFile);
								} else {
									copyFile(sf, df, (err) => {
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

const _deleteDir = (dirPath, onDeleteDir, onDeleteFile) => {
	onDeleteDir = onDeleteDir || (() => {});
	onDeleteFile = onDeleteFile || (() => {});
	if (fs.existsSync(dirPath)) {
		let files = fs.readdirSync(dirPath);
		let count = files.length;
		let check = (decrement) => {
			decrement && count--;
			if (count <= 0) {
				fs.rmdir(dirPath, (err) => {
					if (err) {
						onDeleteDir(err);
					} else {
						onDeleteDir(null, dirPath);
					}
				});
			}
		};
		check();
		files.forEach((file) => {
				let filePath = dirPath + "/" + file;
				if (fs.statSync(filePath).isDirectory()) {// delete dir recuresively
					_deleteDir(filePath, (err, dPath) => {
						onDeleteDir(err, dPath);
						if (!err && dPath === filePath) {
							check(true);
						}
					}, onDeleteFile);
				} else { // delete file
					fs.unlink(filePath, (err) => {
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

const _createDirs = (dirPath, onCreateDir) => {
	onCreateDir = onCreateDir || (() => {});
	let createDir = (dir) => {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
			onCreateDir(null, dir);
		}
	};
	let dirArr = dirPath.split('/');
	let currDir = '';
	try {
		dirArr.forEach((dir, idx) => {
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

export function getExtension(filePath) {
	let i = filePath.lastIndexOf('.');
	return (i < 0) ? '' : filePath.substr(i + 1);
}

export function copyFile(src, dest, onCopy) {
	let rd = fs.createReadStream(src);
	rd.on("error", (err) => {
		onCopy(err);
	});
	let wr = fs.createWriteStream(dest);
	wr.on("error", (err) => {
		onCopy(err);
	});
	wr.on("close", (err) => {
		onCopy(err);
	});
	rd.pipe(wr);
}

export function copyDir(src, dest, onCopy, onCopyDir, onCopyFile) {
	onCopy = onCopy || (() => {});
	onCopyDir = onCopyDir || (() => {});
	onCopyFile = onCopyFile || (() => {});
	_copyDir(src, dest, (err, _src, _dest) => {
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

export function deleteDir(dirPath, onDelete, onDeleteDir, onDeleteFile) {
	onDelete = onDelete || (() => {});
	onDeleteDir = onDeleteDir || (() => {});
	onDeleteFile = onDeleteFile || (() => {});
	_deleteDir(dirPath, (err, deletedDir) => {
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

export function createDirs(dirPath, onComplete, onCreateDir) {
	onComplete = onComplete || (() => {});
	onCreateDir = onCreateDir || (() => {});
	if (fs.existsSync(dirPath)) {
		onComplete(null, dirPath);
	} else {
		_createDirs(dirPath, (err, createdDir) => {
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
