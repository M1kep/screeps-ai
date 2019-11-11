import {MOVED_TO_ENERGY_SOURCE, RECIEVED_ENERGY} from "../utils/Internal/Constants";

export class CreepHelper {
  public static getEnergy(creep: Creep): GetEnergyReturn {
    // Get the storage from the room
    // TODO: Support dynamic rooms based on creep home room
    const storage = Game.spawns.Spawn1.room.storage
    // If the storage does not exist, or we don't want to use it
    if (!storage || storage.store.energy < 2500) {
      // Retrieve the sources in the room
      // TODO: Query via Memory API
      const source: Source | null = creep.pos.findClosestByPath(FIND_SOURCES)
      // If a source is located
      if (source !== null) {
        // Attempt to harvest from the source
        const creepHarvest = creep.harvest(source)
        // Depending on the return status, do something
        switch (creepHarvest) {
          case ERR_NOT_IN_RANGE:
            // If the creep is unable to move due to fatigue then wait
            if (!creep.fatigue) {
              const moveRes = creep.travelTo(source)
              if (moveRes !== 0) {
                console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
              }
            }
            return MOVED_TO_ENERGY_SOURCE

          // If the creep received the energy from the source
          case OK:
            return RECIEVED_ENERGY

          default:
            throw new Error("Hit unexpected status in getEnergy call. - 1")
        }
      } else {
        throw new Error("Hit unexpected status in getEnergy call. - 3")
      }
    } else {
      const creepWithdraw = creep.withdraw(storage, RESOURCE_ENERGY)

      switch (creepWithdraw) {
        case ERR_NOT_IN_RANGE:
          if (!creep.fatigue) {
            const moveRes = creep.travelTo(storage)
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
          return MOVED_TO_ENERGY_SOURCE

        case OK:
          return RECIEVED_ENERGY

        default:
          throw new Error("Hit unexpected status in getEnergy call. - " + creepWithdraw)
      }
    }
  }
}
