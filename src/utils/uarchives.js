import fs from "fs";
import path from "path";
import _ from "lodash";
import { format } from 'date-fns';

import archiver from "archiver";

import { constants } from "../../config";

const BASE_URL = constants.BASE_URL;

const removeBase = source => {
    return source.replace(/.*src/g, "").replace(/\\\\|\\|\/|\/\//g, "/");
}

function getBaseUrl(source) {
    if (!source) throw "Source is empty";
    source = removeBase(source);
    return path.join(BASE_URL, source);
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
        localUrl = getBaseUrl(source);
        source = getMidNamePath(source);
        nameFile = getNameFile(localUrl);
    } else {
        localUrl = `${getBaseUrl(source)}/${nameFile}`;
    }
    return fs.existsSync(localUrl) ? `${source}/${nameFile}` : "";
}

const readFile = (source, nameFile) => {
    try {
        if (!existsFile(source, nameFile)) throw "File not exists";

        var localUrl = `${getBaseUrl(source)}/${nameFile}`;
        return fs.readFileSync(localUrl);
    } catch (error) {
        return [];
    }
};


const loadFile = (source, nameFile) => {
    try {
        if (!existsFile(source, nameFile)) throw "File not exists";

        var localUrl = `${getBaseUrl(source)}/${nameFile}`;
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
        var localUrl = `${getBaseUrl(source)}/${nameFile}.json`;
        if (!existsFile(localUrl)) throw "File not exists";
        return JSON.parse(fs.readFileSync(localUrl, "utf8"));
    } catch (error) {
        // console.log(error);
        return "";
    }
};

const appendFile = (source, nameFile, data) => {
    try {
        var localUrl = `${getBaseUrl(source)}/${nameFile}`;
        fs.appendFile(localUrl, data, err => {
            if (err) throw err;
        });
        return existsFile(localUrl);
    } catch (error) {
        return "";
    }
};

function renameFile(source, newSource) {
    source = getBaseUrl(source);
    newSource = getBaseUrl(newSource);

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
    source = getBaseUrl(source);
    newSource = getBaseUrl(newSource);
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
        var localUrl = `${getBaseUrl(source)}/${nameFile}`;

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
        var localUrl = `${getBaseUrl(source)}/${nameFile}.json`;
        writeFileSync(localUrl, JSON.stringify(data));
        return existsFile(localUrl);
    } catch (error) {
        console.log(error);
        return "";
    }
};

const writeFileMP3 = async (source, nameFile, data) => {
    try {
        var localUrl = `${getBaseUrl(source)}/${nameFile}.mp3`;
        writeFileSync(localUrl, data);
        return existsFile(localUrl);
    } catch (error) {
        return "";
    }
};

const writeFileStream = async (source, nameFile) => {
    try {
        var localUrl = `${getBaseUrl(source)}/${nameFile}`;
        fs.createWriteStream(localUrl);
        return existsFile(localUrl);
    } catch (error) {
        return "";
    }
};

const deleteArchive = (source, nameFile = "") => {
    try {
        source = getBaseUrl(source);
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
        const source = getBaseUrl(gp);
        deleteArchive(source);
    }
}

const listFilesDir = (source, filterExt = "") => {
    try {
        source = getBaseUrl(source);
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
        var t = arrSource.reduce((ac, value) => {
            var val = path.extname(value) ? "" : "\\" + value;
            var temp = `${ac}${val}`;
            var url = getBaseUrl(temp);
            if (!fs.existsSync(url)) {
                fs.mkdirSync(url);
            }
            return temp;
        });
        return t;
    } catch (error) {
        //console.log(error);
        return "";
    }
};

const zipFolder = (source, output) => {
    source = getBaseUrl(source)
    output = getBaseUrl(output)

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
    moveFile,
    existsFile,
    getBaseUrl,
    removeGroupFiles,
    listFilesDir,
    getNameFile,
    createFolder,
    zipFolder,
    copyOrDeleteFolderByExt,
    getNameFolder,
    copyOrDeleteFilesbyArr
};