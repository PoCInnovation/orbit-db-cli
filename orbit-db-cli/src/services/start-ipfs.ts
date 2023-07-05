import * as dabCbor from '@ipld/dag-cbor';
import * as dagPb from '@ipld/dag-pb';
import { BlockstoreDatastoreAdapter } from 'blockstore-datastore-adapter';
import { LevelDatastore } from 'datastore-level';
import { create, IPFS } from 'ipfs-core';
import { createRepo, Datastore, IPFSRepo } from 'ipfs-repo';
import * as raw from 'multiformats/codecs/raw';
import { ipfsConfig, repoPath } from './config';

const defaultRepoPath: string = repoPath || './ipfs/';

const codecs: Record<string, any> = {
  [dagPb.name]: dagPb,
  [dagPb.code]: dagPb,
  [dabCbor.name]: dabCbor,
  [dabCbor.code]: dabCbor,
  raw: raw,
};

const loadCodec = (nameOrCode: string | number) => {
  if (codecs[nameOrCode]) {
    return codecs[nameOrCode]
  }
  throw new Error(`Could not load codec for ${nameOrCode}`)
};


const startIpfs = async (): Promise<IPFS> => {
  try {
    const repo: IPFSRepo = createRepo(defaultRepoPath, loadCodec, {
      root: new LevelDatastore(defaultRepoPath + '/root') as unknown as Datastore,
      blocks: new BlockstoreDatastoreAdapter(new LevelDatastore(defaultRepoPath + '/blocks') as unknown as Datastore),
      keys: new LevelDatastore(defaultRepoPath + '/keys') as unknown as Datastore,
      datastore: new LevelDatastore(defaultRepoPath + '/datastore') as unknown as Datastore,
      pins: new LevelDatastore(defaultRepoPath + '/pins') as unknown as Datastore,
    });

    const ipfs: IPFS = await create({
      repo,
      ...ipfsConfig,
    });
    console.log('IPFS node created successfuly');
    return ipfs;
  } catch (error) {
    console.error('Error initializing IPFS node:', error);
    throw new Error('A problem occured when starting ipfs');
  }
}

export { startIpfs };
