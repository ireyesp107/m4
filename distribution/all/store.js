const id = require('../util/id');
const local = require('../local/local');
const globalDistribution = require('../../distribution.js'); // Ensure this path is correct

let context = {};

let store = (config) => {
    context.gid = config.gid || "all"; // Node group ID
    context.hash = config.hash || id.naiveHash; // Hash function
    

    return {
        put: (value, key, callback) => {

            let groupMap = {}
            local.groups.get(context.gid,(e, v) => {
            //global.distribution[context.gid].groups.get(context.gid , (e, v) => {
            groupMap = v
            console.log(groupMap)

            let nids = []
                    for (const node in groupMap) {
                    if (Object.prototype.hasOwnProperty.call(v, node)) {

                        nids.push(id.getNID(groupMap[node]))
                        // groupMap[id.getNID(groupMap[node])] = groupMap[node]
                        // delete groupMap[node];
                    }}
            let enhancedKey = {key: key, gid: context.gid}
            const kid = id.getID(enhancedKey);
             const targetNID = context.hash(kid, nids);
             const targetNode = groupMap[targetNID.substring(0,5)];
            
            if (targetNode.nid === id.getNID(global.nodeConfig)) {
                local.mem.put([value,enhancedKey],callback);
            } else {
                local.comm.send([value,enhancedKey], {node: targetNode, service: 'mem', method: 'put'},callback)
            }
        })
        },

        get: (key, callback) => {
            let groupMap = {}
            local.groups.get(context.gid,(e, v) => {
            //global.distribution[context.gid].groups.get(context.gid , (e, v) => {
            groupMap = v

            let nids = []
                    for (const node in groupMap) {
                    if (Object.prototype.hasOwnProperty.call(v, node)) {

                        nids.push(id.getNID(groupMap[node]))
                        // groupMap[id.getNID(groupMap[node])] = groupMap[node]
                        // delete groupMap[node];
                    }}
            let enhancedKey = {key: key, gid: context.gid}
            const kid = id.getID(enhancedKey);
             const targetNID = context.hash(kid, nids);
             const targetNode = groupMap[targetNID.substring(0,5)];
            if (targetNode.nid === id.getNID(global.nodeConfig)) {
                local.mem.put([value,enhancedKey],callback);
            } else {
                local.comm.send([enhancedKey], {node: targetNode, service: 'mem', method: 'get'},callback)
            }
        })
        },

        del: (key, callback) => {
            let groupMap = {}
            local.groups.get(context.gid,(e, v) => {
            //global.distribution[context.gid].groups.get(context.gid , (e, v) => {
            groupMap = v

            let nids = []
                    for (const node in groupMap) {
                    if (Object.prototype.hasOwnProperty.call(v, node)) {

                        nids.push(id.getNID(groupMap[node]))
                        // groupMap[id.getNID(groupMap[node])] = groupMap[node]
                        // delete groupMap[node];
                    }}
            let enhancedKey = {key: key, gid: context.gid}
            const kid = id.getID(enhancedKey);
             const targetNID = context.hash(kid, nids);
             const targetNode = groupMap[targetNID.substring(0,5)];
            if (targetNode.nid === id.getNID(global.nodeConfig)) {
                local.mem.put([value,enhancedKey],callback);
            } else {
                local.comm.send([enhancedKey], {node: targetNode, service: 'mem', method: 'get'},callback)
            }
        })
        },

        reconf: () => {
        }
    };
};

module.exports = store;