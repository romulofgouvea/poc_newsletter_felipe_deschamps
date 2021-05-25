import fs from "fs";
import path from "path";
import _ from "lodash";
import { format } from 'date-fns';

import archiver from "archiver";

import { constants } from "~/config";

const SOURCE_DIR = constants.BASE_DIR + "/src";

const removeBase = source => {
    return source.replace(/.*src/g, "").replace(/\\\\|\\|\/|\/\//g, "/");
}

function getSourceDir(source) {
    if (!source) throw "Source is empty";
    source = removeBase(source);
    return path.join(SOURCE_DIR, source);
}

const getNameFile = source => {
    return removeBase(source).replace(/.+[/|//|\\|\\\\]/g, "");
}

const getMidNamePath = source => {
    source = removeBase(source);
    return source.replace(/.[^/|//|\\|\\\\]+(?=\/$|$)/g, "");
}

const getNameFolder = () => {
    var wordsUsed = loadFile("/assets/text", "wordsUsed.txt");
    const day = format(new Date(), 'DD-MM');
    return `[${day}] Video ${wordsUsed.length / 10}`;
}

function existsFile(source, nameFile = "") {
    var localUrl = "";
    if (!nameFile) {
        localUrl = getSourceDir(source);
        source = getMidNamePath(source);
        nameFile = getNameFile(localUrl);
    } else {
        localUrl = `${getSourceDir(source)}/${nameFile}`;
    }
    return fs.existsSync(localUrl) ? `${source}/${nameFile}` : "";
}

const readFile = (source, nameFile) => {
    try {
        if (!existsFile(source, nameFile)) throw "File not exists";

        var localUrl = `${getSourceDir(source)}/${nameFile}`;
        return fs.readFileSync(localUrl);
    } catch (error) {
        return [];
    }
};


const loadFile = (source, nameFile) => {
    try {
        if (!existsFile(source, nameFile)) throw "File not exists";

        var localUrl = `${getSourceDir(source)}/${nameFile}`;
        var arch = fs
            .readFileSync(localUrl, "utf8")
            .toString()
            .replace(/\r/g, "")
            .split("\n");
        return _.compact(arch);
    } catch (error) {
        return "";
    }
};

const loadFileJson = (source, nameFile) => {
    try {
        var localUrl = `${getSourceDir(source)}/${nameFile}.json`;
        if (!existsFile(localUrl)) throw "File not exists";
        return JSON.parse(fs.readFileSync(localUrl, "utf8"));
    } catch (error) {
        // console.log(error);
        return "";
    }
};

const appendFile = (source, nameFile, data) => {
    try {
        var localUrl = `${getSourceDir(source)}/${nameFile}`;
        fs.appendFile(localUrl, data, err => {
            if (err) throw err;
        });
        return existsFile(localUrl);
    } catch (error) {
        return "";
    }
};

function renameFile(source, newSource) {
    source = getSourceDir(source);
    newSource = getSourceDir(newSource);

    if (!this.existsFile(source)) throw "File not exists";

    new Promise(async (resolve, reject) => {
        await fs.rename(source, newSource, err => {
            if (err) reject(err);
        });
        resolve();
    });

    return true;
}

function moveFile(source, newSource, callback) {
    source = getSourceDir(source);
    newSource = getSourceDir(newSource);
    if (!existsFile(source)) throw "File not exists";

    var readStream = fs.createReadStream(source);
    var writeStream = fs.createWriteStream(newSource);

    readStream.on("error", callback);
    writeStream.on("error", callback);

    readStream.on("close", () => {
        fs.unlink(source, callback);
    });

    readStream.pipe(writeStream);
    return existsFile(newSource);
}

const writeFileSync = (source, nameFile, data) => {
    try {
        var localUrl = `${getSourceDir(source)}/${nameFile}`;

        createFolder(localUrl);

        fs.writeFileSync(localUrl, data, err => {
            if (err) throw err;
        });
        return existsFile(source, nameFile);
    } catch (error) {
        console.log(error);
        return "";
    }
};

const writeFileJson = (source, nameFile, data) => {
    try {
        var localUrl = `${getSourceDir(source)}/${nameFile}.json`;
        writeFileSync(localUrl, JSON.stringify(data));
        return existsFile(localUrl);
    } catch (error) {
        console.log(error);
        return "";
    }
};

const writeFileMP3 = async (source, nameFile, data) => {
    try {
        var localUrl = `${getSourceDir(source)}/${nameFile}.mp3`;
        writeFileSync(localUrl, data);
        return existsFile(localUrl);
    } catch (error) {
        return "";
    }
};

const writeFileStream = async (source, nameFile) => {
    try {
        var localUrl = `${getSourceDir(source)}/${nameFile}`;
        fs.createWriteStream(localUrl);
        return existsFile(localUrl);
    } catch (error) {
        return "";
    }
};

const deleteArchive = (source, nameFile = "") => {
    try {
        source = getSourceDir(source);
        var localUrl = !nameFile ? source : `${source}/${nameFile}`;
        var exists = existsFile(localUrl);
        if (!exists) {
            throw "File not exists";
        }
        fs.unlink(localUrl, err => {
            if (err) console.log("deleteArchive: ", err);
            //console.log("Removed : ", exists);
        });
        return exists;
    } catch (error) {
        console.log("deleteArchive: ", error);
        return "";
    }
};

const removeGroupFiles = group => {
    for (var gp of group) {
        const source = getSourceDir(gp);
        deleteArchive(source);
    }
}

function getDirectoriesCB(pathFolder, callback) {
    fs.readdir(pathFolder, function (err, content) {
        if (err) return callback(err)
        callback(null, content)
    })
}

const listFilesDir = (source, filterExt = "") => {
    try {
        source = getSourceDir(source);
        var files = fs.readdirSync(source, err => { if (err) throw err })

        return files.map(f => {
            var ext = f.replace(/.+\./g, "");
            if (ext === filterExt) {
                return `${source}/${f}`
            }
        }).filter(Boolean);
    } catch (error) {
        console.log("listFilesDir: ", error);
        return "";
    }
}

const createFolder = source => {
    try {
        var arrSource = removeBase(source).split('/');
        return arrSource.reduce((ac, value) => {
            var val = path.extname(value) ? "" : "\\" + value;
            var temp = `${ac}${val}`;
            var url = getSourceDir(temp);
            if (!fs.existsSync(url)) {
                fs.mkdirSync(url);
            }
            return temp;
        });
    } catch (error) {
        return "";
    }
};

const zipFolder = (source, output) => {
    source = getSourceDir(source)
    output = getSourceDir(output)

    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(output);

    return new Promise((resolve, reject) => {
        archive
            .directory(source, false)
            .on('error', err => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve(existsFile(output)));
        archive.finalize();
    });
}

const copyOrDeleteFolderByExt = (source, ext, newSource, deleteFiles = false) => {
    listFilesDir(source, ext).map(data => {
        if (deleteFiles)
            deleteArchive(data);
        else {
            var nameFile = getNameFile(data);
            var urlFolder = createFolder(newSource);
            moveFile(data, `${urlFolder}/${nameFile}`, arr => arr !== null && console.log("copyOrDeleteFolderByExt: ", arr));
        }
    })
}

const deleteFolder = (source, ext = "") => {
    try {
        fs.rmdirSync(source, { recursive: true });

        console.log(`${source} is deleted!`);
    } catch (err) {
        console.error(`Error while deleting ${source}.`);
    }
}

const copyOrDeleteFilesbyArr = (source, arrData, deleteFiles = false) => {
    if (deleteFiles) {
        removeGroupFiles(arrData)
    } else {
        arrData.map(data => {
            if (existsFile(data)) {
                var nameFile = getNameFile(data);
                var urlFolder = createFolder(source);
                moveFile(data, `${urlFolder}/${nameFile}`, arr => arr);
            }
        })
    }
}

module.exports = {
    getDirectoriesCB,
    readFile,
    loadFile,
    loadFileJson,
    writeFileSync,
    writeFileJson,
    writeFileMP3,
    writeFileStream,
    appendFile,
    renameFile,
    deleteArchive,
    deleteFolder,
    moveFile,
    existsFile,
    getSourceDir,
    removeGroupFiles,
    listFilesDir,
    getNameFile,
    createFolder,
    zipFolder,
    copyOrDeleteFolderByExt,
    getNameFolder,
    copyOrDeleteFilesbyArr
};