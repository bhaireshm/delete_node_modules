const fs = require("fs");
const path = require("path");
const readline = require("readline");
const rimraf = require("rimraf");

const fileName = "deleteAll.js";
var directories, startedAt, rl;

readLine();

function readLine() {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("\nEnter Complete path (Enter to select currentpath): ", (userEnterdPath) => {
    userEnterdPath = userEnterdPath.replace(/"/g, "");
    userEnterdPath = userEnterdPath.split(",");
    console.log("Path: ", userEnterdPath);
    directories = userEnterdPath;
    startedAt = Date.now();
    console.info("Note: Don't close the the terminal.");
    console.info("Process started please wait...");

    // readFolderAndDelete(directories); // with logs
    deleteAllData(directories);

    rl.close();
  });
}

function deleteAllData(directories) {
  try {
    directories.forEach((directory, i) => {
      console.log("inside loop", directory);

      const folders = fs.readdirSync(directory);
      folders.forEach((folder) => {
        const p = path.join(directory, folder);
        rimraf(p, function (err) {
          if (err) console.error(err);
          // console.info("Deleted: ", p);
          completedLog(p, directories.length, i);
        });
      });
    });
  } catch (error) {
    console.error(error);
  }
}

function readFolderAndDelete(dir) {
  const folders = fs.readdirSync(dir);
  folders.forEach((f) => {
    try {
      f = path.join(dir, f);
      if (fs.lstatSync(f).isDirectory()) readFolderAndDelete(f);
      else {
        if (!f.includes(fileName)) fs.unlinkSync(f);
      }
      fs.rmdirSync(f, { recursive: true, retryDelay: 5 });
      console.info("[Deleted] ", f);
    } catch (error) {
      console.error(error);
    }
  });
  completedLog();
}

function completedLog(p = directories, totLen = 0, len = 0) {
  console.info(`\nAll data deleted in "${p}" path.`);
  // process.exit(-1);

  console.log({ totLen, len });

  if (len > 0 && totLen == len) {
    const elapsedTime = Math.floor((Date.now() - startedAt) / 1000) + "s";
    console.log("Elapsed time", elapsedTime);

    if (rl) rl.close();
    rl = null;

    // restart
    readLine();
  }
}
