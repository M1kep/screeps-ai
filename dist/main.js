'use strict';

const __PROFILER_ENABLED__ = true

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * To start using Traveler, require it in main.js:
 * Example: var Traveler = require('Traveler.js');
 */
class Traveler {
    /**
     * move creep to destination
     * @param creep
     * @param destination
     * @param options
     * @returns {number}
     */
    static travelTo(creep, destination, options = {}) {
        // uncomment if you would like to register hostile rooms entered
        // this.updateRoomStatus(creep.room);
        if (!destination) {
            return ERR_INVALID_ARGS;
        }
        if (creep.fatigue > 0) {
            Traveler.circle(creep.pos, 'aqua', 0.3);
            return ERR_TIRED;
        }
        destination = this.normalizePos(destination);
        // manage case where creep is nearby destination
        const rangeToDestination = creep.pos.getRangeTo(destination);
        if (options.range && rangeToDestination <= options.range) {
            return OK;
        }
        else if (rangeToDestination <= 1) {
            if (rangeToDestination === 1 && !options.range) {
                const direction = creep.pos.getDirectionTo(destination);
                if (options.returnData) {
                    options.returnData.nextPos = destination;
                    options.returnData.path = direction.toString();
                }
                return creep.move(direction);
            }
            return OK;
        }
        // initialize data object
        if (!creep.memory._trav) {
            // @ts-ignore
            delete creep.memory._travel;
            creep.memory._trav = {};
        }
        const travelData = creep.memory._trav;
        const state = this.deserializeState(travelData, destination);
        // uncomment to visualize destination
        // this.circle(destination.pos, "orange");
        // check if creep is stuck
        if (this.isStuck(creep, state)) {
            state.stuckCount++;
            Traveler.circle(creep.pos, 'magenta', state.stuckCount * 0.2);
        }
        else {
            state.stuckCount = 0;
        }
        // handle case where creep is stuck
        if (!options.stuckValue) {
            options.stuckValue = DEFAULT_STUCK_VALUE;
        }
        if (state.stuckCount >= options.stuckValue && Math.random() > 0.5) {
            options.ignoreCreeps = false;
            options.freshMatrix = true;
            delete travelData.path;
        }
        // TODO:handle case where creep moved by some other function, but destination is still the same
        // delete path cache if destination is different
        if (!this.samePos(state.destination, destination)) {
            if (options.movingTarget && state.destination.isNearTo(destination)) {
                travelData.path += state.destination.getDirectionTo(destination);
                state.destination = destination;
            }
            else {
                delete travelData.path;
            }
        }
        if (options.repath && Math.random() < options.repath) {
            // add some chance that you will find a new path randomly
            delete travelData.path;
        }
        // pathfinding
        let newPath = false;
        if (!travelData.path) {
            newPath = true;
            if (creep.spawning) {
                return ERR_BUSY;
            }
            state.destination = destination;
            const cpu = Game.cpu.getUsed();
            const ret = this.findTravelPath(creep.pos, destination, options);
            const cpuUsed = Game.cpu.getUsed() - cpu;
            // @ts-ignore
            state.cpu = _.round(cpuUsed + state.cpu);
            if (state.cpu > REPORT_CPU_THRESHOLD) {
                // see note at end of file for more info on this
                console.log(`TRAVELER: heavy cpu use: ${creep.name}, cpu: ${state.cpu} origin: ${creep.pos}, dest: ${destination}`);
            }
            let color = 'orange';
            if (ret.incomplete) {
                // uncommenting this is a great way to diagnose creep behavior issues
                // console.log(`TRAVELER: incomplete path for ${creep.name}`);
                color = 'red';
            }
            if (options.returnData) {
                options.returnData.pathfinderReturn = ret;
            }
            travelData.path = Traveler.serializePath(creep.pos, ret.path, color);
            state.stuckCount = 0;
        }
        this.serializeState(creep, destination, state, travelData);
        if (!travelData.path || travelData.path.length === 0) {
            return ERR_NO_PATH;
        }
        // consume path
        if (state.stuckCount === 0 && !newPath) {
            travelData.path = travelData.path.substr(1);
        }
        const nextDirection = parseInt(travelData.path[0], 10);
        if (options.returnData) {
            if (nextDirection) {
                const nextPos = Traveler.positionAtDirection(creep.pos, nextDirection);
                if (nextPos) {
                    options.returnData.nextPos = nextPos;
                }
            }
            options.returnData.state = state;
            options.returnData.path = travelData.path;
        }
        // @ts-ignore
        return creep.move(nextDirection);
    }
    /**
     * make position objects consistent so that either can be used as an argument
     * @param destination
     * @returns {any}
     */
    static normalizePos(destination) {
        if (!(destination instanceof RoomPosition)) {
            return destination.pos;
        }
        return destination;
    }
    /**
     * check if room should be avoided by findRoute algorithm
     * @param roomName
     * @returns {RoomMemory|number}
     */
    static checkAvoid(roomName) {
        return Memory.rooms && Memory.rooms[roomName] && Memory.rooms[roomName].avoid;
    }
    /**
     * check if a position is an exit
     * @param pos
     * @returns {boolean}
     */
    static isExit(pos) {
        return pos.x === 0 || pos.y === 0 || pos.x === 49 || pos.y === 49;
    }
    /**
     * check two coordinates match
     * @param pos1
     * @param pos2
     * @returns {boolean}
     */
    static sameCoord(pos1, pos2) {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }
    /**
     * check if two positions match
     * @param pos1
     * @param pos2
     * @returns {boolean}
     */
    static samePos(pos1, pos2) {
        return this.sameCoord(pos1, pos2) && pos1.roomName === pos2.roomName;
    }
    /**
     * draw a circle at position
     * @param pos
     * @param color
     * @param opacity
     */
    static circle(pos, color, opacity) {
        new RoomVisual(pos.roomName).circle(pos, {
            radius: 0.45,
            fill: 'transparent',
            stroke: color,
            strokeWidth: 0.15,
            opacity: opacity
        });
    }
    /**
     * update memory on whether a room should be avoided based on controller owner
     * @param room
     */
    static updateRoomStatus(room) {
        if (!room) {
            return;
        }
        if (room.controller) {
            if (room.controller.owner && !room.controller.my) {
                room.memory.avoid = true;
            }
            else {
                delete room.memory.avoid;
            }
        }
    }
    /**
     * find a path from origin to destination
     * @param origin
     * @param destination
     * @param options
     * @returns {PathfinderReturn}
     */
    static findTravelPath(origin, destination, options = {}) {
        // @ts-ignore
        _.defaults(options, {
            ignoreCreeps: true,
            maxOps: DEFAULT_MAXOPS,
            range: 1
        });
        if (options.movingTarget) {
            options.range = 0;
        }
        origin = this.normalizePos(origin);
        destination = this.normalizePos(destination);
        const originRoomName = origin.roomName;
        const destRoomName = destination.roomName;
        // check to see whether findRoute should be used
        const roomDistance = Game.map.getRoomLinearDistance(origin.roomName, destination.roomName);
        let allowedRooms = options.route;
        if (!allowedRooms && (options.useFindRoute || (options.useFindRoute === undefined && roomDistance > 2))) {
            const route = this.findRoute(origin.roomName, destination.roomName, options);
            if (route) {
                allowedRooms = route;
            }
        }
        const callback = (roomName) => {
            if (allowedRooms) {
                if (!allowedRooms[roomName]) {
                    return false;
                }
            }
            else if (!options.allowHostile && Traveler.checkAvoid(roomName) &&
                roomName !== destRoomName && roomName !== originRoomName) {
                return false;
            }
            let matrix;
            const room = Game.rooms[roomName];
            if (room) {
                if (options.ignoreStructures) {
                    matrix = new PathFinder.CostMatrix();
                    if (!options.ignoreCreeps) {
                        Traveler.addCreepsToMatrix(room, matrix);
                    }
                }
                else if (options.ignoreCreeps || roomName !== originRoomName) {
                    matrix = this.getStructureMatrix(room, options.freshMatrix);
                }
                else {
                    matrix = this.getCreepMatrix(room);
                }
                if (options.obstacles) {
                    matrix = matrix.clone();
                    for (const obstacle of options.obstacles) {
                        if (obstacle.pos.roomName !== roomName) {
                            continue;
                        }
                        matrix.set(obstacle.pos.x, obstacle.pos.y, 0xff);
                    }
                }
            }
            if (options.roomCallback) {
                if (!matrix) {
                    matrix = new PathFinder.CostMatrix();
                }
                const outcome = options.roomCallback(roomName, matrix.clone());
                if (outcome !== undefined) {
                    return outcome;
                }
            }
            return matrix;
        };
        let ret = PathFinder.search(origin, { pos: destination, range: options.range }, {
            maxOps: options.maxOps,
            maxRooms: options.maxRooms,
            plainCost: options.offRoad ? 1 : options.ignoreRoads ? 1 : 2,
            swampCost: options.offRoad ? 1 : options.ignoreRoads ? 5 : 10,
            roomCallback: callback
        });
        if (ret.incomplete && options.ensurePath) {
            if (options.useFindRoute === undefined) {
                // handle case where pathfinder failed at a short distance due to not using findRoute
                // can happen for situations where the creep would have to take an uncommonly indirect path
                // options.allowedRooms and options.routeCallback can also be used to handle this situation
                if (roomDistance <= 2) {
                    console.log('TRAVELER: path failed without findroute, trying with options.useFindRoute = true');
                    console.log(`from: ${origin}, destination: ${destination}`);
                    options.useFindRoute = true;
                    ret = this.findTravelPath(origin, destination, options);
                    console.log(`TRAVELER: second attempt was ${ret.incomplete ? 'not ' : ''}successful`);
                    return ret;
                }
                // TODO: handle case where a wall or some other obstacle is blocking the exit assumed by findRoute
            }
        }
        return ret;
    }
    /**
     * find a viable sequence of rooms that can be used to narrow down pathfinder's search algorithm
     * @param origin
     * @param destination
     * @param options
     * @returns {{}}
     */
    static findRoute(origin, destination, options = {}) {
        const restrictDistance = options.restrictDistance || Game.map.getRoomLinearDistance(origin, destination) + 10;
        const allowedRooms = { [origin]: true, [destination]: true };
        let highwayBias = 1;
        if (options.preferHighway) {
            highwayBias = 2.5;
            if (options.highwayBias) {
                highwayBias = options.highwayBias;
            }
        }
        const ret = Game.map.findRoute(origin, destination, {
            routeCallback: (roomName) => {
                if (options.routeCallback) {
                    const outcome = options.routeCallback(roomName);
                    if (outcome !== undefined) {
                        return outcome;
                    }
                }
                const rangeToRoom = Game.map.getRoomLinearDistance(origin, roomName);
                if (rangeToRoom > restrictDistance) {
                    // room is too far out of the way
                    return Number.POSITIVE_INFINITY;
                }
                if (!options.allowHostile && Traveler.checkAvoid(roomName) &&
                    roomName !== destination && roomName !== origin) {
                    // room is marked as "avoid" in room memory
                    return Number.POSITIVE_INFINITY;
                }
                let parsed;
                if (options.preferHighway) {
                    parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                    const isHighway = (parsed[1] % 10 === 0) || (parsed[2] % 10 === 0);
                    if (isHighway) {
                        return 1;
                    }
                }
                // SK rooms are avoided when there is no vision in the room, harvested-from SK rooms are allowed
                if (!options.allowSK && !Game.rooms[roomName]) {
                    if (!parsed) {
                        parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                    }
                    const fMod = parsed[1] % 10;
                    const sMod = parsed[2] % 10;
                    const isSK = !(fMod === 5 && sMod === 5) &&
                        ((fMod >= 4) && (fMod <= 6)) &&
                        ((sMod >= 4) && (sMod <= 6));
                    if (isSK) {
                        return 10 * highwayBias;
                    }
                }
                return highwayBias;
            }
        });
        // @ts-ignore
        if (!_.isArray(ret)) {
            console.log(`couldn't findRoute to ${destination}`);
            return;
        }
        for (const value of ret) {
            allowedRooms[value.room] = true;
        }
        return allowedRooms;
    }
    /**
     * check how many rooms were included in a route returned by findRoute
     * @param origin
     * @param destination
     * @returns {number}
     */
    static routeDistance(origin, destination) {
        const linearDistance = Game.map.getRoomLinearDistance(origin, destination);
        if (linearDistance >= 32) {
            return linearDistance;
        }
        const allowedRooms = this.findRoute(origin, destination);
        if (allowedRooms) {
            return Object.keys(allowedRooms).length;
        }
    }
    /**
     * build a cost matrix based on structures in the room. Will be cached for more than one tick. Requires vision.
     * @param room
     * @param freshMatrix
     * @returns {any}
     */
    static getStructureMatrix(room, freshMatrix) {
        if (!this.structureMatrixCache[room.name] || (freshMatrix && Game.time !== this.structureMatrixTick)) {
            this.structureMatrixTick = Game.time;
            const matrix = new PathFinder.CostMatrix();
            this.structureMatrixCache[room.name] = Traveler.addStructuresToMatrix(room, matrix, 1);
        }
        return this.structureMatrixCache[room.name];
    }
    /**
     * build a cost matrix based on creeps and structures in the room. Will be cached for one tick. Requires vision.
     * @param room
     * @returns {any}
     */
    static getCreepMatrix(room) {
        if (!this.creepMatrixCache[room.name] || Game.time !== this.creepMatrixTick) {
            this.creepMatrixTick = Game.time;
            this.creepMatrixCache[room.name] = Traveler.addCreepsToMatrix(room, this.getStructureMatrix(room, true).clone());
        }
        return this.creepMatrixCache[room.name];
    }
    /**
     * add structures to matrix so that impassible structures can be avoided and roads given a lower cost
     * @param room
     * @param matrix
     * @param roadCost
     * @returns {CostMatrix}
     */
    static addStructuresToMatrix(room, matrix, roadCost) {
        const impassibleStructures = [];
        for (const structure of room.find(FIND_STRUCTURES)) {
            if (structure instanceof StructureRampart) {
                if (!structure.my && !structure.isPublic) {
                    impassibleStructures.push(structure);
                }
            }
            else if (structure instanceof StructureRoad) {
                matrix.set(structure.pos.x, structure.pos.y, roadCost);
            }
            else if (structure instanceof StructureContainer) {
                matrix.set(structure.pos.x, structure.pos.y, 5);
            }
            else {
                impassibleStructures.push(structure);
            }
        }
        // @ts-ignore
        for (const site of room.find(FIND_MY_CONSTRUCTION_SITES)) {
            if (site.structureType === STRUCTURE_CONTAINER || site.structureType === STRUCTURE_ROAD ||
                site.structureType === STRUCTURE_RAMPART) {
                continue;
            }
            matrix.set(site.pos.x, site.pos.y, 0xff);
        }
        for (const structure of impassibleStructures) {
            matrix.set(structure.pos.x, structure.pos.y, 0xff);
        }
        return matrix;
    }
    /**
     * add creeps to matrix so that they will be avoided by other creeps
     * @param room
     * @param matrix
     * @returns {CostMatrix}
     */
    static addCreepsToMatrix(room, matrix) {
        // @ts-ignore
        room.find(FIND_CREEPS).forEach((creep) => matrix.set(creep.pos.x, creep.pos.y, 0xff));
        return matrix;
    }
    /**
     * serialize a path, traveler style. Returns a string of directions.
     * @param startPos
     * @param path
     * @param color
     * @returns {string}
     */
    static serializePath(startPos, path, color = 'orange') {
        let serializedPath = '';
        let lastPosition = startPos;
        this.circle(startPos, color);
        for (const position of path) {
            if (position.roomName === lastPosition.roomName) {
                new RoomVisual(position.roomName)
                    .line(position, lastPosition, { color: color, lineStyle: 'dashed' });
                serializedPath += lastPosition.getDirectionTo(position);
            }
            lastPosition = position;
        }
        return serializedPath;
    }
    /**
     * returns a position at a direction relative to origin
     * @param origin
     * @param direction
     * @returns {RoomPosition}
     */
    static positionAtDirection(origin, direction) {
        const offsetX = [0, 0, 1, 1, 1, 0, -1, -1, -1];
        const offsetY = [0, -1, -1, 0, 1, 1, 1, 0, -1];
        const x = origin.x + offsetX[direction];
        const y = origin.y + offsetY[direction];
        if (x > 49 || x < 0 || y > 49 || y < 0) {
            return;
        }
        return new RoomPosition(x, y, origin.roomName);
    }
    static deserializeState(travelData, destination) {
        const state = {};
        if (travelData.state) {
            state.lastCoord = { x: travelData.state[STATE_PREV_X], y: travelData.state[STATE_PREV_Y] };
            state.cpu = travelData.state[STATE_CPU];
            state.stuckCount = travelData.state[STATE_STUCK];
            state.destination = new RoomPosition(travelData.state[STATE_DEST_X], travelData.state[STATE_DEST_Y], travelData.state[STATE_DEST_ROOMNAME]);
        }
        else {
            state.cpu = 0;
            state.destination = destination;
        }
        return state;
    }
    static serializeState(creep, destination, state, travelData) {
        travelData.state = [creep.pos.x, creep.pos.y, state.stuckCount, state.cpu, destination.x, destination.y,
            destination.roomName];
    }
    static isStuck(creep, state) {
        let stuck = false;
        if (state.lastCoord !== undefined) {
            if (this.sameCoord(creep.pos, state.lastCoord)) {
                // didn't move
                stuck = true;
            }
            else if (this.isExit(creep.pos) && this.isExit(state.lastCoord)) {
                // moved against exit
                stuck = true;
            }
        }
        return stuck;
    }
}
Traveler.structureMatrixCache = {};
Traveler.creepMatrixCache = {};
// this might be higher than you wish, setting it lower is a great way to diagnose creep behavior issues. When creeps
// need to repath to often or they aren't finding valid paths, it can sometimes point to problems elsewhere in your code
const REPORT_CPU_THRESHOLD = 1000;
const DEFAULT_MAXOPS = 20000;
const DEFAULT_STUCK_VALUE = 2;
const STATE_PREV_X = 0;
const STATE_PREV_Y = 1;
const STATE_STUCK = 2;
const STATE_CPU = 3;
const STATE_DEST_X = 4;
const STATE_DEST_Y = 5;
const STATE_DEST_ROOMNAME = 6;
// assigns a function to Creep.prototype: creep.travelTo(destination)
Creep.prototype.travelTo = function (destination, options) {
    return Traveler.travelTo(this, destination, options);
};

