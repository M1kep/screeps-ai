import {ROLE_MINER} from "../../utils/Internal/Constants";

export class RoleMiner implements CreepRoleManager {
  name: RoleConstant = ROLE_MINER;
  run: (creep: Creep) => void = creep => {
    if (!creep.spawning) {
      /**
       * @type {Source}
       */
      const source: Source | null = Game.getObjectById(creep.memory.sourceId)

      /**
       * @type {StructureContainer}
       */
      const container: StructureContainer | null = Game.getObjectById(creep.memory.containerId)
      if (container === null) {
        throw new Error('Miner containerId returned null obj ' + creep.name + " : " + creep.room.name)
      }

      if (source === null) {
        throw new Error('Miner sourceId returned null obj ' + creep.name + " : " + creep.room.name)
      }

      // If on the container then harvest energy
      //    If no energy available, repair container if needed
      // Otherwise Move to container
      if (creep.pos.isEqualTo(container.pos)) {
        if (source.energy > 0) {
          creep.say('⛏️', true)
          creep.harvest(source)
        } else if (container.hits < container.hitsMax && creep.store.energy > 0) {
          creep.say('⚒️', true)
          creep.repair(container)
        }
      } else {
        if (!creep.fatigue) {
          creep.say('🏃', true)
          const moveRes = creep.travelTo(container)
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      }
    }
  };
}
