# M4: Distributed Storage
> Full name: `<Isaias Reyes-Paredes>`
> Email:  `<isaias_reyes-paredes@brown.edu>`
> Username:  `ireyespa`

## Summary
> Summarize your implementation, including key challenges you encountered

My implementation comprises `5` new software components, totaling `524` added lines of code over the previous implementation. Key challenges included `A key challenge at first was to udnerstand how to use fs to craete a store. However, after reading the document I learned how to create/delete/read a file. Another challenge I had was to understand how to extend the key to include gid. However, I soon realized it was necessary to modify the local mem/store to treat key as an object rather than a string. Another challenge as in the distributed mem/store how to use the hash in order to find the proper node to store data. I realized we would have to generate a list of nids using the local.groups.get function in order to obtain the nodes. Then after inserting the kid,nids into the hash I could obtain this value and use this nid as a key in my map to obtain the node. This would be the remote node that could handle the distributed portion of the assignment.  `.

## Correctness & Performance Characterization
> Describe how you characterized the correctness and performance of your implementation

*Correctness*: I wrote `5` tests; these tests take `2.354s` to execute.

*Performance*: Storing and retrieving 1000 5-property objects using a 3-node setup results in following average throughput and latency characteristics: `Storing <1177.2>`obj/sec and `<0.85>` (ms/object) | Retrieval<1959.18>`obj/sec and `<0.51>` (ms/object) (Note: these objects were pre-generated in memory to avoid accounting for any performance overheads of generating these objects between experiments).

## Key Feature
> Why is the `reconf` method designed to first identify all the keys to be relocated and then relocate individual objects instead of fetching all the objects immediately and then pushing them to their corresponding locations?

## Time to Complete
> Roughly, how many hours did this milestone take you to complete?

Hours: `12 hours`
