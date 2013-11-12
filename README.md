ExtendFS
========
A module to extend Node's default File System (fs) module to recursively copy/delete directories with callbacks to notify the caller upon each successful copy/delete of a file or directory and upon completion of the whole process.


Example:

```
var fs = require("ExtendFS");

var fileExtension = fs.getExtension(filePath);

fs.copyFile(src, dest, onCopy);

fs.copyDir(src, dest, onCopy, onCopyDir, onCopyFile);

fs.deleteDir(dirPath, onDelete, onDeleteDir, onDeleteFile);

fs.createDirs(dirPath, onComplete, onCreateDir);
```