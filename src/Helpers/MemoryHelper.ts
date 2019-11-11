import {RoomHelper} from './RoomHelper'

export class MemoryHelper {
  public static getObjectsFromIds<T>(idArray: string[]): T[] {
    // console.log("Array Length: " + idArray.length)
    if (idArray.length === 0) {
      return []
    }

    const objects: T[] = []

    _.forEach(idArray, (id: string) => {
      // console.log("ObjID: " + id)
      const object: T | null = Game.getObjectById(id)
      if (object !== null) {
        objects.push(object)
      }
    })
    return objects
  }

  public static updateMyCreeps(roomName: string): void {
    console.log("Creeps cache update!")
    if (!Memory.rooms[roomName]) {
      return
    }

    Memory.rooms[roomName].creeps = {data: {}, cache: null}

    const creeps = _.filter(Game.creeps, (creep: Creep) => creep.memory.homeRoom === roomName)

    Memory.rooms[roomName].creeps!.data = _.map(creeps, (creep: Creep) => {
      return {
        id: creep.id
      }
    })
    Memory.rooms[roomName].creeps!.cache = Game.time
  }

  public static updateSources(roomName: string): void {
    // If we have no vision of the room, return
    if (!Memory.rooms[roomName]) {
      return
    }

    Memory.rooms[roomName].sources = {data: {}, cache: null} as SourceCache

    const sources = Game.rooms[roomName].find(FIND_SOURCES)
    Memory.rooms[roomName].sources.data = _.map(sources, (source: Source) => {
      return {
        id: source.id,
        numAccessTiles: RoomHelper.getNumAccessTilesForTarget(source),
        pos: source.pos
      }
    }) as SourceData[]
    Memory.rooms[roomName].sources.cache = Game.time
  }

  public static updateLocalCreepLimits(roomName: string, creepLimits: LocalCreepLimits) {
    Memory.rooms[roomName].creepLimit!.localCreepLimit = creepLimits
  }
}
