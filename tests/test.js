console.log('Testing ExtendFS.js');

var fs = require("../ExtendFS.js");

var testCase1 = function() {
  console.log('Test Case #1');
  fs.copyFile('css/styles.css', 'css/_styles.css', function(err) {
    if (err) {
      console.log(err);
    } else {
      if (fs.existsSync('css/_styles.css')) {
        fs.unlinkSync('css/_styles.css');
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
  fs.copyDir('js', '_js', function(err, sd, dd) {
    if (err) {
      console.log(err);
    } else {
      if (fs.existsSync('_js') && numOfCopiedFiles === 11 && numOfCopiedDirs === 3) {
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
  fs.deleteDir('_js', function(err, dirPath) {
    if (err) {
      console.log(err);
    } else {
      if (!fs.existsSync('_js') && numOfDeletedFiles === 11 && numOfDeletedDirs === 3) {
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
    } else {
      console.log('FAILED');
    }
  });
};

