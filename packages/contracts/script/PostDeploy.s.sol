// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";

contract PostDeploy is Script {
  function run(address worldAddress) external {
    console.log("Deployed world: ", worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    // TODO: Create a map

    vm.stopBroadcast();
  }
}
