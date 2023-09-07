import { getComponentValue } from "@latticexyz/recs";
import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";
import { singletonEntity } from "@latticexyz/store-sync/recs";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  { worldContract, waitForTransaction }: SetupNetworkResult,
  { SyncProgress }: ClientComponents
) {
  const moveTo = async (x: number, y: number) => {
    // TODO
    return null as any;
  };

  const moveBy = async (deltaX: number, deltaY: number) => {
    // TODO
    return null as any;
  };

  const spawn = async (x: number, y: number) => {
    // TODO
    return null as any;
  };

  const throwBall = async () => {
    // TODO
    return null as any;
  };

  const fleeEncounter = async () => {
    // TODO
    return null as any;
  };

  return {
    moveTo,
    moveBy,
    spawn,
    throwBall,
    fleeEncounter,
  };
}
