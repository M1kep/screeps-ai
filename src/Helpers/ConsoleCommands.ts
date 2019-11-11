import {MemoryApi} from "../API/MemoryApi";
import {Traveler} from "../utils/Traveler/Traveler";
import {PriorityQueue} from "../utils/Internal/Queue";

export class ConsoleCommands {
  public static init() {
    // TODO: Load console commands via global.<commandName> = this.<commandFunction>
    // @ts-ignore
    global.getCreepCount = this.getCreepCount
    // @ts-ignore
    global.getTravPath = this.getTravelPath
    // @ts-ignore
    global.testQ = this.testQueue
    // @ts-ignore
    global.getSource = MemoryApi.getSources
    // @ts-ignore
    global.getNumTile = MemoryApi.getNumSourceAccessTiles
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
    // console.log(`Harvester:\t${numberOfHarvesters}\nUpgrader:\t${numberOfUpgraders}`)
  }

  private static testQueue (iter: number) {
    let cpuA = Game.cpu.getUsed()

    let arr: any = [[]]

    let q = new PriorityQueue()
    for(let i = 0; i < iter; i++) {
      arr[0].push(["Test", i])
      // q.push(["test", i])
    }
    // q.push(arr[0])
    let cpuB = Game.cpu.getUsed()
    console.log(cpuA - cpuB)
  }
}
