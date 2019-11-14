import {ROLE_BUILDER, ROLE_UPGRADER} from "../../utils/Internal/Constants";
import {CreepHelper} from "../CreepHelper";
import {CREEP_ROLE_MANAGERS} from "../../utils/Internal/Interface_Constants";

export class RoleBuilder implements CreepRoleManager {
  name: RoleConstant = ROLE_BUILDER;
  run: (creep: Creep) => void = creep => {
    if (creep.memory.working === true && creep.carry.energy === 0) {
      creep.memory.working = false
    } else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
      creep.memory.working = true
    }
    if (creep.memory.working === true) {
      creep.memory.task = 'transfer'
      creep.say('B_T' + creep.carry.energy)

      // Check for construction sites and build them if possible
      const constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
      if (constructionSite !== null) {
        const creepBuild = creep.build(constructionSite)
        // console.log("Status(" + creep.name + ") - transfer: " + creepBuild + " - " + constructionSite.pos.x + ":" + constructionSite.pos.y)
        if (creepBuild === ERR_NOT_IN_RANGE ||
            creep.pos.x > constructionSite.pos.x + 1 ||
            creep.pos.x < constructionSite.pos.x - 1 ||
            creep.pos.y > constructionSite.pos.y + 1 ||
            creep.pos.y < constructionSite.pos.y - 1
        ) {
          if (!creep.fatigue) {
            const moveRes = creep.travelTo(constructionSite)
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      } else {
        CREEP_ROLE_MANAGERS[ROLE_UPGRADER].run(creep)
      }
    } else {
      creep.memory.task = 'harvest'
      creep.say('B_H' + creep.carry.energy)
      CreepHelper.getEnergy(creep)
    }
  };
}
