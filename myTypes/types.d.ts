interface StringMap {
  [key: string]: any
}

//region Creep Types
interface CreepMemory {
  task?: string
  working?: boolean
  role?: string
  sourceId?: string
  containerId?: string
  homeRoom?: string
  fromStorage?: boolean
  targetRoom?: string
}
// declare const RECIEVED_ENERGY = 1
// declare const MOVED_TO_ENERGY_SOURCE = 0

type RECIEVED_ENERGY = 1
type MOVED_TO_ENERGY_SOURCE = -1

type GetEnergyReturn = RECIEVED_ENERGY |
  MOVED_TO_ENERGY_SOURCE
//endregion

//region Memory Types
interface Memory {
  stats: { [index: string]: any }
}

interface RoomMemory {
  creepLimit: CreepLimits

  sources: Cache

  creeps?: Cache

  roomState: RoomStateConstant
}

interface LocalCreepLimits {
  [index: string]: number

  miner: number

  harvester: number

  hauler: number

  upgrader: number

  repairer: number

  pickupper: number

}

interface CreepLimits {
  localCreepLimit: LocalCreepLimits
}

interface CreepSpawnLimits {
  roomState: RoomStateConstant
  generateLocalCreepLimits: (room: Room) => LocalCreepLimits
}

interface Cache {
  data: SourceCacheData[] |
    CreepCacheData[]

  cache: number | null
}

type CacheData = SourceCacheData |
  CreepCacheData
// interface SourceCache {
//   data: SourceData[]
//
//   cache: number | null
// }

interface CreepCacheData {
  id: string,
}

interface SourceCacheData {
  id: string,
  numAccessTiles: number
  pos: RoomPosition
}
// interface SourceCache {
//
//   data: {
//     id: string,
//     numAccessTiles: number
//   }
//
//   cache: number | null
// }

// interface SourceData {
//   id: string
//
//   numAccessTiles: number
// }
//endregion

//region Room Types
declare const ROOM_STATE_RCL1 = 1
declare const ROOM_STATE_RCL2 = 2
declare const ROOM_STATE_RCL3 = 3
declare const ROOM_STATE_RCL4 = 4
declare const ROOM_STATE_RCL5 = 5
declare const ROOM_STATE_RCL6 = 6
declare const ROOM_STATE_RCL7 = 7
declare const ROOM_STATE_RCL8 = 8

type ROOM_STATE_RCL1 = 1
type ROOM_STATE_RCL2 = 2
type ROOM_STATE_RCL3 = 3
type ROOM_STATE_RCL4 = 4
type ROOM_STATE_RCL5 = 5
type ROOM_STATE_RCL6 = 6
type ROOM_STATE_RCL7 = 7
type ROOM_STATE_RCL8 = 8

type RoomStateConstant = ROOM_STATE_RCL1 |
  ROOM_STATE_RCL2 |
  ROOM_STATE_RCL3 |
  ROOM_STATE_RCL4 |
  ROOM_STATE_RCL5 |
  ROOM_STATE_RCL6 |
  ROOM_STATE_RCL7 |
  ROOM_STATE_RCL8
//endregion
