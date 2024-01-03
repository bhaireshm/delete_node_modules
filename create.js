const fs = require("fs");
const l = 10000;
var c =
  "The first parameter will be interpreted as a globbing pattern for files. If you want to disable globbing you can do so with opts.disableGlob (defaults to false). This might be handy, for instance, if you have filenames that contain globbing wildcard characters";
var p = "C:\\Users\\bhair\\Desktop\\New folder\\";

for (let i = 0; i < l; i++) {
  fs.writeFileSync(p + `log${i}.txt`, c);
}
