import * as fs from 'fs';
import * as path from 'path';
import { exit } from 'process';
import * as readline from 'readline';
import { log, logError, logFolderDeleted, logStatus } from "./log";

const currentNodeModulePath = path.resolve(__dirname, 'node_modules');
const deleteFolderName = 'node_modules';
let isDeleteAll = false;

function askUser() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    '\n[0] Exit\n[1] Delete only node_modules folders\n[2] Delete all data\n\nEnter option number: ',
    (option) => {
      rl.close();
      if (option === '2') {
        isDeleteAll = true;
        log("\nNote: Don't close the terminal.");
        log('Process started please wait...');
        readLine();
      } else if (option === '1') {
        readLine();
      } else if (option === '0') {
        log('Application stopped.');
        exit(0);
      } else {
        logError('Invalid option');
        askUser();
      }
    }
  );
}

function readLine() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    '\nEnter complete path (Enter 0 to stop, Enter 1 to restart): ',
    (userEnteredPath) => {
      rl.close();

      if (userEnteredPath === '' || userEnteredPath === '\n') {
        log('Invalid input. Please enter a valid path.');
        readLine();
        return;
      }

      if (userEnteredPath === '0') {
        log('Application stopped.');
        exit(0);
      }

      if (userEnteredPath === '1') {
        askUser();
        return;
      }

      log('Process started...');
      const start = Date.now();

      processPath(userEnteredPath)
        .then(() => {
          logStatus({
            elapsedTime: `${(Date.now() - start) / 1000}s`,
            status: 'completed',
            path: userEnteredPath
          });
        })
        .catch((error) => {
          logStatus({
            elapsedTime: `${(Date.now() - start) / 1000}s`,
            status: 'failed',
            path: userEnteredPath
          });
          logError(error?.message || error);
        })
        .finally(() => {
          readLine();
        });
    }
  );
}

async function processPath(userEnteredPath: string) {
  const paths = userEnteredPath.split(',').map(p => p.trim().replace(/"/g, ''));

  for (const uep of paths) {
    try {
      if (!await exists(uep)) {
        log("Path not found");
        return;
      }

      const stats = await fs.promises.lstat(uep);
      if (!stats.isDirectory()) {
        log('Path not found / Empty Path.');
        return;
      }

      if (isDeleteAll) await deleteAllData(uep);
      else await deleteNodeModules(uep);

    } catch (error: any) {
      logError(error);
    }
  }
}

async function deleteAllData(dir: string) {
  try {
    const directories = await fs.promises.readdir(dir);
    for (const directory of directories) {
      const fullPath = path.join(dir, directory);
      await rimrafPromise(fullPath);
      logFolderDeleted(fullPath);
    }
  } catch (error) {
    console.error(error);
  }
}

async function deleteNodeModules(dir: string) {
  const directories = await fs.promises.readdir(dir);
  for (const directory of directories) {
    const fullPath = path.join(dir, directory);
    const nodeModulesPath = path.join(fullPath, deleteFolderName);

    if (await exists(nodeModulesPath) && fullPath !== currentNodeModulePath) {
      await rimrafPromise(nodeModulesPath);
      logFolderDeleted(nodeModulesPath);
    }
    if ((await fs.promises.lstat(fullPath)).isDirectory()) {
      await deleteNodeModules(fullPath);
    }
  }
}

function rimrafPromise(dir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.rm(dir, { recursive: true, force: true }, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function exists(path: string) {
  try {
    await fs.promises.access(path);
    return true;
  } catch {
    return false;
  }
}

askUser();
