'use client';

import { GameMode } from '../types';

interface NumberPadProps {
  onNumberClick: (num: number) => void;
  onClear: () => void;
  isMemoMode: boolean;
  gameMode: GameMode;
}

const NumberPad = ({ onNumberClick, onClear, isMemoMode, gameMode }: NumberPadProps) => {
  // Numbers 1-9 for the number pad
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2">
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            className={`
              aspect-square w-full flex items-center justify-center 
              rounded-md text-xl font-medium 
              ${gameMode === GameMode.PLAYING 
                ? 'bg-tokyo_night-600 hover:bg-tokyo_night-500 text-white' 
                : 'bg-tokyo_night-700 text-tokyo_night-400 cursor-not-allowed'}
              transition-colors`}
            disabled={gameMode !== GameMode.PLAYING}
          >
            {num}
          </button>
        ))}
      </div>
      <button
        onClick={onClear}
        className={`
          w-full mt-2 py-2 px-4 flex items-center justify-center 
          rounded-md text-base font-medium
          ${gameMode === GameMode.PLAYING 
            ? 'bg-tokyo_red-600 hover:bg-tokyo_red-500 text-white' 
            : 'bg-tokyo_night-700 text-tokyo_night-400 cursor-not-allowed'}
          transition-colors`}
        disabled={gameMode !== GameMode.PLAYING}
      >
        지우기
      </button>
      <div className="mt-2 text-center text-xs text-tokyo_night-300">
        {isMemoMode ? '메모 모드: 클릭한 셀에 메모를 추가합니다' : '숫자 모드: 클릭한 셀의 숫자를 변경합니다'}
      </div>
    </div>
  );
};

export default NumberPad;