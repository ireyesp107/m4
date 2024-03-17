
const fs = require('fs');
const path = require('path');
const serialization = require('../util/serialization');
const id = require('../util/id');
const defaultGID = 'local';


const baseDir = path.join(__dirname, '..', '..', 'store');
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, {recursive: true});
}

function transformToAlphanumeric(key) {
  return key.replace(/[^a-z0-9]/gi, '_');
}

const store = {
  put: (object, key, callback) => {
    let newKey; let gid;
    if (typeof key === 'object' && key !== null) {
      newKey = key.key;
      gid = key.gid;
    } else {
      newKey = key;
      gid = defaultGID; // Use default gid if none provided
    }

    const formattedKey = transformToAlphanumeric(newKey !== null ?
      newKey : id.getID(object));
    // const formattedKey = newKey !== null ? key : id.getID(object);
    const gidDirectory = path.join(baseDir, transformToAlphanumeric(gid));
    if (!fs.existsSync(gidDirectory)) {
      fs.mkdirSync(gidDirectory, { recursive: true });
    }
    const filePath = path.join(gidDirectory, `${formattedKey}.json`);
    const serializedObject = serialization.serialize(object);

    fs.writeFile(filePath, serializedObject, (err) => {
      callback(err, object);
    });
  },

  get: (key, callback) => {
    let newKey; let gid;
    if (typeof key === 'object' && key !== null) {
      newKey = key.key;
      gid = key.gid;
    } else {
      newKey = key;
      gid = defaultGID; // Use default gid if none provided
    }
      if (newKey === null) {
      const gidDirectory = path.join(baseDir, transformToAlphanumeric(gid));
      
      fs.readdir(gidDirectory, (err, files) => {
        if (err) {
          callback(err, null);
          return;
        }
        let returnKeys =[];
        files.forEach((file)=> {
          returnKeys.push(transformToAlphanumeric(path.basename(file,
              '.json')));
        });
        callback(null, returnKeys);
      });
    } else {
      const formattedKey = transformToAlphanumeric(newKey);
      const gidDirectory = path.join(baseDir, transformToAlphanumeric(gid));
      const filePath = path.join(gidDirectory, `${formattedKey}.json`);
      //const filePath = path.join(baseDir, `${formattedKey}.json`);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          callback(new Error('Object not found'), null);
          return;
        }
        const object = serialization.deserialize(data.toString());
        callback(null, object);
      });
    }
  },

  del: (key, callback) => {
    let newKey; let gid;
    if (typeof key === 'object' && key !== null) {
      newKey = key.key;
      gid = key.gid;
    } else {
      newKey = key;
      gid = defaultGID; // Use default gid if none provided
    }
    const formattedKey = transformToAlphanumeric(newKey);
    const gidDirectory = path.join(baseDir, transformToAlphanumeric(gid));
    const filePath = path.join(gidDirectory, `${formattedKey}.json`);
    //const filePath = path.join(baseDir, `${fortmattedKey}.json`);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        callback(new Error('Object does not exist'), null);
      } else {
        fs.unlink(filePath, (delErr) => {
          if (delErr) {
            callback(new Error('Failed to delete object'), null);
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
