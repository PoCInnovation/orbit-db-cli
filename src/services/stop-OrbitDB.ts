import { ux } from "@oclif/core";

// orbitdb: OrbitDB
const stopOrbitDB = async (orbitdb: any, showSpinner = true) => {
  if (showSpinner) ux.action.start("Stopping OrbitDB");
  try {
    await orbitdb._ipfs.stop();
    await orbitdb.stop();
    if (showSpinner) ux.action.stop();
  } catch (error) {
    if (showSpinner) ux.action.stop("Failed");
    throw new Error("An error occured while closing OrbitDB");
  }
};

export { stopOrbitDB };
