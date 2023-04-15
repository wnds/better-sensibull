const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const gitignorePath = path.join(__dirname, '.gitignore');
const outputPath = path.join(__dirname, 'extension.zip');

const isIgnored = (filename) => {
    if (filename === 'backgroundBundle.js') {
        return false;
    }

    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    const ignorePatterns = gitignore.split('\n').filter((line) => line.trim() !== '' && !line.startsWith('#'));

    return ignorePatterns.some((pattern) => new RegExp(`^${pattern.replace('*', '.*')}$`).test(filename));
};


const createZip = () => {
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

    fs.readdirSync(__dirname).forEach((file) => {
        if (!isIgnored(file) && file !== 'extension.zip') {
            if (fs.lstatSync(file).isDirectory()) {
                archive.directory(file, file);
            } else {
                archive.file(file, { name: file });
            }
        }
    });

    archive.finalize();
};

createZip();
