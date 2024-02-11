import { useMUD } from "../MUDContext";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useComponentValue } from "@latticexyz/react";
import { MonsterCatchResult } from "../monsterCatchResult";
import { ToastOptions } from "react-toastify/dist/types";

export function useHandleEncounter({ monsterName }: { monsterName: string }) {
    const {
        systemCalls: { throwBall, fleeEncounter },
        components: { MonsterCatchAttempt },
        network: { playerEntity },
    } = useMUD();

    const toastId = useRef<ReturnType<typeof toast.loading>>("");
    const catchAttempt = useComponentValue(MonsterCatchAttempt, playerEntity);

    useEffect(() => {
        const result = catchAttempt?.result;

        if (result === MonsterCatchResult.Caught) {
            toast.update(toastId.current, {
                isLoading: false,
                type: "success",
                render: `You caught the ${monsterName}!`,
                autoClose: 5000,
                closeButton: true,
            } as ToastOptions);
        } else if (result === MonsterCatchResult.Fled) {
            toast.update(toastId.current, {
                isLoading: false,
                type: "default",
                render: `Oh no, the ${monsterName} fled!`,
                autoClose: 5000,
                closeButton: true,
            } as ToastOptions);
        } else if (result === MonsterCatchResult.Missed) {
            toast.update(toastId.current, {
                isLoading: false,
                type: "error",
                render: "You missed!",
                autoClose: 5000,
                closeButton: true,
            } as ToastOptions);
        }
    }, [catchAttempt, monsterName]);

    return {
        throwBall: useCallback(async () => {
            toastId.current = toast.loading("Throwing emojiball…");
            await throwBall();
        }, [throwBall]),
        fleeEncounter: useCallback(async () => {
            toastId.current = toast.loading("Running away…");
            await fleeEncounter();

            toast.update(toastId.current, {
                isLoading: false,
                type: "default",
                render: `You ran away!`,
                autoClose: 5000,
                closeButton: true,
            } as ToastOptions);
        }, [fleeEncounter]),
    };
}
