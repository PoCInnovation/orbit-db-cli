import {DBType} from './create-DB'

export {resolveDBIdByName}

// orbitdb: OrbitDB
const resolveDBIdByName = async (orbitdb: any, name: string, type: DBType) => {
  const dbAdress = await orbitdb.determineAddress(name, type)
  return `${dbAdress}`
}
