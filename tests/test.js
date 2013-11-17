console.log('Testing ExtendFS.js');

var fs = require("../ExtendFS.js");

var currPath = __dirname + "/";

var testCase1 = function() {
  console.log('Test Case #1');
  fs.copyFile(currPath + 'css/styles.css', currPath + 'css/_styles.css', function(err) {
    if (err) {
      console.log(err);
    } else {
      if (fs.existsSync(currPath + 'css/_styles.css')) {
        fs.unlinkSync(currPath + 'css/_styles.css');
        console.log('SUCCESS!');
        testCase2();
      } else {
        console.log('FAILED');
      }
    }
  });
}();

var testCase2 = function() {
  console.log('Test Case #2');
  var numOfCopiedDirs = 0;
  var numOfCopiedFiles = 0;
  fs.copyDir(currPath + 'js', currPath + '_js', function(err, sd, dd) {
    if (err) {
      console.log(err);
    } else {
      if (fs.existsSync(currPath + '_js') && numOfCopiedFiles === 11 && numOfCopiedDirs === 3) {
        console.log('SUCCESS!');
        testCase3();
      } else {
        console.log('FAILED');
      }
    }
  }, function(err, sd, dd) {
    if (err) {
      console.log(err);
    } else {
      numOfCopiedDirs++;
    }
  }, function(err, sf, df) {
    if (err) {
      console.log(err);
    } else {
      numOfCopiedFiles++;
    }
  });
};

var testCase3 = function() {
  console.log('Test Case #3');
  var numOfDeletedDirs = 0;
  var numOfDeletedFiles = 0;
  fs.deleteDir(currPath + '_js', function(err, dirPath) {
    if (err) {
      console.log(err);
    } else {
      if (!fs.existsSync(currPath + '_js') && numOfDeletedFiles === 11 && numOfDeletedDirs === 3) {
        console.log('SUCCESS!');
        testCase4();
      } else {
        console.log('FAILED');
      }
    }
  }, function(err, deletedDir) {
    if (err) {
      console.log(err);
    } else {
      numOfDeletedDirs++;
    }
  }, function(err, deletedFile) {
    if (err) {
      console.log(err);
    } else {
      numOfDeletedFiles++;
    }
  });
};

var testCase4 = function() {
  console.log('Test Case #4');
  fs.deleteDir('nodir', function(err, dirPath) {
    if (err) {
      console.log('SUCCESS!');
      testCase5();
    } else {
      console.log('FAILED');
    }
  });
};

var testCase5 = function() {
  console.log('Test Case #5');
  fs.copyDir('nosrcdir', 'dest', function(err, sd, dd) {
    if (err) {
      console.log('SUCCESS!');
      testCase6();
    } else {
      console.log('FAILED');
    }
  });
};

var testCase6 = function() {
  console.log('Test Case #6');
  fs.copyDir(currPath + 'js', currPath + 'js/test', function(err, sd, dd) {
    if (err) {
      console.log('SUCCESS!');
      testCase7();
    } else {
      console.log('FAILED');
    }
  });
};

var testCase7 = function() {
  console.log('Test Case #7');

  var success = true;

  var testArr = [
    'test1/test2/test3/test4',
    'test1/test2/test3/test4/',
    './test1/test2/test3/test4',
    '../test1/test2/test3/test4',
    '../../test1/test2/test3/test4',
    '/test1/test2/test3/test4',
    '/test1/test2//test3/test4'
  ];

  var idx = 0;
  var test = function(index) {
    var num = 0;
    var dirPath = testArr[index];
    fs.deleteDir(dirPath.substr(0, dirPath.indexOf('test2')), function(err, deletedDir) {
      fs.createDirs(dirPath, function(err, createdDir) {
        if (err) {
          console.log(err);
        } else {
          if (createdDir === dirPath && num === 4) {
            fs.deleteDir(dirPath.substr(0, dirPath.indexOf('test2')), function(err) {
              if (err) {
                console.log(err);
                success = false;
              }
              if (idx >= (testArr.length - 1)) {
                if (success) {
                  console.log('SUCCESS!');
                } else {
                  console.log('FAILED');
                }
              } else {
                test(++idx);
              }
            });
          } else {
            success = false;
          }
        }
      }, function(err, createdDir) {
        num++;
      });
    });
  };
  test(idx);
};

