import { profile } from '../utils/Profiler/Profiler'

@profile
export class RoleManager {
  public static runMiner (creep: Creep) {
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
        throw new Error('Miner containerId null.')
      }
      // If on the container then harvest energy
      //    If no energy available, repair container if needed
      // Otherwise Move to container
      if (creep.pos.isEqualTo(container.pos)) {
        if (source !== null && source.energy > 0) {
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
  }

  public static runHarvester (creep: Creep) {
    if (creep.memory.working === true && creep.carry.energy === 0) {
      creep.memory.working = false
    } else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
      creep.memory.working = true
    }
    if (creep.memory.working === true) {
      creep.memory.task = 'transfer'
      creep.say('H_T' + creep.carry.energy)
      // Get Spawn and extensions that need power
      const structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (s) => (s.structureType === STRUCTURE_SPAWN ||
          s.structureType === STRUCTURE_EXTENSION ||
          s.structureType === STRUCTURE_TOWER) &&
          s.energy < s.energyCapacity
      }) as StructureSpawn | StructureExtension | StructureTower | null

      // If there are no spawns or extensions that require then give energy to storage if
      // the energy did not come from storage
      // if ((structure === undefined || structure === null) && creep.memory.fromStorage === false) {
      //   structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
      //     filter: (s) => (s.structureType === STRUCTURE_STORAGE) &&
      //       (s.store.energy < s.storeCapacity)
      //   }) as StructureStorage
      // }

