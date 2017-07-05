var assert = require('assert');
var xfs = require("../ExtendFS.js");

var currPath = __dirname + "/";

describe('ExtendFS', function () {

	describe('#copyFile(src, dest, onCopy)', function () {
		it('css/_styles.css should exist', function (done) {
			xfs.copyFile(currPath + 'css/styles.css', currPath + 'css/_styles.css', function (err) {
				if (err) {
					done(err);
				} else {
					if (xfs.existsSync(currPath + 'css/_styles.css')) {
						xfs.unlinkSync(currPath + 'css/_styles.css');
						done();
					} else {
						done(currPath + 'css/_styles.css does not exist');
					}
				}
			});
		});
	});

	describe('#copyDir(src, dest, onCopy, onCopyDir, onCopyFile)', function () {
		it('should copy directory from ' + currPath + 'js to ' + currPath + '_js', function (done) {
			var numOfCopiedDirs = 0;
			var numOfCopiedFiles = 0;
			xfs.copyDir(currPath + 'js', currPath + '_js',
				function (err, sd, dd) {
					if (err) {
						done(err);
					} else {
						if (xfs.existsSync(currPath + '_js') && numOfCopiedFiles === 11 && numOfCopiedDirs === 3) {
							done();
						} else {
							done(currPath + '_js does not exist');
						}
					}
				}, function (err, sd, dd) {
					if (err) {
						done(err);
					} else {
						numOfCopiedDirs++;
					}
				}, function (err, sf, df) {
					if (err) {
						done(err);
					} else {
						numOfCopiedFiles++;
					}
				});
		});
	});

	describe('#copyDir(src, dest, onCopy, onCopyDir, onCopyFile)', function () {
		it('should throw an error', function (done) {
			xfs.copyDir('nosrcdir', 'dest',
				function (err, dirPath) {
					if (err) {
						done();
					} else {
						done('no error was thrown');
					}
				});
		});
	});

	describe('#copyDir(src, dest, onCopy, onCopyDir, onCopyFile)', function () {
		it('should throw an error', function (done) {
			xfs.copyDir(currPath + 'js', currPath + 'js/test',
				function (err, dirPath) {
					if (err) {
						done();
					} else {
						done('no error was thrown');
					}
				});
		});
	});

	describe('#deleteDir(dirPath, onDelete, onDeleteDir, onDeleteFile)', function () {
		it('should delete ' + currPath + '_js directory and its subdirectories',
			function (done) {
				var numOfDeletedDirs = 0;
				var numOfDeletedFiles = 0;
				xfs.deleteDir(currPath + '_js', function (err, dirPath) {
					if (err) {
						done(err);
					} else {
						if (!xfs.existsSync(currPath + '_js') && numOfDeletedFiles === 11 && numOfDeletedDirs === 3) {
							done();
						} else {
							done(currPath + '_js does not exist');
						}
					}
				}, function (err, deletedDir) {
					if (err) {
						done(err);
					} else {
						numOfDeletedDirs++;
					}
				}, function (err, deletedFile) {
					if (err) {
						done(err);
					} else {
						numOfDeletedFiles++;
					}
				});
			});
	});

	describe('#deleteDir(dirPath, onDelete, onDeleteDir, onDeleteFile)', function () {
		it('should throw an error', function (done) {
			xfs.deleteDir('nodir',
				function (err, dirPath) {
					if (err) {
						done();
					} else {
						done('no error was thrown');
					}
				});
		});
	});

	describe('#createDirs(dirPath, onComplete, onCreateDir)', function () {
		it('should create directories recursively', function (done) {
			var success = true;

			var testArr = [
				'test1/test2/test3/test4',
				'test1/test2/test3/test4/',
				'./test1/test2/test3/test4',
				'../test1/test2/test3/test4',
				'../../test1/test2/test3/test4'
			];

			var idx = 0;
			var test = function (index) {
				var num = 0;
				var dirPath = testArr[index];
				xfs.deleteDir(dirPath.substr(0, dirPath.indexOf('test2')),
					function (err1, deletedDir) {
						xfs.createDirs(dirPath,
							function (err2, createdDir) {
								if (err2) {
									done(err2);
								} else {
									if (createdDir === dirPath && num === 4) {
										xfs.deleteDir(dirPath.substr(0, dirPath.indexOf('test2')),
											function (err) {
												if (err) {
													done(err);
													success = false;
												}
												if (idx >= (testArr.length - 1)) {
													if (success) {
														done();
													} else {
														done('couldn\'t delete ' + dirPath);
													}
												} else {
													test(++idx);
												}
											});
									} else {
										success = false;
									}
								}
							},
							function (err, createdDir) {
								num++;
							});
					});
			};
			test(idx);
		});
	});

});
