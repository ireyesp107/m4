const fs = require('fs');
const path = require('path');
const serialization = require('../util/serialization');
const id = require('../util/id');


// Define the base directory to keep my store
const baseDir = path.join(__dirname, '..', 'localStore');
if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
}

function transformToAlphanumeric(key) {
    return key.replace(/[^a-z0-9]/gi, '_');
}

const store = {
    put: (object, key, callback) => {
        const formattedKey = transformToAlphanumeric(key !== null ? key : id.getID(object));
        const filePath = path.join(baseDir, `${formattedKey}.json`);

        const serializedObject = serialization.serialize(object);

        fs.writeFile(filePath, serializedObject, (err) => {
            callback(err, object);
        });
    },

    get: (key, callback) => {
        //this is the case in which user does not input a key
        if (key === null) {
            fs.readdir(baseDir, (err, files) => {
                if (err) {
                    callback(err, null);
                    return;
                }
                let returnKeys =[]
                files.forEach(file=> {
                    returnKeys.push(transformToAlphanumeric(path.basename(file, '.json')))
                });
                callback(null, returnKeys);
            });
        } else {
            const formattedKey = transformToAlphanumeric(key);
            const filePath = path.join(baseDir, `${formattedKey}.json`);
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    callback(new Error("Object not found"), null);
                    return;
                }
                const object = serialization.deserialize(data.toString());
                callback(null, object);
            });
        }
    },

    del: (key, callback) => {
        const fortmattedKey = transformToAlphanumeric(key);
        const filePath = path.join(baseDir, `${fortmattedKey}.json`);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                callback(new Error("Object does not exist"), null);
            } else {
                fs.unlink(filePath, (delErr) => {
                    if (delErr) {
                        callback(new Error("Failed to delete object"), null);
                    } else {
                        const object = serialization.deserialize(data.toString());
                        callback(null, object); 
                    }
                });
            }
        });
    },
};

module.exports = store;