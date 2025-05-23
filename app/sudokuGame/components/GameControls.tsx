'use client';

import { GameMode } from '../types';

interface GameControlsProps {
    gameMode: GameMode;
    onStartGame: () => void;
    onNewGame: () => void;
    onToggleMemo: () => void;
    isMemoMode: boolean;
}

const GameControls = ({
    gameMode,
    onStartGame,
    onNewGame,
    onToggleMemo,
    isMemoMode
}: GameControlsProps) => {
    return (
        <div className="flex flex-col gap-4 mt-6">
            {gameMode === 'PRE_START' ? (
                <button
                    onClick={onStartGame}
                    className="px-6 py-3 bg-tokyo_green-500 hover:bg-tokyo_green-400 text-white rounded-md
                             font-bold text-lg transition-colors duration-200"
                >
                    Start Game
                </button>
            ) : (
                <>
                    <button
                        onClick={onToggleMemo}
                        className={`px-6 py-3 ${isMemoMode ? 'bg-tokyo_blue-500' : 'bg-tokyo_night-400'}
                                 text-white rounded-md font-bold text-lg transition-colors duration-200`}
                    >
                        {isMemoMode ? 'Memo Mode: ON' : 'Memo Mode: OFF'}
                    </button>
                    <button
                        onClick={onNewGame}
                        className="px-6 py-3 bg-tokyo_orange-500 hover:bg-tokyo_orange-400 text-white
                                 rounded-md font-bold text-lg transition-colors duration-200"
                    >
                        New Game
                    </button>
                </>
            )}
        </div>
    );
};

export default GameControls;
