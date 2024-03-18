const {performance} = require('perf_hooks');

global.nodeConfig = {ip: '127.0.0.1', port: 8080};
const distribution = require('../distribution');
const id = distribution.util.id;

const groupsTemplate = require('../distribution/all/groups');

// This group is used for testing most of the functionality
const mygroupGroup = {};

/*
   This hack is necessary since we can not
   gracefully stop the local listening node.
   This is because the process that node is
   running in is the actual jest process
*/
let localServer = null;

const n1 = {ip: '127.0.0.1', port: 8000};
const n2 = {ip: '127.0.0.1', port: 8001};
const n3 = {ip: '127.0.0.1', port: 8002};


beforeAll((done) => {
  // First, stop the nodes if they are running
  let remote = {service: 'status', method: 'stop'};

  remote.node = n1;
  distribution.local.comm.send([], remote, (e, v) => {
    remote.node = n2;
    distribution.local.comm.send([], remote, (e, v) => {
      remote.node = n3;
      distribution.local.comm.send([], remote, (e, v) => {
      });
    });
  });

  mygroupGroup[id.getSID(n1)] = n1;
  mygroupGroup[id.getSID(n2)] = n2;
  mygroupGroup[id.getSID(n3)] = n3;

  // Now, start the base listening node
  distribution.node.start((server) => {
    localServer = server;

    const groupInstantiation = (e, v) => {
      const mygroupConfig = {gid: 'mygroup'};

      // Create some groups
      groupsTemplate(mygroupConfig)
          .put(mygroupConfig, mygroupGroup, (e, v) => {
            done();
          });
    };

    // Start the nodes
    distribution.local.status.spawn(n1, (e, v) => {
      distribution.local.status.spawn(n2, (e, v) => {
        distribution.local.status.spawn(n3, groupInstantiation);
      });
    });
  });
});

afterAll((done) => {
  distribution.mygroup.status.stop((e, v) => {
    let remote = {service: 'status', method: 'stop'};
    remote.node = n1;
    distribution.local.comm.send([], remote, (e, v) => {
      remote.node = n2;
      distribution.local.comm.send([], remote, (e, v) => {
        remote.node = n3;
        distribution.local.comm.send([], remote, (e, v) => {
          localServer.close();
          done();
        });
      });
    });
  });
});

test('Performance test', (done) => {
  let objects = [];
  let start; let end;

  for (let i = 0; i < 1000; i++) {
    objects.push({id: i, prop1: 'value1',
      prop2: 'value2', prop3: 'value3', prop4: 'value4'});
  }
  let completedOperations = 0;
  const totalOperations = objects.length;

  start = performance.now();
  objects.forEach((obj) => {
    const key = `key_${obj.id}`; // Generate a unique key for each object
    distribution.mygroup.mem.put(obj, key, (e, v) => {
      completedOperations++;
      if (completedOperations === totalOperations) {
        end = performance.now();
        let storageLatency = (end - start) / objects.length;
        let storageThroughput = objects.length / ((end - start) / 1000);

        console.log(`Storage - Average Latency: ${storageLatency.toFixed(2)}
         ms/object, Throughput: ${storageThroughput.toFixed(2)} obj/sec`);
        let completedGet = 0;

        start = performance.now();
        objects.forEach((obj) => {
          const key = `key_${obj.id}`;
          distribution.mygroup.mem.get(key, (e, v) => {
            completedGet++;
            if (completedGet === totalOperations) {
              end = performance.now();
              let retrievalLatency = (end - start) / objects.length;
              let retrievalThroughput = objects.length / ((end - start) / 1000);

              console.log(`Retrieval - Average Latency:
               ${retrievalLatency.toFixed(2)} ms/object,
                Throughput: ${retrievalThroughput.toFixed(2)} obj/sec`);
              done();
            }
          });
        });
      }
    });
  });
});
