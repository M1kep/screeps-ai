import {MYCREEPS_CACHE_TTL, SOURCE_CACHE_TTL, ROOM_STATE_RCL1} from '../utils/Internal/Constants'
import {MemoryHelper} from '../Helpers/MemoryHelper'
import {RoomHelper} from '../Helpers/RoomHelper'

export class MemoryApi {
  public static initRoomMemory(roomName: string, isOwnedRoom: boolean) {
    if (Memory.rooms[roomName]) {
      return
    }

    if (isOwnedRoom) {
      Memory.rooms[roomName] = {
        creepLimit: {
          localCreepLimit: {
            miner: 0,
            harvester: 0,
            hauler: 0,
            upgrader: 0,
            repairer: 0,
            pickupper: 0
          }
        },
        roomState: ROOM_STATE_RCL1,
        sources: {data: {}, cache: null} as Cache,
        creeps: {data: {}, cache: null} as Cache
      }
    }

    if (Game.rooms[roomName]) {
      this.getRoomMemory(Game.rooms[roomName], true)
    }
  }

  public static getRoomMemory(room: Room, forceUpdate: boolean) {
    this.getSources(room.name, undefined, forceUpdate)
  }

  public static getMyCreeps(roomName: string, filterFunction?: (object: Creep) => boolean, forceUpdate?: boolean): Creep[] {
    if (!Game.rooms[roomName]) {
      return []
    }
    console.log("1")
    if (forceUpdate || Memory.rooms[roomName].creeps === undefined || Memory.rooms[roomName].creeps!.cache === null || Memory.rooms[roomName].creeps!.cache! < Game.time - MYCREEPS_CACHE_TTL) {
      MemoryHelper.updateMyCreeps(roomName)
    }

    const creepIds: string[] = _.map(Memory.rooms[roomName].creeps!.data, (obj: any) => obj.id)
    console.log("CreepIds: " + JSON.stringify(creepIds))
    let creeps: Creep[] = MemoryHelper.getObjectsFromIds<Creep>(creepIds)

    if (filterFunction !== undefined) {
      creeps = _.filter(creeps, filterFunction)
    }

    return creeps
  }

  public static getSources(roomName: string, filterFunction?: (object: Source) => boolean, forceUpdate?: boolean): Source[] {
    if (!Game.rooms[roomName]) {
      return []
    }

    if (forceUpdate || Memory.rooms[roomName].sources === undefined || Memory.rooms[roomName].sources.cache === null || Memory.rooms[roomName].sources.cache! < Game.time - SOURCE_CACHE_TTL) {
      MemoryHelper.updateSources(roomName)
    }

    // const sourceId = this.getSourceIds(roomName)
    if (Memory.rooms[roomName].sources!.data === null) {
      return []
    }
    const sourceId: string[] = _.map(Memory.rooms[roomName].sources.data, "id")

    let sources: Source[] = MemoryHelper.getObjectsFromIds<Source>(sourceId)

    if (filterFunction !== undefined) {
      sources = _.filter(sources, filterFunction)
    }

    return sources
  }

  public static getNumSourceAccessTiles(roomName: string, filterFunction?: (object: Source) => boolean, forceUpdate?: boolean): number {
    if (!Game.rooms[roomName]) {
      return -1
    }

    if (forceUpdate || Memory.rooms[roomName].sources === undefined || Memory.rooms[roomName].sources.cache! < Game.time - SOURCE_CACHE_TTL) {
      MemoryHelper.updateSources(roomName)
    }
    if (Memory.rooms[roomName].sources!.data === null) {
      return 0
    }

    return _.sum(Memory.rooms[roomName].sources!.data!, "numAccessTiles")
  }

  public static getSourceIds(roomName: string): string[] {
    return _.map(Memory.rooms[roomName].sources.data, (sourceMemory: StringMap) => sourceMemory.id)
  }

  public static updateRoomState(room: Room, state: RoomStateConstant) {
    room.memory.roomState = state
  }

  public static getOwnedRooms(): Room[] {
    return _.filter(Game.rooms, (room: Room) => RoomHelper.isOwner(room))
  }
}
