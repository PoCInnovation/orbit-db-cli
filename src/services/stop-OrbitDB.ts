import { ux } from "@oclif/core";

// orbitdb: OrbitDB
const stopOrbitDB = async (orbitdb: any) => {
  ux.action.start("Stopping OrbitDB");
  try {
    await orbitdb._ipfs.stop();
    await orbitdb.stop();
    ux.action.stop();
  } catch (error) {
    ux.action.stop("Failed");
    throw new Error("An error occured while closing OrbitDB");
  }
};

export { stopOrbitDB };