/* tslint:disable:ban-types */
function init() {
    const defaults = {
        data: {},
        total: 0
    };
    if (!Memory.profiler) {
        Memory.profiler = defaults;
    }
    const cli = {
        clear() {
            const running = isEnabled();
            Memory.profiler = defaults;
            if (running) {
                Memory.profiler.start = Game.time;
            }
            return 'Profiler Memory cleared';
        },
        output() {
            outputProfilerData();
            return 'Done';
        },
        start() {
            Memory.profiler.start = Game.time;
            return 'Profiler started';
        },
        status() {
            if (isEnabled()) {
                return 'Profiler is running';
            }
            return 'Profiler is stopped';
        },
        stop() {
            if (!isEnabled()) {
                return;
            }
            const timeRunning = Game.time - Memory.profiler.start;
            Memory.profiler.total += timeRunning;
            delete Memory.profiler.start;
            return 'Profiler stopped';
        },
        toString() {
            return 'Profiler.start() - Starts the profiler\n' +
                'Profiler.stop() - Stops/Pauses the profiler\n' +
                'Profiler.status() - Returns whether is profiler is currently running or not\n' +
                'Profiler.output() - Pretty-prints the collected profiler data to the console\n' +
                this.status();
        }
    };
    return cli;
}
function wrapFunction(obj, key, className) {
    const descriptor = Reflect.getOwnPropertyDescriptor(obj, key);
    if (!descriptor || descriptor.get || descriptor.set) {
        return;
    }
    if (key === 'constructor') {
        return;
    }
    const originalFunction = descriptor.value;
    if (!originalFunction || typeof originalFunction !== 'function') {
        return;
    }
    // set a key for the object in memory
    if (!className) {
        className = obj.constructor ? `${obj.constructor.name}` : '';
    }
    // @ts-ignore
    const memKey = className + `:${key}`;
    // set a tag so we don't wrap a function twice
    // @ts-ignore
    const savedName = `__${key}__`;
    if (Reflect.has(obj, savedName)) {
        return;
    }
    Reflect.set(obj, savedName, originalFunction);
    /// ////////
    Reflect.set(obj, key, function (...args) {
        if (isEnabled()) {
            const start = Game.cpu.getUsed();
            const result = originalFunction.apply(this, args);
            const end = Game.cpu.getUsed();
            record(memKey, end - start);
            return result;
        }
        return originalFunction.apply(this, args);
    });
}
function profile(target, key, _descriptor) {
    // eslint-disable-next-line no-undef
    if (!__PROFILER_ENABLED__) {
        return;
    }
    if (key) {
        // case of method decorator
        wrapFunction(target, key);
        return;
    }
    // case of class decorator
    const ctor = target;
    if (!ctor.prototype) {
        return;
    }
    const className = ctor.name;
    Reflect.ownKeys(ctor.prototype).forEach((k) => {
        wrapFunction(ctor.prototype, k, className);
    });
}
function isEnabled() {
    return Memory.profiler.start !== undefined;
}
function record(key, time) {
    // @ts-ignore
    if (!Memory.profiler.data[key]) {
        // @ts-ignore
        Memory.profiler.data[key] = {
            calls: 0,
            time: 0
        };
    }
    // @ts-ignore
    Memory.profiler.data[key].calls++;
    // @ts-ignore
    Memory.profiler.data[key].time += time;
}
function outputProfilerData() {
    let totalTicks = Memory.profiler.total;
    if (Memory.profiler.start) {
        totalTicks += Game.time - Memory.profiler.start;
    }
    /// ////
    // Process data
    let totalCpu = 0; // running count of average total CPU use per tick
    let calls;
    let time;
    let result;
    const data = Reflect.ownKeys(Memory.profiler.data).map((key) => {
        // @ts-ignore
        calls = Memory.profiler.data[key].calls;
        // @ts-ignore
        time = Memory.profiler.data[key].time;
        result = {};
        // @ts-ignore
        result.name = `${key}`;
        result.calls = calls;
        result.cpuPerCall = time / calls;
        result.callsPerTick = calls / totalTicks;
        result.cpuPerTick = time / totalTicks;
        totalCpu += result.cpuPerTick;
        return result;
    });
    data.sort((lhs, rhs) => rhs.cpuPerTick - lhs.cpuPerTick);
    /// ////
    // Format data
    let output = '';
    // get function name max length
    const longestName = (_.max(data, (d) => d.name.length)).name.length + 2;
    /// / Header line
    output += _.padRight('Function', longestName);
    output += _.padLeft('Tot Calls', 12);
    output += _.padLeft('CPU/Call', 12);
    output += _.padLeft('Calls/Tick', 12);
    output += _.padLeft('CPU/Tick', 12);
    output += _.padLeft('% of Tot\n', 12);
    /// /  Data lines
    data.forEach((d) => {
        output += _.padRight(`${d.name}`, longestName);
        output += _.padLeft(`${d.calls}`, 12);
        output += _.padLeft(`${d.cpuPerCall.toFixed(2)}ms`, 12);
        output += _.padLeft(`${d.callsPerTick.toFixed(2)}`, 12);
        output += _.padLeft(`${d.cpuPerTick.toFixed(2)}ms`, 12);
        output += _.padLeft(`${(d.cpuPerTick / totalCpu * 100).toFixed(0)} %\n`, 12);
    });
    /// / Footer line
    output += `${totalTicks} total ticks measured`;
    output += `\t\t\t${totalCpu.toFixed(2)} average CPU profiled per tick`;
    console.log(output);
}
// debugging
// function printObject(obj: object) {
//   const name = obj.constructor ? obj.constructor.name : (obj as any).name;
//   console.log("  Keys of :", name, ":");
//   Reflect.ownKeys(obj).forEach((k) => {
//     try {
//       console.log(`    ${k}: ${Reflect.get(obj, k)}`);
//     } catch (e) {
//       // nothing
//     }
//   });
// }

