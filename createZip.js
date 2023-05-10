const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { exec } = require('child_process');

const manifest = require('./manifest.json'); // Import the manifest file
const gitignorePath = path.join(__dirname, '.gitignore');
const outputPath = path.join(__dirname, `better-sensibull-v${manifest.version}.zip`); // Include version number in the filename

const isIgnored = (filepath) => {
  if (filepath === 'backgroundBundle.js') {
    return false;
  }

  if (filepath.startsWith('node_modules/') || filepath.startsWith('.git/')) {
    return true;
  }

  const gitignore = fs.readFileSync(gitignorePath, 'utf8');
  const ignorePatterns = gitignore.split('\n').filter((line) => line.trim() !== '' && !line.startsWith('#'));

  return ignorePatterns.some((pattern) => new RegExp(`^${pattern.replace('*', '.*')}$`).test(filepath));
};

const addDirectoryToArchive = (dirPath, archive) => {
  const items = fs.readdirSync(dirPath);
  items.forEach((item) => {
    const itemPath = path.join(dirPath, item);
    const itemName = path.relative(__dirname, itemPath);

    if (!isIgnored(itemName)) {
      if (fs.lstatSync(itemPath).isDirectory()) {
        addDirectoryToArchive(itemPath, archive);
      } else {
        archive.file(itemPath, { name: itemName });
      }
    }
  });
};

const runBrowserify = () => {
  return new Promise((resolve, reject) => {
    exec('npx browserify background.js -o backgroundBundle.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running Browserify: ${error}`);
        reject(error);
      } else {
        console.log('Browserify completed successfully.');
        resolve();
      }
    });
  });
};

const createZip = async () => {
  await runBrowserify();

  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Sets the compression level.
  });

  output.on('close', () => {
    console.log(`Extension has been zipped to ${outputPath}. Total size: ${archive.pointer()} bytes.`);
  });

  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn(err);
    } else {
      throw err;
    }
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  addDirectoryToArchive(__dirname, archive);

  archive.finalize();
};

createZip();