import {MemoryApi} from "../API/MemoryApi";
import {Traveler} from "../utils/Traveler/Traveler";

export class ConsoleCommands {
  public static init() {
    // TODO: Load console commands via global.<commandName> = this.<commandFunction>
    // @ts-ignore
    global.getCreepCount = this.getCreepCount
    // @ts-ignore
    global.getTravPath = this.getTravelPath
    // @ts-ignore
    global.getSource = MemoryApi.getSources
    // @ts-ignore
    global.getNumTile = MemoryApi.getNumSourceAccessTiles
    // @ts-ignore
    global.placeConstructionSites = this.placeConstructionSitesOnPath
    // @ts-ignore
    global.addDepRoom = MemoryApi.addDependentRoom
    // @ts-ignore
    global.getDepRoom = MemoryApi.getDependentRoomNames
    // @ts-ignore
    global.removeDepRoom = MemoryApi.removeDependentRoom
    // @ts-ignore
    global.getDepRoomSources = this.getDependentRoomSourceIds
  }

  private static getDependentRoomSourceIds(roomName: string, dependentRoom?: string): string[] {
    return MemoryApi.getDependentRoomSourceIds(roomName, dependentRoom)
  }
  private static getTravelPath(origin: RoomPosition | HasPos, destination: RoomPosition | HasPos, options: TravelToOptions = {}): PathfinderReturn {
    return Traveler.findTravelPath(origin, destination, options)
  }

  private static getCreepCount(roomName: string) {
    // TODO: Implement memory based information and caching
    const myCreeps = MemoryApi.getMyCreeps(roomName)
    console.log("My Creeps: " + JSON.stringify(myCreeps))
    const groupedCreeps = _.groupBy(myCreeps, (creep) => creep.memory.role)
    console.log("Grouped Creeps: " + JSON.stringify(groupedCreeps))
    // const myCreeps = _.groupBy(MemoryApi.getMyCreeps(roomName), (creep) => creep.memory.role)
    console.log(JSON.stringify(myCreeps))
    for (const role in groupedCreeps) {
      console.log(`${role}:\t${groupedCreeps[role].length}`)
    }
  }

  private static placeConstructionSitesOnPath(origin: RoomPosition, destination: RoomPosition | HasPos, preview?: boolean, options: TravelToOptions = {}) {
    // for(const struc in planDef.buildings) {
    // // @ts-ignore
    // planDef.buildings[struc].pos.forEach((pos: { x: number, y: number }) => Game.rooms["E17N28"].visual.structure(pos.x, pos.y, struc))
    // }
    const roomVisual = new RoomVisual(origin.roomName)
    const travPath = Traveler.findTravelPath(origin, destination, options)
    if (preview) {
      roomVisual.poly(travPath.path)
    } else {
      for(let pathPos of travPath.path) {
        let room = Game.rooms[pathPos.roomName]
        room.createConstructionSite(pathPos, STRUCTURE_ROAD)
      }
    }
  }
}
