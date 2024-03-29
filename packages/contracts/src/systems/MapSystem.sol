// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { MonsterCatchAttempt, EncounterTrigger, Encounterable, Player, Position, MapConfig, Obstruction, Monster, Movable, Encounter, EncounterData } from "../codegen/index.sol";
import { addressToEntityKey } from "../addressToEntityKey.sol";
import { positionToEntityKey } from "../positionToEntityKey.sol";
import { MonsterType } from "../codegen/common.sol";

contract MapSystem is System {
  function spawn(uint32 x, uint32 y) public {
    bytes32 player = addressToEntityKey(address(_msgSender()));
    require(!Player.get(player), "already spawned");

    // Constrain position to map size, wrapping around if necessary
    (uint32 width, uint32 height,) = MapConfig.get();
    x = (x + width) % width;
    y = (y + height) % height;

    bytes32 position = positionToEntityKey(x, y);
    require(!Obstruction.get(position), "this space is obstructed");

    Player.set(player, true);
    Position.set(player, x, y);
    Movable.set(player, true);
    Encounterable.set(player, true);
  }

  function moveBy(uint32 clientX, uint32 clientY, int32 deltaX, int32 deltaY) public {
    bytes32 player = addressToEntityKey(_msgSender());
    require(Movable.get(player), "can't move");
    require(!Encounter.getExists(player), "can't move during an encounter");

    (uint32 fromX, uint32 fromY) = Position.get(player);
    require(distance2(deltaX, deltaY) == 1, "can only move to adjacent spaces");
    require(clientX == fromX && clientY == fromY, "client confused about location");

    // Constrain position to map size, wrapping around if necessary
    // Also, by adding width and height, avoid negative numbers
    // which uint32 does not support
    (uint32 width, uint32 height,) = MapConfig.get();

    uint32 x = uint32(int32(fromX) + deltaX + int32(width)) % width;
    uint32 y = uint32(int32(fromY) + deltaY + int32(height)) % height;

    bytes32 position = positionToEntityKey(x, y);
    require(!Obstruction.get(position), "this space is obstructed");

    Position.set(player, x, y);

    if (Encounterable.get(player) && EncounterTrigger.get(position)) {
      uint256 rand = uint256(keccak256(abi.encode(player, position, blockhash(block.number - 1), block.prevrandao)));
      if (rand % 5 == 0) {
        startEncounter(player);
      }
    }
  }

  function distance2(int32 deltaX, int32 deltaY) internal pure returns (uint32) {
    return uint32(deltaX * deltaX + deltaY * deltaY);
  }

  function startEncounter(bytes32 player) internal {
    bytes32 monster = keccak256(abi.encode(player, blockhash(block.number - 1), block.prevrandao));
    MonsterType monsterType = MonsterType((uint256(monster) % uint256(type(MonsterType).max)) + 1);
    Monster.set(monster, monsterType);
    Encounter.set(player, EncounterData({ exists: true, monster: monster, catchAttempts: 0 }));
    MonsterCatchAttempt.deleteRecord(player);
  }
}
