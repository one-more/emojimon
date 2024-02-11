import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
type Props = {
    monsterName: string;
    monsterEmoji: string;
    throwBall: () => void;
    fleeEncounter: () => void;
};

export const EncounterScreen = ({
    monsterName,
    monsterEmoji,
    throwBall,
    fleeEncounter,
}: Props) => {
    const [appear, setAppear] = useState(false);
    useEffect(() => {
        // sometimes the fade-in transition doesn't play, so a timeout is a hacky fix
        const timer = setTimeout(() => setAppear(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={twMerge(
                "flex flex-col gap-10 items-center justify-center bg-black text-white transition-opacity duration-1000",
                appear ? "opacity-100" : "opacity-0"
            )}
        >
            <div className="text-8xl animate-bounce">{monsterEmoji}</div>
            <div>A wild {monsterName} appears!</div>

            <div className="flex gap-2">
                <button
                    type="button"
                    className="bg-stone-600 hover:ring rounded-lg px-4 py-2"
                    onClick={throwBall}
                >
                    ☄️ Throw
                </button>
                <button
                    type="button"
                    className="bg-stone-800 hover:ring rounded-lg px-4 py-2"
                    onClick={fleeEncounter}
                >
                    🏃‍♂️ Run
                </button>
            </div>
        </div>
    );
};
