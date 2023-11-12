// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";

contract MapSystem is System {
  function distance2(uint32 deltaX, uint32 deltaY) internal pure returns (uint32) {
    return deltaX * deltaX + deltaY * deltaY;
  }
}
