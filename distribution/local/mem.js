const id = require('../util/id');
//let mem.myMap = {}; // In-memory mem.myMap
const defaultGID = 'local';

function getStorageMap(gid = defaultGID) {
    if (!mem.myMap[gid]) {
        mem.myMap[gid] = {}; // Initialize a new map for this gid if it doesn't exist
    }
    return mem.myMap[gid];
}

const mem = {
 myMap: {},
put: (obj, key, callback) => {
    let formattedKey, gid;
    if (typeof key === 'object' && key !== null) {
        formattedKey = key.key;
        gid = key.gid;
    } else {
        formattedKey = key;
        gid = defaultGID; // Use default gid if none provided
    }
      const serializedKey = formattedKey !== null ? formattedKey : id.getID(obj);
      const map = getStorageMap(gid);

          map[serializedKey] = obj; 
          if (typeof callback === 'function') {
          callback(null, obj);
          }
    },

    get: (key, callback) => {
    let formattedKey, gid;
    if (typeof key === 'object' && key !== null) {
        formattedKey = key.key;
        gid = key.gid;
    } else {
        formattedKey = key;
        gid = defaultGID;
    }

      if (formattedKey === null) {
        const allKeys = [];
        const mapValues = Object.values(mem.myMap);
        
        for (const groupMap of mapValues) {
            const keys = Object.keys(groupMap);
            for (const key of keys) {
                allKeys.push(key);
            }
        }
        if (typeof callback === 'function') {
        callback(null, allKeys);
        }
      }
      else{
    const map = getStorageMap(gid);
    const storedObject = map[formattedKey];
    if (storedObject !== undefined) {
        callback(null, storedObject);
    } else {
        callback(new Error("BROBRO"), null);
    }
}
},
    del: (key, callback) => {
        let formattedKey, gid;
        if (typeof key === 'object' && key !== null) {
            formattedKey = key.key;
            gid = key.gid;
        } else {
            formattedKey = key;
            gid = defaultGID;
        }

        const map = getStorageMap(gid);
        if (map.hasOwnProperty(formattedKey)) {
            const object = map[formattedKey];
            delete map[formattedKey];
            if (typeof callback === 'function') {
            callback(null, object);
            }
        } else {
            callback(new Error("No Object Exists"), null);
        }
    },
  };  
  module.exports = mem;