"use client";

import React from 'react';
import { GameMode, DifficultyLevel } from '../types';

interface GameControlsProps {
  gameMode: GameMode;
  onStartGame: () => void;
  onNewGame: (difficulty: DifficultyLevel) => void;
  onToggleMemo: () => void;
  isMemoMode: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameMode,
  onStartGame,
  onNewGame,
  onToggleMemo,
  isMemoMode
}) => {
  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-3 justify-center">
        {/* 게임 상태에 따른 버튼 표시 */}
        {gameMode === GameMode.PRE_START && (
          <button
            onClick={onStartGame}
            className="py-2 px-4 bg-tokyo_green-700 hover:bg-tokyo_green-600 text-white rounded-lg"
          >
            게임 시작
          </button>
        )}
        
        {/* 난이도 선택 버튼들 */}
        <div className="flex flex-wrap gap-2 mt-2 justify-center">
          <button
            onClick={() => onNewGame(DifficultyLevel.EASY)}
            className="py-2 px-4 bg-tokyo_blue-800 hover:bg-tokyo_blue-700 text-white rounded-lg"
          >
            쉬움
          </button>
          <button
            onClick={() => onNewGame(DifficultyLevel.MEDIUM)}
            className="py-2 px-4 bg-tokyo_night-700 hover:bg-tokyo_night-600 text-white rounded-lg"
          >
            보통
          </button>
          <button
            onClick={() => onNewGame(DifficultyLevel.HARD)}
            className="py-2 px-4 bg-tokyo_orange-800 hover:bg-tokyo_orange-700 text-white rounded-lg"
          >
            어려움
          </button>
          <button
            onClick={() => onNewGame(DifficultyLevel.EXPERT)}
            className="py-2 px-4 bg-tokyo_red-800 hover:bg-tokyo_red-700 text-white rounded-lg"
          >
            전문가
          </button>
        </div>
        
        {/* 메모 모드 토글 버튼 */}
        {gameMode === GameMode.PLAYING && (
          <button
            onClick={onToggleMemo}
            className={`
              py-2 px-4 rounded-lg
              ${isMemoMode 
                ? 'bg-tokyo_blue-600 hover:bg-tokyo_blue-500 text-white' 
                : 'bg-tokyo_night-600 hover:bg-tokyo_night-500 text-tokyo_night-200'}
            `}
          >
            {isMemoMode ? '메모 모드 ON' : '메모 모드 OFF'}
          </button>
        )}
      </div>
      
      {/* 게임 도움말 */}
      <div className="mt-4 text-sm text-tokyo_night-300 text-center">
        {gameMode === GameMode.PRE_START && '난이도를 선택하여 새 게임을 시작하세요'}
        {gameMode === GameMode.PLAYING && '각 행, 열, 3x3 영역에 1-9 숫자가 정확히 한 번씩 나타나도록 퍼즐을 완성하세요'}
        {gameMode === GameMode.COMPLETED && '축하합니다! 다른 난이도의 게임을 시작해보세요'}
      </div>
    </div>
  );
};

export default GameControls;
