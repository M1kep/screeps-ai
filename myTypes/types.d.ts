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

interface CreepCacheData {
  id: string,
}

interface SourceCacheData {
  id: string,
  numAccessTiles: number
  pos: RoomPosition
}

type ROOM_STATE_RCL1 = "RCL1"
type ROOM_STATE_RCL2 = "RCL2"
type ROOM_STATE_RCL3 = "RCL3"
type ROOM_STATE_RCL4 = "RCL4"
type ROOM_STATE_RCL5 = "RCL5"
type ROOM_STATE_RCL6 = "RCL6"
type ROOM_STATE_RCL7 = "RCL7"
type ROOM_STATE_RCL8 = "RCL8"

type RoomStateConstant = ROOM_STATE_RCL1 |
  ROOM_STATE_RCL2 |
  ROOM_STATE_RCL3 |
  ROOM_STATE_RCL4 |
  ROOM_STATE_RCL5 |
  ROOM_STATE_RCL6 |
  ROOM_STATE_RCL7 |
  ROOM_STATE_RCL8
//endregion

//region Role Types
type ROLE_UPGRADER = "upgrader"
type ROLE_REPAIRER = "repairer"
//ednregion