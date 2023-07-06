import { ipfsConfig, repoPath } from './config';

// defaultRepoPath: string
const defaultRepoPath = repoPath || './ipfs/';

// nameOrCode: string | number
const loadCodec = (nameOrCode) => {
  let res = null;

  // codecs: Record<string, any>
  import("@ipld/dag-cbor").then(dagCbor => {
    import("@ipld/dag-pb").then(dagPb => {
      import("multiformats/codecs/raw").then(raw => {
        const codecs = {
          [dagPb.name]: dagPb,
          [dagPb.code]: dagPb,
          [dagCbor.name]: dagCbor,
          [dagCbor.code]: dagCbor,
          raw: raw,
        };

        if (codecs[nameOrCode]) {
          res = codecs[nameOrCode]
        }
      });
    });
  });
  if (res) {
    return res;
  }
  throw new Error(`Could not load codec for ${nameOrCode}`);
};


// return: Promise<IPFS>
const startIpfs = async () => {
  try {
    const { BlockstoreDatastoreAdapter } = await import("blockstore-datastore-adapter");
    const { createRepo } = await import("ipfs-repo");
    const { LevelDatastore } = await import("datastore-level");
    const repo = createRepo(defaultRepoPath, loadCodec, {
      root: new LevelDatastore(defaultRepoPath + '/root'),
      blocks: new BlockstoreDatastoreAdapter(new LevelDatastore(defaultRepoPath + '/blocks')),
      keys: new LevelDatastore(defaultRepoPath + '/keys'),
      datastore: new LevelDatastore(defaultRepoPath + '/datastore'),
      pins: new LevelDatastore(defaultRepoPath + '/pins'),
    });

    const { create } = await import("ipfs-core");
    const ipfs = await create({
      repo,
      ...ipfsConfig,
    });
    return ipfs;
  } catch (error) {
    console.error('Error initializing IPFS node:', error);
    throw new Error('A problem occured when starting ipfs');
  }
}

export { startIpfs };
