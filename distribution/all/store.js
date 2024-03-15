const id = require('../util/id');
const local = require('../local/local');

let store = (config) => {
  let context = {};
  context.gid = config.gid || 'all'; // Node group ID
  context.hash = config.hash || id.naiveHash; // Hash function
  return {
    put: (value, key, callback) => {
      let groupMap = {};
      local.groups.get(context.gid, (e, v) => {
        // global.distribution[context.gid].groups.get(context.gid , (e, v) => {
        groupMap = v;
        let nids = [];
        for (const node in groupMap) {
          if (Object.prototype.hasOwnProperty.call(v, node)) {
            nids.push(id.getNID(groupMap[node]));
            // groupMap[id.getNID(groupMap[node])] = groupMap[node]
            // delete groupMap[node];
          }
        }
        let enhancedKey = {key: key, gid: context.gid};
        const kid = id.getID(enhancedKey.key);
        const targetNID = context.hash(kid, nids);
        const targetNode = groupMap[targetNID.substring(0, 5)];

        if (enhancedKey.key === null) {
          global.distribution[context.gid].comm.send([value, enhancedKey],
              {service: 'mem', method: 'put'}, (e, v) => {
                callback({}, Object.values(v).flat());
              });
        } else if (targetNID === id.getNID(global.nodeConfig)) {
          local.mem.put([value, enhancedKey], callback);
        } else {
          local.comm.send([value, enhancedKey],
              {node: targetNode, service: 'mem', method: 'put'}, callback);
        }
      });
    },

    get: (key, callback) => {
      let groupMap = {};
      local.groups.get(context.gid, (e, v) => {
        // global.distribution[context.gid].groups.get(context.gid , (e, v) => {
        groupMap = v;

        let nids = [];
        for (const node in groupMap) {
          if (Object.prototype.hasOwnProperty.call(v, node)) {
            nids.push(id.getNID(groupMap[node]));
            // groupMap[id.getNID(groupMap[node])] = groupMap[node]
            // delete groupMap[node];
          }
        }
        let enhancedKey = {key: key, gid: context.gid};

        const kid = id.getID(enhancedKey.key);
        const targetNID = context.hash(kid, nids);
        const targetNode = groupMap[targetNID.substring(0, 5)];
        if (key === null) {
          global.distribution[context.gid].comm.send([enhancedKey],
              {service: 'mem', method: 'get'}, (e, v) => {
                callback({}, Object.values(v).flat());
              });
        } else if (targetNID === id.getNID(global.nodeConfig)) {
          local.mem.get([enhancedKey], callback);
        } else {
          local.comm.send([enhancedKey],
              {node: targetNode, service: 'mem', method: 'get'}, callback);
        }
      });
    },

    del: (key, callback) => {
      let groupMap = {};
      local.groups.get(context.gid, (e, v) => {
        // global.distribution[context.gid].groups.get(context.gid , (e, v) => {
        groupMap = v;

        let nids = [];
        for (const node in groupMap) {
          if (Object.prototype.hasOwnProperty.call(v, node)) {
            nids.push(id.getNID(groupMap[node]));
          }
        }
        let enhancedKey = {key: key, gid: context.gid};
        const kid = id.getID(enhancedKey.key);
        const targetNID = context.hash(kid, nids);
        const targetNode = groupMap[targetNID.substring(0, 5)];
        if (targetNode.nid === id.getNID(global.nodeConfig)) {
          local.mem.del([enhancedKey], callback);
        } else {
          local.comm.send([enhancedKey],
              {node: targetNode, service: 'mem', method: 'del'}, callback);
        }
      });
    },

    reconf: () => {
    },
  };
};

module.exports = store;
