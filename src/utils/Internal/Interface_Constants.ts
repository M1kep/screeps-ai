import {RCL1CreepLimit} from "../../Helpers/CreepLimits/RCL1CreepLimit";
import {RCL2CreepLimit} from "../../Helpers/CreepLimits/RCL2CreepLimit";
import {RCL3CreepLimit} from "../../Helpers/CreepLimits/RCL3CreepLimit";
import {RCL4CreepLimit} from "../../Helpers/CreepLimits/RCL4CreepLimit";
import {RCL5CreepLimit} from "../../Helpers/CreepLimits/RCL5CreepLimit";
import {RCL6CreepLimit} from "../../Helpers/CreepLimits/RCL6CreepLimit";
import {RCL7CreepLimit} from "../../Helpers/CreepLimits/RCL7CreepLimit";
import {RCL8CreepLimit} from "../../Helpers/CreepLimits/RCL8CreepLimit";
import {RoleHarvester} from "../../Helpers/Roles/RoleHarvester";
import {
  ROOM_STATE_RCL1,
  ROOM_STATE_RCL2,
  ROOM_STATE_RCL3,
  ROOM_STATE_RCL4,
  ROOM_STATE_RCL5,
  ROOM_STATE_RCL6, ROOM_STATE_RCL7, ROOM_STATE_RCL8
} from "./Constants";

// export const ROOM_STATE_CREEP_LIMITS: CreepSpawnLimits[] = [
//   new RCL1CreepLimit(),
//   new RCL2CreepLimit(),
//   new RCL3CreepLimit(),
//   new RCL4CreepLimit(),
//   new RCL5CreepLimit(),
//   new RCL6CreepLimit(),
//   new RCL7CreepLimit(),
//   new RCL8CreepLimit()
// ]

export const ROOM_STATE_CREEP_LIMITS: {[index: string]: CreepSpawnLimits} = {}
ROOM_STATE_CREEP_LIMITS[ROOM_STATE_RCL1] = new RCL1CreepLimit()
ROOM_STATE_CREEP_LIMITS[ROOM_STATE_RCL2] = new RCL2CreepLimit()
ROOM_STATE_CREEP_LIMITS[ROOM_STATE_RCL3] = new RCL3CreepLimit()
ROOM_STATE_CREEP_LIMITS[ROOM_STATE_RCL4] = new RCL4CreepLimit()
ROOM_STATE_CREEP_LIMITS[ROOM_STATE_RCL5] = new RCL5CreepLimit()
ROOM_STATE_CREEP_LIMITS[ROOM_STATE_RCL6] = new RCL6CreepLimit()
ROOM_STATE_CREEP_LIMITS[ROOM_STATE_RCL7] = new RCL7CreepLimit()
ROOM_STATE_CREEP_LIMITS[ROOM_STATE_RCL8] = new RCL8CreepLimit()

export const CREEP_ROLE_MANAGER_ROLES: CreepRoleManager[] = [
  new RoleHarvester(),

]
