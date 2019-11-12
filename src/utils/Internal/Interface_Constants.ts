import {
  ROLE_ATTACKER,
  ROLE_BUILDER,
  ROLE_HARVESTER,
  ROLE_HAULER,
  ROLE_MINER,
  ROLE_PICKUPPER,
  ROLE_REPAIRER,
  ROLE_TRAVELLER,
  ROLE_UPGRADER,
  ROOM_STATE_RCL1,
  ROOM_STATE_RCL2,
  ROOM_STATE_RCL3,
  ROOM_STATE_RCL4,
  ROOM_STATE_RCL5,
  ROOM_STATE_RCL6, ROOM_STATE_RCL7, ROOM_STATE_RCL8
} from "./Constants";
import {RCL1CreepLimit} from "../../Helpers/CreepLimits/RCL1CreepLimit";
import {RCL2CreepLimit} from "../../Helpers/CreepLimits/RCL2CreepLimit";
import {RCL3CreepLimit} from "../../Helpers/CreepLimits/RCL3CreepLimit";
import {RCL4CreepLimit} from "../../Helpers/CreepLimits/RCL4CreepLimit";
import {RCL5CreepLimit} from "../../Helpers/CreepLimits/RCL5CreepLimit";
import {RCL6CreepLimit} from "../../Helpers/CreepLimits/RCL6CreepLimit";
import {RCL7CreepLimit} from "../../Helpers/CreepLimits/RCL7CreepLimit";
import {RCL8CreepLimit} from "../../Helpers/CreepLimits/RCL8CreepLimit";
import {RoleHarvester} from "../../Helpers/Roles/RoleHarvester";
import {RoleUpgrader} from "../../Helpers/Roles/RoleUpgrader";
import {RoleTraveller} from "../../Helpers/Roles/RoleTraveller";
import {RoleRepairer} from "../../Helpers/Roles/RoleRepairer";
import {RolePickupper} from "../../Helpers/Roles/RolePickupper";
import {RoleMiner} from "../../Helpers/Roles/RoleMiner";
import {RoleHauler} from "../../Helpers/Roles/RoleHauler";
import {RoleBuilder} from "../../Helpers/Roles/RoleBuilder";
import {RoleAttacker} from "../../Helpers/Roles/RoleAttacker";


export const ROOM_STATE_CREEP_LIMITS: { [index: string]: CreepSpawnLimits } = {}
ROOM_STATE_CREEP_LIMITS[ROOM_STATE_RCL1] = new RCL1CreepLimit()
ROOM_STATE_CREEP_LIMITS[ROOM_STATE_RCL2] = new RCL2CreepLimit()
ROOM_STATE_CREEP_LIMITS[ROOM_STATE_RCL3] = new RCL3CreepLimit()
ROOM_STATE_CREEP_LIMITS[ROOM_STATE_RCL4] = new RCL4CreepLimit()
ROOM_STATE_CREEP_LIMITS[ROOM_STATE_RCL5] = new RCL5CreepLimit()
ROOM_STATE_CREEP_LIMITS[ROOM_STATE_RCL6] = new RCL6CreepLimit()
ROOM_STATE_CREEP_LIMITS[ROOM_STATE_RCL7] = new RCL7CreepLimit()
ROOM_STATE_CREEP_LIMITS[ROOM_STATE_RCL8] = new RCL8CreepLimit()

export const CREEP_ROLE_MANAGERS: { [index: string]: CreepRoleManager } = {}
CREEP_ROLE_MANAGERS[ROLE_UPGRADER] = new RoleUpgrader()
CREEP_ROLE_MANAGERS[ROLE_TRAVELLER] = new RoleTraveller()
CREEP_ROLE_MANAGERS[ROLE_REPAIRER] = new RoleRepairer()
CREEP_ROLE_MANAGERS[ROLE_PICKUPPER] = new RolePickupper()
CREEP_ROLE_MANAGERS[ROLE_MINER] = new RoleMiner()
CREEP_ROLE_MANAGERS[ROLE_HAULER] = new RoleHauler()
CREEP_ROLE_MANAGERS[ROLE_HARVESTER] = new RoleHarvester()
CREEP_ROLE_MANAGERS[ROLE_BUILDER] = new RoleBuilder()
CREEP_ROLE_MANAGERS[ROLE_ATTACKER] = new RoleAttacker()
