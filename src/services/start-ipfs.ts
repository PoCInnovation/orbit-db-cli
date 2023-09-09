import { ipfsConfig, repoPath } from "./config";

// defaultRepoPath: string
const defaultRepoPath = repoPath || "./ipfs/";

const getLoadCodec = async () => {
  const dagCbor = await import("@ipld/dag-cbor");
  const dagPb = await import("@ipld/dag-pb");
  const raw = await import("multiformats/codecs/raw");

  // nameOrCode: string | number
  const loadCodec = (nameOrCode: string | number) => {
    // codecs: Record<string, any>
    const codecs: Record<string, any> = {
      [dagPb.name]: dagPb,
      [dagPb.code]: dagPb,
      [dagCbor.name]: dagCbor,
      [dagCbor.code]: dagCbor,
      raw: raw,
    };

    if (codecs[nameOrCode]) {
      return codecs[nameOrCode];
    }

    throw new Error(`Could not load codec for ${nameOrCode}`);
  };

  return loadCodec;
};

// return: Promise<IPFS>
const startIpfs = async (start: boolean, ipfsAddress: string | undefined = undefined): Promise<any> => {
  try {
    const { BlockstoreDatastoreAdapter } = await import(
      "blockstore-datastore-adapter"
    );
    // @ts-ignore
    const { Multiaddr } = await import('@multiformats/multiaddr');
    const { createRepo } = await import("ipfs-repo");
    const { LevelDatastore } = await import("datastore-level");
    const loadCodec = await getLoadCodec();
    const repo = createRepo(defaultRepoPath, loadCodec, {
      root: new LevelDatastore(defaultRepoPath + "/root"),
      blocks: new BlockstoreDatastoreAdapter(
        new LevelDatastore(defaultRepoPath + "/blocks") as any,
      ),
      keys: new LevelDatastore(defaultRepoPath + "/keys"),
      datastore: new LevelDatastore(defaultRepoPath + "/datastore"),
      pins: new LevelDatastore(defaultRepoPath + "/pins"),
    });

    const ipfsConf = ipfsConfig;
    if (start || ipfsAddress !== undefined) {
      ipfsConf.start = true;
    }

    const { create } = await import("ipfs-core");
    const ipfs = await create({
      repo,
      ...ipfsConf,
    });

    if (ipfsAddress !== undefined) {
      await ipfs.swarm.connect(Multiaddr(ipfsAddress));
    }

    return ipfs;
  } catch (error) {
    console.error("Error initializing IPFS node:", error);
    throw new Error("A problem occured when starting ipfs");
  }
};

export { startIpfs };
