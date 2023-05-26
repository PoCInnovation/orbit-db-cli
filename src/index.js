const poclif = require('../poclif/poclif');
const LIBDB = require('./libdb/index.js');

function HelloWorld() {
    console.log("Hello world !");
}

poclif.commands.new({
    name: 'create',
    description: "Create a new database. Type can be one of: eventlog|feed|docstore|keyvalue|counter",
    parametters: [
        ["database", poclif.types.string],
        ["type", poclif.types.enum(
            ['eventlog', 'feed', 'docstore', 'keyvalue', 'counter'])
        ]
    ],
    executes: HelloWorld
});

poclif.commands.new({
    name: 'test',
    description: "OIuouazoieuaz",
    parametters: [
        ["opiea", poclif.types.number],
        ["type", poclif.types.number]
    ],
    executes: HelloWorld
});

poclif.create("orbitdb")

const getOrbitdb = async () => {
    const ipfs = await LIBDB.initIpfs();
    const orbitdb = await LIBDB.initOrbitDb(ipfs);
    return orbitdb;
}
