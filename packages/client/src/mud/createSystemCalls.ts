import { Has, HasValue, getComponentValue, runQuery } from "@latticexyz/recs";
import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  { playerEntity, worldContract, waitForTransaction }: SetupNetworkResult,
  { Player, Position, Obstruction, Encounter }: ClientComponents
) {
  const isObstructed = (x: number, y: number) => {
    return runQuery([
        Has(Obstruction),
        HasValue(Position, { x, y })
    ]).size > 0;
  }

  const moveBy = async (deltaX: number, deltaY: number) => {
    if (!playerEntity) {
      throw new Error("no player")
    }

    const playerPosition = getComponentValue(Position, playerEntity);
    if (!playerPosition) {
      console.warn("can't moveBy without a player position, not yet spawned?");
      return;
    }

    const newX = playerPosition.x + deltaX;
    const newY = playerPosition.y + deltaY;
    if (isObstructed(newX, newY)) {
      throw new Error("cannot go into an obstructed space");
    }

    const tx = await worldContract.write.moveBy([
        playerPosition.x,
        playerPosition.y,
        deltaX,
        deltaY
    ]);
    await waitForTransaction(tx);
  };

  const spawn = async (x: number, y: number) => {
    if (!playerEntity) {
      throw  new Error("no player")
    }

    const canSpawn = getComponentValue(Player, playerEntity)?.value !== true;
    if (!canSpawn) {
      throw new Error("already spawned")
    }

    if (isObstructed(x, y)) {
      throw new Error("cannot go into an obstructed space");
    }

    const tx = await worldContract.write.spawn([x, y]);
    await waitForTransaction(tx);
  };

  const throwBall = async () => {
    const player = playerEntity;
    if (!player) {
      throw new Error("no player");
    }

    const encounter = getComponentValue(Encounter, player);
    if (!encounter) {
      throw new Error("no encounter");
    }

    const tx = await worldContract.write.throwBall([]);
    await waitForTransaction(tx);
  }

  const fleeEncounter = async () => {
    const tx = await worldContract.write.flee([]);
    await waitForTransaction(tx)
  }

  return {
    moveBy,
    spawn,
    throwBall,
    fleeEncounter,
  };
}