      // If there is something to deposit into then do so
      if (structure !== null) {
        console.log('hit again')
        const creepTransfer = creep.transfer(structure, RESOURCE_ENERGY)
        console.log('Status(' + creep.name + ') - transfer: ' + creepTransfer)
        if (creepTransfer === ERR_NOT_IN_RANGE) {
          if (!creep.fatigue) {
            const moveRes = creep.travelTo(structure)
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      }
    } else {
      creep.memory.task = 'harvest'
      creep.say('H_H' + creep.carry.energy)
      const storage = Game.spawns.Spawn1.room.storage
      // If there is no storage fall back to harvesting sources
      if (!storage) {
        const source: Source | null = creep.pos.findClosestByPath(FIND_SOURCES)
        if (source !== null) {
          const creepHarvest = creep.harvest(source)
          // creep.memory.fromStorage = false
          // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
          if (creepHarvest === ERR_NOT_IN_RANGE) {
            if (!creep.fatigue) {
              const moveRes = creep.travelTo(source)
              if (moveRes !== 0) {
                console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
              }
            }
          }
        }
        // Otherwise, get energy from storage
      } else {
        const creepWithdraw = creep.withdraw(storage, RESOURCE_ENERGY)
        // creep.memory.fromStorage = true
        if (creepWithdraw === ERR_NOT_IN_RANGE) {
          if (!creep.fatigue) {
            const moveRes = creep.travelTo(storage)
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      }
    }
  }

  public static runAttacker (creep: Creep) {
    const enemies = creep.room.find(FIND_HOSTILE_CREEPS)
    if (!Array.isArray(enemies) || enemies.length) {
      // console.log(enemies[0])
      // console.log('X: ' + enemies[0].pos.x + '| Y: ' + enemies[0].pos.y)
      if (enemies[0].owner.username !== 'Orlet') {
        // console.log(enemies[0].Owner)
        creep.travelTo(enemies[0])
        creep.attack(enemies[0])
      } else if (Game.flags.attack_wait) {
        creep.travelTo(Game.flags.attack_wait)
      }
    } else if (Game.flags.attack_wait) {
      creep.travelTo(Game.flags.attack_wait)
    }
  }

  public static runBuilder (creep: Creep) {
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
        if (creepBuild === ERR_NOT_IN_RANGE) {
          if (!creep.fatigue) {
            const moveRes = creep.travelTo(constructionSite)
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      } else {
        this.runUpgrader(creep)
        // roleHarvester.run(creep)
      }
    } else {
      creep.memory.task = 'harvest'
      creep.say('B_H' + creep.carry.energy)
      const storage = Game.spawns.Spawn1.room.storage
      // If there isn't storage then withdraw from sources
      if (!storage) {
        const source: Source | null = creep.pos.findClosestByPath(FIND_SOURCES)
        if (source !== null) {
          const creepHarvest = creep.harvest(source)
          // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
          if (creepHarvest === ERR_NOT_IN_RANGE) {
            if (!creep.fatigue) {
              const moveRes = creep.travelTo(source)
              if (moveRes !== 0) {
                console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
              }
            }
          }
        }
      } else {
        const creepWithdraw = creep.withdraw(storage, RESOURCE_ENERGY)
        // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
        if (creepWithdraw === ERR_NOT_IN_RANGE) {
          if (!creep.fatigue) {
            const moveRes = creep.travelTo(storage)
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      }
    }
  }

  public static runUpgrader (creep: Creep) {
    if (creep.memory.working === true && creep.carry.energy === 0) {
      creep.memory.working = false
    } else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
      creep.memory.working = true
    }
    if (creep.memory.working === true) {
      creep.say('U_U' + creep.carry.energy)
      creep.memory.task = 'upgrade'
      if (creep.room.controller === undefined) {
        throw new Error('Creep looking for non existent controller')
      }
      const creepUpgrade = creep.upgradeController(creep.room.controller)
      // console.log("Status(" + creep.name + ") - upgrade: " + creepUpgrade)
      if (creepUpgrade === ERR_NOT_IN_RANGE) {
        if (!creep.fatigue) {
          const moveRes = creep.travelTo(creep.room.controller)
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      }
    } else {
      creep.say('U_H' + creep.carry.energy)
      creep.memory.task = 'harvest'
      const storage = Game.spawns.Spawn1.room.storage
      // const storage = false
      if (!storage) {
        const source: Source | null = creep.pos.findClosestByPath(FIND_SOURCES)
        if (source !== null) {
          const creepHarvest = creep.harvest(source)
          // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
          if (creepHarvest === ERR_NOT_IN_RANGE) {
            if (!creep.fatigue) {
              const moveRes = creep.travelTo(source)
              if (moveRes !== 0) {
                console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
              }
            }
          }
        }
      } else {
        const creepWithdraw = creep.withdraw(storage, RESOURCE_ENERGY)
        // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
        if (creepWithdraw === ERR_NOT_IN_RANGE) {
          if (!creep.fatigue) {
            const moveRes = creep.travelTo(storage)
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      }
      // // var source = creep.pos.findClosestByPath(FIND_SOURCES)
      // var source

      // const tombStone = creep.pos.findClosestByPath(FIND_RUINS, {
      //   filter: (r) => r.store.energy !== 0
      // })
      // if (tombStone) {
      //   source = tombStone
      //   const creepWithdraw = creep.withdraw(tombStone, RESOURCE_ENERGY)
      //   if (creepWithdraw === ERR_NOT_IN_RANGE && !creep.fatigue) {
      //     creep.travelTo(tombStone)
      //   }
      // } else {
      //   source = Game.spawns.Spawn1.room.storage
      //   const creepHarvest = creep.withdraw(source, RESOURCE_ENERGY)
      //   // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
      //   if (creepHarvest === ERR_NOT_IN_RANGE) {
      //     if (!creep.fatigue) {
      //       const moveRes = creep.travelTo(source, { visualizePathStyle: {} })
      //       if (moveRes !== 0) {
      //         console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
      //       }
      //     }
      //   }
      // }
    }
  }

  public static runRepairer (creep: Creep) {
    if (creep.memory.working === true && creep.carry.energy === 0) {
      creep.memory.working = false
    } else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
      creep.memory.working = true
    }
    if (creep.memory.working === true) {
      creep.memory.task = 'repair'
      creep.say('R_R' + creep.carry.energy)
      const structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.hits < s.hitsMax && s.hits < 750000 // && s.structureType !== STRUCTURE_WALL
      })
      // console.log(structure)
      if (structure !== null) {
        // console.log('Defined - ' + structure)
        const creepRepair = creep.repair(structure)
        if (creepRepair === ERR_NOT_IN_RANGE) {
          creep.travelTo(structure)
        }
      } else {
        RoleManager.runBuilder(creep)
      }
    } else {
      creep.memory.task = 'harvest'
      creep.say('R_H' + creep.carry.energy)
      const storage = Game.spawns.Spawn1.room.storage
      if (!storage) {
        const source: Source | null = creep.pos.findClosestByPath(FIND_SOURCES)
        if (source !== null) {
          const creepHarvest = creep.harvest(source)
          // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
          if (creepHarvest === ERR_NOT_IN_RANGE) {
            if (!creep.fatigue) {
              const moveRes = creep.travelTo(source)
              if (moveRes !== 0) {
                console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
              }
            }
          }
        }
      } else {
        const creepWithdraw = creep.withdraw(storage, RESOURCE_ENERGY)
        // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
        if (creepWithdraw === ERR_NOT_IN_RANGE) {
          if (!creep.fatigue) {
            const moveRes = creep.travelTo(storage)
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      }
    }
  }

  public static runHauler (creep: Creep) {
    if (creep.memory.working === true && creep.carry.energy === 0) {
      creep.memory.working = false
    } else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
      creep.memory.working = true
    }

    if (creep.memory.working) {
      creep.say('🚚', true)
      creep.memory.task = 'deposit'
      // Attempt to transfer energy to storage
      if (creep.room.storage === undefined) {
        throw new Error('creep.room.storage is undefined')
      }
      const creepTransfer = creep.transfer(creep.room.storage, RESOURCE_ENERGY)
      if (creepTransfer === ERR_NOT_IN_RANGE) {
        if (!creep.fatigue) {
          const moveRes = creep.travelTo(creep.room.storage)
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      }
    } else {
      creep.say('🗑️', true)
      const container: StructureContainer | null = Game.getObjectById(creep.memory.containerId)
      if (container === null) {
        throw new Error('Unable to locate container')
      }
      // Get energy from container
      const creepWithdraw = creep.withdraw(container, RESOURCE_ENERGY)
      if (creepWithdraw === ERR_NOT_IN_RANGE) {
        if (!creep.fatigue) {
          const moveRes = creep.travelTo(container)
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      }
    }
  }

  public static runPickupper (creep: Creep) {
    if (creep.memory.working === true && creep.store.getUsedCapacity() === 0) {
      creep.memory.working = false
    } else if (creep.memory.working === false && creep.store.getFreeCapacity() === 0) {
      creep.memory.working = true
    }

    // If there is no target room throw error as that is not supported currently
    if (!creep.memory.targetRoom) {
      throw new Error('No target room for pickupper' + creep.name)
    }

    if (!creep.memory.homeRoom) {
      throw new Error('No home room for pickupper')
    }

    /**
     *
     * @type {Room}
     */
    const homeRoom = Game.spawns[creep.memory.homeRoom].room
    if (creep.memory.working === false) {
      // If creep is already in room them harvest resources
      if (creep.room.name === creep.memory.targetRoom) {
        console.log('here')
        const ruinTargets = creep.room.find(FIND_RUINS, {
          // filter: (ruin) => Object.entries(ruin.store).length !== 0 && Object.entries()
          filter: function (ruin) {
            const entries = Object.entries(ruin.store)
            return entries.length !== 0 && entries.length !== 1 && ruin.store[RESOURCE_ENERGY] > 0
          }
        })
        if (ruinTargets.length !== 0) {
          creep.memory.task = 'gathering'
          creep.say('🗑️')
          const resources: ResourceConstant[] | null = _.filter(<ResourceConstant[]>Object.keys(ruinTargets[0].store), resource => ruinTargets[0].store[resource] > 0 && resource !== RESOURCE_ENERGY)
          // console.log("Target: " + ruinTargets[0] + "|| Resouce: " + resources[0] + "|| Ammount: " + ruinTargets[0].store[resources[0]])
          if (creep.withdraw(ruinTargets[0], resources[0]) === ERR_NOT_IN_RANGE) {
            creep.travelTo(ruinTargets[0])
          }
        } else {
          Game.flags.pickup.remove()
          creep.memory.working = true
        }
        // Otherwise move towards room
      } else {
        if (creep.ticksToLive === undefined) {
          throw new Error('ticksToLive is undefined')
        }
        if (creep.ticksToLive < 150) {
          creep.suicide()
        } else {
          creep.memory.task = 'travelling'
          creep.say('🏃')
          if (!creep.fatigue) {
            // /**
            //  *
            //  * @type {ExitConstant | ERR_NO_PATH | ERR_INVALID_ARGS}
            //  */
            // const exit = creep.room.findExitTo(creep.memory.targetRoom)
            const moveRes = creep.travelTo(Game.flags.pickup)
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      }
    } else {
      // If creep is in home room then deposit, otherwise move to home
      if (creep.room.name === homeRoom.name) {
        if (creep.room.storage === undefined) {
          throw new Error('creep.room.storage is undefined')
        }
        const creepTransfer = creep.transfer(creep.room.storage, <ResourceConstant>Object.keys(creep.store)[0])
        // console.log("Status(" + creep.name + ") - upgrade: " + creepTransfer)
        if (creepTransfer === ERR_NOT_IN_RANGE) {
          if (!creep.fatigue) {
            const moveRes = creep.travelTo(creep.room.storage)
            if (moveRes !== 0) {
              console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
            }
          }
        }
      } else {
        creep.say('🏃')
        if (!creep.fatigue) {
          if (homeRoom.storage === undefined) {
            throw new Error('creep.room.storage is undefined')
          }
          const moveRes = creep.travelTo(homeRoom.storage)
          if (moveRes !== 0) {
            console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
          }
        }
      }
    }

    // if(creep.room.storage && creep.room.find(FIND_RUINS, )) {
    //  if(creep.memory.working === true) {
    //    creep.memory.task "gathering"
    //    creep.say("Gathering")
    //  } else {

    //  }
    // } else {
    //  roleHarvester.run(creep)
    // }
    // if (creep.memory.working === true) {
    //   creep.memory.task = 'transfer'
    //   creep.say('P_T' + creep.carry.energy)

    // } else {
    //   creep.memory.task = 'harvest'
    //   creep.say('H_H' + creep.carry.energy)
    //   const storage = Game.spawns.Spawn1.room.storage
    //   if (!storage) {
    //     const source = creep.pos.findClosestByPath(FIND_SOURCES)
    //     const creepHarvest = creep.harvest(source)
    //     creep.memory.fromStorage = false
    //     // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
    //     if (creepHarvest === ERR_NOT_IN_RANGE) {
    //       if (!creep.fatigue) {
    //         const moveRes = creep.travelTo(source, { visualizePathStyle: {} })
    //         if (moveRes !== 0) {
    //           console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
    //         }
    //       }
    //     }
    //   } else {

    //     const creepWithdraw = creep.withdraw(storage, RESOURCE_ENERGY)
    //     creep.memory.fromStorage = true
    //     // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
    //     if (creepWithdraw === ERR_NOT_IN_RANGE) {
    //       if (!creep.fatigue) {
    //         const moveRes = creep.travelTo(storage, { visualizePathStyle: {} })
    //         if (moveRes !== 0) {
    //           console.log('Error(' + creep.name + '): Move Error - ' + moveRes)
    //         }
    //       }
    //     }
    //   }
    // }
  }

  public static runTraveller (creep: Creep) {
    const target = Game.flags.investigate
    if (target) {
      // console.log(enemies[0])
      // console.log('X: ' + enemies[0].pos.x + '| Y: ' + enemies[0].pos.y)
      creep.travelTo(target)
    } else if (Game.flags.traveler_wait) {
      // console.log('test')
      creep.travelTo(Game.flags.traveler_wait)
    }
  }
}