class TowerHelper {
    static runDefense(tower) {
        const target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target !== null) {
            tower.attack(target);
        }
    }
}

class SpawnHelper {
    static getSpawnCost(parts) {
        let partsCost = 0;
        parts.forEach((part) => partsCost += BODYPART_COST[part]);
        return partsCost;
    }
    static createCustomCreep(spawn, energy, role, parts, memory) {
        if (parts === undefined) {
            parts = [WORK, CARRY, MOVE];
        }
        const numParts = parts.length;
        const partsCost = this.getSpawnCost(parts);
        memory = Object.assign({ role: role, working: false, homeRoom: this.name }, memory);
        const totalParts = Math.floor(energy / partsCost);
        const body = [];
        if (totalParts === 1) {
            body.push(MOVE);
        }
        for (let i = 0; i < numParts; i++) {
            for (let j = 0; j < totalParts; j++) {
                body.push(parts[i]);
            }
        }
        return spawn.createCreep(body, undefined, memory);
    }
    static createMiner(spawn, sourceId, containerId) {
        return spawn.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], undefined, {
            role: 'miner',
            sourceId: sourceId,
            containerId: containerId
        });
    }
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

var RoleManager_1;
let RoleManager = RoleManager_1 = class RoleManager {
    static runMiner(creep) {
        if (!creep.spawning) {
            /**
             * @type {Source}
             */
            const source = Game.getObjectById(creep.memory.sourceId);
            /**
             * @type {StructureContainer}
             */
            const container = Game.getObjectById(creep.memory.containerId);
            if (container === null) {
                throw new Error('Miner containerId null.');
            }
            // If on the container then harvest energy
            //    If no energy available, repair container if needed
            // Otherwise Move to container
            if (creep.pos.isEqualTo(container.pos)) {
                if (source !== null && source.energy > 0) {
                    creep.say('⛏️', true);
                    creep.harvest(source);
                }
                else if (container.hits < container.hitsMax && creep.store.energy > 0) {
                    creep.say('⚒️', true);
                    creep.repair(container);
                }
            }
            else {
                if (!creep.fatigue) {
                    creep.say('🏃', true);
                    const moveRes = creep.travelTo(container);
                    if (moveRes !== 0) {
                        console.log('Error(' + creep.name + '): Move Error - ' + moveRes);
                    }
                }
            }
        }
    }
    static runHarvester(creep) {
        if (creep.memory.working === true && creep.carry.energy === 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
            creep.memory.working = true;
        }
        if (creep.memory.working === true) {
            creep.memory.task = 'transfer';
            creep.say('H_T' + creep.carry.energy);
            // Get Spawn and extensions that need power
            const structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => (s.structureType === STRUCTURE_SPAWN ||
                    s.structureType === STRUCTURE_EXTENSION ||
                    s.structureType === STRUCTURE_TOWER) &&
                    s.energy < s.energyCapacity
            });
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
                console.log('hit again');
                const creepTransfer = creep.transfer(structure, RESOURCE_ENERGY);
                console.log('Status(' + creep.name + ') - transfer: ' + creepTransfer);
                if (creepTransfer === ERR_NOT_IN_RANGE) {
                    if (!creep.fatigue) {
                        const moveRes = creep.travelTo(structure);
                        if (moveRes !== 0) {
                            console.log('Error(' + creep.name + '): Move Error - ' + moveRes);
                        }
                    }
                }
            }
        }
        else {
            creep.memory.task = 'harvest';
            creep.say('H_H' + creep.carry.energy);
            const storage = Game.spawns.Spawn1.room.storage;
            // If there is no storage fall back to harvesting sources
            if (!storage) {
                const source = creep.pos.findClosestByPath(FIND_SOURCES);
                if (source !== null) {
                    const creepHarvest = creep.harvest(source);
                    // creep.memory.fromStorage = false
                    // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
                    if (creepHarvest === ERR_NOT_IN_RANGE) {
                        if (!creep.fatigue) {
                            const moveRes = creep.travelTo(source);
                            if (moveRes !== 0) {
                                console.log('Error(' + creep.name + '): Move Error - ' + moveRes);
                            }
                        }
                    }
                }
                // Otherwise, get energy from storage
            }
            else {
                const creepWithdraw = creep.withdraw(storage, RESOURCE_ENERGY);
                // creep.memory.fromStorage = true
                if (creepWithdraw === ERR_NOT_IN_RANGE) {
                    if (!creep.fatigue) {
                        const moveRes = creep.travelTo(storage);
                        if (moveRes !== 0) {
                            console.log('Error(' + creep.name + '): Move Error - ' + moveRes);
                        }
                    }
                }
            }
        }
    }
    static runAttacker(creep) {
        const enemies = creep.room.find(FIND_HOSTILE_CREEPS);
        if (!Array.isArray(enemies) || enemies.length) {
            // console.log(enemies[0])
            // console.log('X: ' + enemies[0].pos.x + '| Y: ' + enemies[0].pos.y)
            if (enemies[0].owner.username !== 'Orlet') {
                // console.log(enemies[0].Owner)
                creep.travelTo(enemies[0]);
                creep.attack(enemies[0]);
            }
            else if (Game.flags.attack_wait) {
                creep.travelTo(Game.flags.attack_wait);
            }
        }
        else if (Game.flags.attack_wait) {
            creep.travelTo(Game.flags.attack_wait);
        }
    }
    static runBuilder(creep) {
        if (creep.memory.working === true && creep.carry.energy === 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
            creep.memory.working = true;
        }
        if (creep.memory.working === true) {
            creep.memory.task = 'transfer';
            creep.say('B_T' + creep.carry.energy);
            // Check for construction sites and build them if possible
            const constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (constructionSite !== null) {
                const creepBuild = creep.build(constructionSite);
                // console.log("Status(" + creep.name + ") - transfer: " + creepBuild + " - " + constructionSite.pos.x + ":" + constructionSite.pos.y)
                if (creepBuild === ERR_NOT_IN_RANGE) {
                    if (!creep.fatigue) {
                        const moveRes = creep.travelTo(constructionSite);
                        if (moveRes !== 0) {
                            console.log('Error(' + creep.name + '): Move Error - ' + moveRes);
                        }
                    }
                }
            }
            else {
                this.runUpgrader(creep);
                // roleHarvester.run(creep)
            }
        }
        else {
            creep.memory.task = 'harvest';
            creep.say('B_H' + creep.carry.energy);
            const storage = Game.spawns.Spawn1.room.storage;
            // If there isn't storage then withdraw from sources
            if (!storage) {
                const source = creep.pos.findClosestByPath(FIND_SOURCES);
                if (source !== null) {
                    const creepHarvest = creep.harvest(source);
                    // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
                    if (creepHarvest === ERR_NOT_IN_RANGE) {
                        if (!creep.fatigue) {
                            const moveRes = creep.travelTo(source);
                            if (moveRes !== 0) {
                                console.log('Error(' + creep.name + '): Move Error - ' + moveRes);
                            }
                        }
                    }
                }
            }
            else {
                const creepWithdraw = creep.withdraw(storage, RESOURCE_ENERGY);
                // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
                if (creepWithdraw === ERR_NOT_IN_RANGE) {
                    if (!creep.fatigue) {
                        const moveRes = creep.travelTo(storage);
                        if (moveRes !== 0) {
                            console.log('Error(' + creep.name + '): Move Error - ' + moveRes);
                        }
                    }
                }
            }
        }
    }
    static runUpgrader(creep) {
        if (creep.memory.working === true && creep.carry.energy === 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
            creep.memory.working = true;
        }
        if (creep.memory.working === true) {
            creep.say('U_U' + creep.carry.energy);
            creep.memory.task = 'upgrade';
            if (creep.room.controller === undefined) {
                throw new Error('Creep looking for non existent controller');
            }
            const creepUpgrade = creep.upgradeController(creep.room.controller);
            // console.log("Status(" + creep.name + ") - upgrade: " + creepUpgrade)
            if (creepUpgrade === ERR_NOT_IN_RANGE) {
                if (!creep.fatigue) {
                    const moveRes = creep.travelTo(creep.room.controller);
                    if (moveRes !== 0) {
                        console.log('Error(' + creep.name + '): Move Error - ' + moveRes);
                    }
                }
            }
        }
        else {
            creep.say('U_H' + creep.carry.energy);
            creep.memory.task = 'harvest';
            const storage = Game.spawns.Spawn1.room.storage;
            // const storage = false
            if (!storage) {
                const source = creep.pos.findClosestByPath(FIND_SOURCES);
                if (source !== null) {
                    const creepHarvest = creep.harvest(source);
                    // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
                    if (creepHarvest === ERR_NOT_IN_RANGE) {
                        if (!creep.fatigue) {
                            const moveRes = creep.travelTo(source);
                            if (moveRes !== 0) {
                                console.log('Error(' + creep.name + '): Move Error - ' + moveRes);
                            }
                        }
                    }
                }
            }
            else {
                const creepWithdraw = creep.withdraw(storage, RESOURCE_ENERGY);
                // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
                if (creepWithdraw === ERR_NOT_IN_RANGE) {
                    if (!creep.fatigue) {
                        const moveRes = creep.travelTo(storage);
                        if (moveRes !== 0) {
                            console.log('Error(' + creep.name + '): Move Error - ' + moveRes);
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
    static runRepairer(creep) {
        if (creep.memory.working === true && creep.carry.energy === 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
            creep.memory.working = true;
        }
        if (creep.memory.working === true) {
            creep.memory.task = 'repair';
            creep.say('R_R' + creep.carry.energy);
            const structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.hits < s.hitsMax && s.hits < 750000 // && s.structureType !== STRUCTURE_WALL
            });
            // console.log(structure)
            if (structure !== null) {
                // console.log('Defined - ' + structure)
                const creepRepair = creep.repair(structure);
                if (creepRepair === ERR_NOT_IN_RANGE) {
                    creep.travelTo(structure);
                }
            }
            else {
                RoleManager_1.runBuilder(creep);
            }
        }
        else {
            creep.memory.task = 'harvest';
            creep.say('R_H' + creep.carry.energy);
            const storage = Game.spawns.Spawn1.room.storage;
            if (!storage) {
                const source = creep.pos.findClosestByPath(FIND_SOURCES);
                if (source !== null) {
                    const creepHarvest = creep.harvest(source);
                    // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
                    if (creepHarvest === ERR_NOT_IN_RANGE) {
                        if (!creep.fatigue) {
                            const moveRes = creep.travelTo(source);
                            if (moveRes !== 0) {
                                console.log('Error(' + creep.name + '): Move Error - ' + moveRes);
                            }
                        }
                    }
                }
            }
            else {
                const creepWithdraw = creep.withdraw(storage, RESOURCE_ENERGY);
                // console.log("Status(" + creep.name + ") - harvest: " + creepHarvest)
                if (creepWithdraw === ERR_NOT_IN_RANGE) {
                    if (!creep.fatigue) {
                        const moveRes = creep.travelTo(storage);
                        if (moveRes !== 0) {
                            console.log('Error(' + creep.name + '): Move Error - ' + moveRes);
                        }
                    }
                }
            }
        }
    }
    static runHauler(creep) {
        if (creep.memory.working === true && creep.carry.energy === 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
            creep.memory.working = true;
        }
        if (creep.memory.working) {
            creep.say('🚚', true);
            creep.memory.task = 'deposit';
            // Attempt to transfer energy to storage
            if (creep.room.storage === undefined) {
                throw new Error('creep.room.storage is undefined');
            }
            const creepTransfer = creep.transfer(creep.room.storage, RESOURCE_ENERGY);
            if (creepTransfer === ERR_NOT_IN_RANGE) {
                if (!creep.fatigue) {
                    const moveRes = creep.travelTo(creep.room.storage);
                    if (moveRes !== 0) {
                        console.log('Error(' + creep.name + '): Move Error - ' + moveRes);
                    }
                }
            }
        }
        else {
            creep.say('🗑️', true);
            const container = Game.getObjectById(creep.memory.containerId);
            if (container === null) {
                throw new Error('Unable to locate container');
            }
            // Get energy from container
            const creepWithdraw = creep.withdraw(container, RESOURCE_ENERGY);
            if (creepWithdraw === ERR_NOT_IN_RANGE) {
                if (!creep.fatigue) {
                    const moveRes = creep.travelTo(container);
                    if (moveRes !== 0) {
                        console.log('Error(' + creep.name + '): Move Error - ' + moveRes);
                    }
                }
            }
        }
    }
    static runPickupper(creep) {
        if (creep.memory.working === true && creep.store.getUsedCapacity() === 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working === false && creep.store.getFreeCapacity() === 0) {
            creep.memory.working = true;
        }
        // If there is no target room throw error as that is not supported currently
        if (!creep.memory.targetRoom) {
            throw new Error('No target room for pickupper' + creep.name);
        }
        if (!creep.memory.homeRoom) {
            throw new Error('No home room for pickupper');
        }
        /**
         *
         * @type {Room}
         */
        const homeRoom = Game.spawns[creep.memory.homeRoom].room;
        if (creep.memory.working === false) {
            // If creep is already in room them harvest resources
            if (creep.room.name === creep.memory.targetRoom) {
                console.log('here');
                const ruinTargets = creep.room.find(FIND_RUINS, {
                    // filter: (ruin) => Object.entries(ruin.store).length !== 0 && Object.entries()
                    filter: function (ruin) {
                        const entries = Object.entries(ruin.store);
                        return entries.length !== 0 && entries.length !== 1 && ruin.store[RESOURCE_ENERGY] > 0;
                    }
                });
                if (ruinTargets.length !== 0) {
                    creep.memory.task = 'gathering';
                    creep.say('🗑️');
                    const resources = _.filter(Object.keys(ruinTargets[0].store), resource => ruinTargets[0].store[resource] > 0 && resource !== RESOURCE_ENERGY);
                    // console.log("Target: " + ruinTargets[0] + "|| Resouce: " + resources[0] + "|| Ammount: " + ruinTargets[0].store[resources[0]])
                    if (creep.withdraw(ruinTargets[0], resources[0]) === ERR_NOT_IN_RANGE) {
                        creep.travelTo(ruinTargets[0]);
                    }
                }
                else {
                    Game.flags.pickup.remove();
                    creep.memory.working = true;
                }
                // Otherwise move towards room
            }
            else {
                if (creep.ticksToLive === undefined) {
                    throw new Error('ticksToLive is undefined');
                }
                if (creep.ticksToLive < 150) {
                    creep.suicide();
                }
                else {
                    creep.memory.task = 'travelling';
                    creep.say('🏃');
                    if (!creep.fatigue) {
                        // /**
                        //  *
                        //  * @type {ExitConstant | ERR_NO_PATH | ERR_INVALID_ARGS}
                        //  */
                        // const exit = creep.room.findExitTo(creep.memory.targetRoom)
                        const moveRes = creep.travelTo(Game.flags.pickup);
                        if (moveRes !== 0) {
                            console.log('Error(' + creep.name + '): Move Error - ' + moveRes);
                        }
                    }
                }
            }
        }
        else {
            // If creep is in home room then deposit, otherwise move to home
            if (creep.room.name === homeRoom.name) {
                if (creep.room.storage === undefined) {
                    throw new Error('creep.room.storage is undefined');
                }
                const creepTransfer = creep.transfer(creep.room.storage, Object.keys(creep.store)[0]);
                // console.log("Status(" + creep.name + ") - upgrade: " + creepTransfer)
                if (creepTransfer === ERR_NOT_IN_RANGE) {
                    if (!creep.fatigue) {
                        const moveRes = creep.travelTo(creep.room.storage);
                        if (moveRes !== 0) {
                            console.log('Error(' + creep.name + '): Move Error - ' + moveRes);
                        }
                    }
                }
            }
            else {
                creep.say('🏃');
                if (!creep.fatigue) {
                    if (homeRoom.storage === undefined) {
                        throw new Error('creep.room.storage is undefined');
                    }
                    const moveRes = creep.travelTo(homeRoom.storage);
                    if (moveRes !== 0) {
                        console.log('Error(' + creep.name + '): Move Error - ' + moveRes);
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
    static runTraveller(creep) {
        const target = Game.flags.investigate;
        if (target) {
            // console.log(enemies[0])
            // console.log('X: ' + enemies[0].pos.x + '| Y: ' + enemies[0].pos.y)
            creep.travelTo(target);
        }
        else if (Game.flags.traveler_wait) {
            // console.log('test')
            creep.travelTo(Game.flags.traveler_wait);
        }
    }
};
RoleManager = RoleManager_1 = __decorate([
    profile
], RoleManager);

const minHarvesters = 1;
const minBuilders = 2;
const minRepairers = 2;
const maxUpgraders = 1;
// const minPickup = 2
const minAttacker = 1;
// telephone.initializeTelephone()
// telephone.requestTelephone('Ratstail91', telephone.TELEPHONE_INFO)
// console.log(telephone.getTelephone('Ratstail91', telephone.TELEPHONE_INFO))
// @ts-ignore
global.Profiler = init();
const loop = () => {
    // profiler.wrap(function () {
    // console.log(JSON.stringify(telephone.getTelephone('Ratstail91', telephone.TELEPHONE_INFO)))
    for (const name in Game.creeps) {
        /**
         * @type {Creep}
         */
        const creep = Game.creeps[name];
        switch (creep.memory.role) {
            case 'harvester':
                // util.baseRun(creep, creep.transfer, [Game.spawns.spawn_1, RESOURCE_ENERGY], creep.harvest, creep.pos.findClosestByPath(FIND_SOURCES))
                RoleManager.runHarvester(creep);
                break;
            case 'upgrader':
                // util.baseRun(creep, creep.upgradeController, [roomController], creep.harvest, creep.pos.findClosestByPath(FIND_SOURCES))
                RoleManager.runUpgrader(creep);
                break;
            case 'builder':
                // util.baseRun(creep, creep.build, [creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)], creep.harvest, creep.pos.findClosestByPath(FIND_SOURCES))
                RoleManager.runBuilder(creep);
                break;
            case 'repairer':
                RoleManager.runRepairer(creep);
                break;
            case 'attacker':
                RoleManager.runAttacker(creep);
                break;
            case 'traveler':
                RoleManager.runTraveller(creep);
                break;
            case 'pickupper':
                RoleManager.runPickupper(creep);
                break;
            case 'miner':
                RoleManager.runMiner(creep);
                break;
            case 'hauler':
                RoleManager.runHauler(creep);
                break;
            default:
                console.log('NO ROLE: ' + creep.name);
                break;
        }
    }
    // find all towers
    const towers = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_TOWER
    });
    // for each tower
    for ( /** @type {StructureTower} */const tower of towers) {
        // run tower logic
        TowerHelper.runDefense(tower);
    }
    /**
     * @type {Creep[][]}
     */
    const myCreeps = _.groupBy(Game.creeps, (creep) => creep.memory.role);
    // eslint-disable-next-line dot-notation
    const numberOfHarvesters = myCreeps['harvester'] ? myCreeps['harvester'].length : 0;
    // eslint-disable-next-line dot-notation
    const numberOfUpgraders = myCreeps['upgrader'] ? myCreeps['upgrader'].length : 0;
    // eslint-disable-next-line dot-notation
    const numberOfBuilders = myCreeps['builder'] ? myCreeps['builder'].length : 0;
    // eslint-disable-next-line dot-notation
    const numberOfRepairers = myCreeps['repairer'] ? myCreeps['repairer'].length : 0;
    // eslint-disable-next-line dot-notation
    const numberOfAttackers = myCreeps['attacker'] ? myCreeps['attacker'].length : 0;
    // eslint-disable-next-line dot-notation
    // const numberOfPickuppers = myCreeps['pickupper'] ? myCreeps['pickupper'].length : 0
    const energy = Game.spawns.Spawn1.room.energyCapacityAvailable;
    let name;
    const spawn = Game.spawns.Spawn1;
    /**
     * @type {Source[]}
     */
    const sources = spawn.room.find(FIND_SOURCES);
    // Get sources and determine if a miner needs to spawn.
    for (const source of sources) {
        // If there are not creeps assigned to source already
        if (!_.some(Game.creeps, c => c.memory.role === 'miner' && c.memory.sourceId === source.id)) {
            // Verify that there is a container for them.
            const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: s => s.structureType === STRUCTURE_CONTAINER
            });
            if (containers.length > 0) {
                name = SpawnHelper.createMiner(spawn, source.id, containers[0].id);
                break;
            }
        }
    }
    /**
     * @type {StructureContainer[]}
     */
    const containers = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_CONTAINER
    });
    for (const /** @type {StructureContainer} */ aContainer of containers) {
        /**
         * @type {Creep[]}
         */
        // eslint-disable-next-line dot-notation
        const assignedCreep = _.filter(myCreeps['hauler'], (c) => c.memory.containerId === aContainer.id);
        if (assignedCreep.length === 0) {
            name = SpawnHelper.createCustomCreep(spawn, 1300, 'hauler', [CARRY, CARRY, MOVE], {
                role: 'hauler',
                working: false,
                containerId: aContainer.id
            });
            break;
        }
    }
    if (name === undefined) {
        switch (true) {
            case numberOfHarvesters < minHarvesters:
                name = SpawnHelper.createCustomCreep(spawn, energy, 'harvester', undefined, { homeRoom: spawn.room.name });
                if (name === ERR_NOT_ENOUGH_ENERGY) {
                    name = SpawnHelper.createCustomCreep(spawn, spawn.room.energyAvailable, 'harvester', undefined, { homeRoom: Game.spawns.Spawn1.room.name });
                }
                break;
            case numberOfAttackers < minAttacker:
                name = Game.spawns.Spawn1.createCreep([ATTACK, MOVE, ATTACK, MOVE], undefined, {
                    role: 'attacker',
                    working: false
                });
                break;
            case numberOfRepairers < minRepairers:
                name = SpawnHelper.createCustomCreep(spawn, 1300, 'repairer');
                break;
            case numberOfBuilders < minBuilders:
                name = SpawnHelper.createCustomCreep(spawn, 1300, 'builder');
                break;
            // FALL THROUGH IF NO FLAGS!
            // case numberOfPickuppers < minPickup:
            //   /**
            //    * @type {Flag[]}
            //    */
            //   const pickupFlags = _.filter(Game.flags, (flag) => flag.name === 'pickup')
            //   if (pickupFlags.length !== 0) {
            //     name = Game.spawns.Spawn1.createCustomCreep(1300, 'pickupper', [MOVE, CARRY], { targetRoom: pickupFlags[0].pos.roomName })
            //     break
            //   }
            case numberOfUpgraders < maxUpgraders:
                name = SpawnHelper.createCustomCreep(spawn, 1300, 'upgrader');
                break;
        }
    }
    //   if (numberOfHarvesters < minHarvesters) {
    //     name = Game.spawns.Spawn1.createCustomCreep(energy, 'harvester', undefined, { home: Game.spawns.Spawn1.room.name })
    //     if (name === ERR_NOT_ENOUGH_ENERGY) {
    //       name = Game.spawns.Spawn1.createCustomCreep(Game.spawns.Spawn1.room.energyAvailable, 'harvester', undefined, { home: Game.spawns.Spawn1.room.name })
    //     }
    //   } else if (numberOfAttackers < minAttacker) {
    //     name = Game.spawns.Spawn1.createCreep([ATTACK, MOVE, ATTACK, MOVE], undefined, {
    //       role: 'attacker',
    //       working: false
    //     })
    //   } else if (numberOfRepairers < minRepairers) {
    //     name = Game.spawns.Spawn1.createCustomCreep(energy, 'repairer')
    //     // console.log(name)
    //   } else if (numberOfBuilders < minBuilders) {
    //     name = Game.spawns.Spawn1.createCustomCreep(energy, 'builder')
    //   } else if (numberOfUpgraders < maxUpgraders) {
    //     name = Game.spawns.Spawn1.createCustomCreep(energy, 'upgrader')
    //   }
    // }
    if (_.isString(name)) {
        console.log('Spawned new ' + Game.creeps[name].memory.role + ' creep: ' + name);
    }
    if (!Memory.stats) {
        Memory.stats = {};
    }
    Memory.stats['cpu.getUsed'] = Game.cpu.getUsed();
    Memory.stats['cpu.limit'] = Game.cpu.limit;
    Memory.stats['cpu.bucket'] = Game.cpu.bucket;
    Memory.stats['gcl.progress'] = Game.gcl.progress;
    Memory.stats['gcl.progressTotal'] = Game.gcl.progressTotal;
    Memory.stats['gcl.level'] = Game.gcl.level;
    _.forEach(Object.keys(Game.rooms), function (roomName) {
        const room = Game.rooms[roomName];
        if (room.controller && room.controller.my) {
            Memory.stats['rooms.' + roomName + '.rcl.level'] = room.controller.level;
            Memory.stats['rooms.' + roomName + '.rcl.progress'] = room.controller.progress;
            Memory.stats['rooms.' + roomName + '.rcl.progressTotal'] = room.controller.progressTotal;
            Memory.stats['rooms.' + roomName + '.spawn.energy'] = room.energyAvailable;
            Memory.stats['rooms.' + roomName + '.spawn.energyTotal'] = room.energyCapacityAvailable;
            if (room.storage) {
                Memory.stats['rooms.' + roomName + '.storage.energy'] = room.storage.store.energy;
            }
        }
    });
    // })
    // })
};

exports.loop = loop;
//# sourceMappingURL=main.js.map
