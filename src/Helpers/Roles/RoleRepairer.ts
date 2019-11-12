import {ROLE_BUILDER, ROLE_REPAIRER} from "../../utils/Internal/Constants";
import {CreepHelper} from "../CreepHelper";
import {CREEP_ROLE_MANAGERS} from "../../utils/Internal/Interface_Constants";

export class RoleRepairer implements CreepRoleManager {
  name: RoleConstant = ROLE_REPAIRER;
  run: (creep: Creep) => void = creep => {
    if (creep.memory.working === true && creep.carry.energy === 0) {
      creep.memory.working = false
    } else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
      creep.memory.working = true
    }
    if (creep.memory.working === true) {
      creep.memory.task = 'repair'
      creep.say('R_R' + creep.carry.energy)
      const structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.hits < s.hitsMax - (creep.getActiveBodyparts(WORK)) * 100 && s.hits < 750000 // && s.structureType !== STRUCTURE_WALL
      })
      // console.log(structure)
      if (structure !== null) {
        // console.log('Defined - ' + structure)
        const creepRepair = creep.repair(structure)
        if (creepRepair === ERR_NOT_IN_RANGE) {
          creep.travelTo(structure)
        }
      } else {
        CREEP_ROLE_MANAGERS[ROLE_BUILDER].run(creep)
      }
    } else {
      creep.memory.task = 'harvest'
      creep.say('R_H' + creep.carry.energy)
      CreepHelper.getEnergy(creep)
    }
  };
}
