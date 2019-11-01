StructureTower.prototype.defend = function () {
  // find closes hostile creep
  const target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
  // if one is found...
  if (target !== undefined) {
    this.attack(target)
  }
}
