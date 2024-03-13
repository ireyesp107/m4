const id = require('../util/id');
//const utils = require('../util'); // Assuming this contains the hash functions and idToNum
const local= require('../local/local');

// Assuming a function to get all NIDs of the nodes in the group is available
function getAllNIDs() {
    // This function needs to return an array of all NIDs (Node IDs) in the distributed system
    // It's a placeholder here and needs an actual implementation based on your system's architecture
    return [];
}

let context = {};

let store = (config) => {
    context.gid = config.gid || "all";
    context.hash = config.hash || id.naiveHash;

    return {
        put: (key, value, callback) => {
            const kid = id.getID(key);
            const nids = getAllNIDs();
            const targetNID = context.hash(kid, nids);
            // Assuming you have a way to resolve NID to a node's address
            const targetNode = resolveNIDtoNode(targetNID);

            if (targetNode.nid === id.getNID(global.nodeConfig)) { // Check if the target node is the current node
                // If yes, perform local operation
                local.mem.put(key, value, callback);
            } else {
                // Otherwise, send the operation to the target node
                local.comm.send({key: key, value: value, gid: context.gid}, {node: targetNode, service: 'mem', method: 'put'}, callback);
            }
        },

        get: (key, callback) => {
            const kid = id.getID(key);
            const nids = getAllNIDs();
            const targetNID = context.hash(kid, nids);
            const targetNode = resolveNIDtoNode(targetNID);

            if (targetNode.nid === id.getNID(global.nodeConfig)) {
                local.mem.get(key, callback);
            } else {
                local.comm.send({key: key, gid: context.gid}, {node: targetNode, service: 'mem', method: 'get'}, callback);
            }
        },

        del: (key, callback) => {
            const kid = id.getID(key);
            const nids = getAllNIDs();
            const targetNID = context.hash(kid, nids);
            const targetNode = resolveNIDtoNode(targetNID);

            if (targetNode.nid === id.getNID(global.nodeConfig)) {
                local.mem.del(key, callback);
            } else {
                local.comm.send({key: key, gid: context.gid}, {node: targetNode, service: 'mem', method: 'del'}, callback);
            }
        },

        reconf: () => {
            // Implementation for reconfiguration
        }
    };
};

module.exports = store;