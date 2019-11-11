import {RCL1CreepLimit} from "../../Helpers/CreepLimits/RCL1CreepLimit";
import {RCL2CreepLimit} from "../../Helpers/CreepLimits/RCL2CreepLimit";
import {RCL3CreepLimit} from "../../Helpers/CreepLimits/RCL3CreepLimit";
import {RCL4CreepLimit} from "../../Helpers/CreepLimits/RCL4CreepLimit";
import {RCL5CreepLimit} from "../../Helpers/CreepLimits/RCL5CreepLimit";
import {RCL6CreepLimit} from "../../Helpers/CreepLimits/RCL6CreepLimit";
import {RCL7CreepLimit} from "../../Helpers/CreepLimits/RCL7CreepLimit";
import {RCL8CreepLimit} from "../../Helpers/CreepLimits/RCL8CreepLimit";

export const ROOM_STATE_CREEP_LIMITS: CreepSpawnLimits[] = [
  new RCL1CreepLimit(),
  new RCL2CreepLimit(),
  new RCL3CreepLimit(),
  new RCL4CreepLimit(),
  new RCL5CreepLimit(),
  new RCL6CreepLimit(),
  new RCL7CreepLimit(),
  new RCL8CreepLimit()
]
