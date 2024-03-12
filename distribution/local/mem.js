const id = require('../util/id');
let myMap = {}; // In-memory myMap

const mem = {

    put: (obj, key, callback) => {
      const serializedKey = key !== null ? key : id.getID(obj);

          myMap[serializedKey] = obj; 
          callback(null, obj); 
    },

    get: (key, callback) => {
      if (key === null) {
          const allKeys = Object.keys(myMap);
          callback(null, allKeys);
      }
      else {
        const storedObject = myMap[key]; 
        if (storedObject !== undefined) {
            callback(null, storedObject); 
        } else {
            callback(new Error("No Object Exists"), null); 
        }
    }
    },

    del: (key, callback) => {
        if (myMap.hasOwnProperty(key)) {
            const object = myMap[key];
            delete myMap[key];
            callback(null, object); 
        } else {
            callback(new Error("No Object Exists"), null);
        }
    },
  };  
  module.exports = mem;