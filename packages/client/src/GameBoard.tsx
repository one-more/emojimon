import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { GameMap } from "./GameMap";
import { useMUD } from "./MUDContext";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { hexToArray } from "@latticexyz/utils";
import { TerrainType, terrainTypes } from "./terrainTypes";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { EncounterScreen } from "./Encounter/EncounterScreen";
import { Entity, Has, getComponentValueStrict } from "@latticexyz/recs";
import { MonsterType, monsterTypes } from "./monsterTypes";
import { useHandleEncounter } from "./Encounter/useEncounter";
import { useEffect, useState } from "react";

export const GameBoard = () => {
    useKeyboardMovement();

    const {
        components: { MapConfig, Player, Position, Encounter, Monster },
        network: { playerEntity },
        systemCalls: { spawn },
    } = useMUD();

    const canSpawn = useComponentValue(Player, playerEntity)?.value !== true;

    const players = useEntityQuery([Has(Player), Has(Position)]).map(
        (entity) => {
            const position = getComponentValueStrict(Position, entity);
            return {
                entity,
                x: position.x,
                y: position.y,
                emoji: entity === playerEntity ? "🤠" : "🥸",
            };
        }
    );

    const mapConfig = useComponentValue(MapConfig, singletonEntity);
    if (mapConfig === null) {
        throw new Error(
            "map config not set or not ready, only use this hook after loading state === LIVE"
        );
    }

    const { width, height, terrain: terrainData } = mapConfig as {
        width: number,
        height: number,
        terrain: string
    };
    const terrain = Array.from(hexToArray(terrainData)).map((value, index) => {
        const { emoji } =
            value in TerrainType
                ? terrainTypes[value as TerrainType]
                : { emoji: "" };
        return {
            x: index % width,
            y: Math.floor(index / width),
            emoji,
        };
    });

    const encounter = useComponentValue(Encounter, playerEntity);
    const monsterType = useComponentValue(
        Monster,
        (encounter ? (encounter.monster as Entity) : undefined) as Entity
    )?.value;
    const monster =
        monsterType !== null && monsterType && monsterType in MonsterType
            ? monsterTypes[monsterType as MonsterType]
            : null;
    const [monsterName, setMonsterName] = useState("MissingNo");
    useEffect(() => {
        if (monster?.name) {
            setMonsterName(monster?.name as string);
        }
    }, [monster?.name]);
    const { throwBall, fleeEncounter } = useHandleEncounter({ monsterName });

    return (
        <GameMap
            width={width}
            height={height}
            terrain={terrain}
            onTileClick={canSpawn ? spawn : undefined}
            players={players}
            encounter={
                encounter ? (
                    <EncounterScreen
                        monsterName={monsterName}
                        monsterEmoji={monster?.emoji ?? "💱"}
                        throwBall={throwBall}
                        fleeEncounter={fleeEncounter}
                    />
                ) : undefined
            }
        />
    );
};
