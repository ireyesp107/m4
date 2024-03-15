const assert = require('assert');
var crypto = require('crypto');

// The ID is the SHA256 hash of the JSON representation of the object
function getID(obj) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(obj));
  return hash.digest('hex');
}

// The NID is the SHA256 hash of the JSON representation of the node
function getNID(node) {
  node = {ip: node.ip, port: node.port};
  return getID(node);
}

// The SID is the first 5 characters of the NID
function getSID(node) {
  return getNID(node).substring(0, 5);
}


function idToNum(id) {
  let n = parseInt(id, 16);
  assert(!isNaN(n), 'idToNum: id is not in KID form!');
  return n;
}

function naiveHash(kid, nids) {
  nids.sort();
  return nids[idToNum(kid) % nids.length];
}

function consistentHash(kid, nids) {
  let ids = nids.map((nid) => idToNum(nid));
  let kidNum = idToNum(kid);
  ids.push(kidNum);
  ids.sort();
  let foundIndex;
  for (i = 0; i<ids.length; i++) {
    if (ids[i]===kidNum) {
      foundIndex=i+1;
      break;
    }
  }
  if (foundIndex >= ids.length) foundIndex = 0;

  return nids.find((nid) => idToNum(nid) === ids[foundIndex]);
}


function rendezvousHash(kid, nids) {
  let localMax = -1;
  let finalNid = null;
  nids.forEach((nid) => {
    let combinedValue = kid + nid;
    let hash = crypto.createHash('sha256').update(combinedValue).digest('hex');
    let hashToNum = parseInt(hash);
    if (hashToNum >= localMax) {
      localMax = hashToNum;
      finalNid = nid;
    }
  });

  return finalNid;
}

module.exports = {
  getNID: getNID,
  getSID: getSID,
  getID: getID,
  idToNum: idToNum,
  naiveHash: naiveHash,
  consistentHash: consistentHash,
  rendezvousHash: rendezvousHash,
};
