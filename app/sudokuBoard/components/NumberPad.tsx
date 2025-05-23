"use client";

import React from 'react';
import { GameMode } from '../types';

interface NumberPadProps {
  onNumberClick: (num: number) => void;
  onClear: () => void;
  isMemoMode: boolean;
  gameMode: GameMode;
}

const NumberPad: React.FC<NumberPadProps> = ({
  onNumberClick,
  onClear,
  isMemoMode,
  gameMode
}) => {
  // 게임 중이 아닌 경우 버튼을 비활성화
  const isDisabled = gameMode !== GameMode.PLAYING;
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-3 text-tokyo_blue-400">숫자 입력</h3>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            disabled={isDisabled}
            className={`
              py-3 rounded-lg text-lg font-semibold 
              ${isDisabled ? 'bg-tokyo_night-600 text-tokyo_night-400 cursor-not-allowed' :
                isMemoMode ? 'bg-tokyo_blue-800 hover:bg-tokyo_blue-700 text-tokyo_blue-200' :
                'bg-tokyo_night-600 hover:bg-tokyo_night-500 text-tokyo_green-300'}
            `}
          >
            {num}
          </button>
        ))}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onClear}
          disabled={isDisabled}
          className={`
            flex-1 py-3 rounded-lg font-semibold
            ${isDisabled ? 'bg-tokyo_night-600 text-tokyo_night-400 cursor-not-allowed' :
              'bg-tokyo_red-900 hover:bg-tokyo_red-800 text-tokyo_red-200'}
          `}
        >
          지우기
        </button>
      </div>
      
      <div className="mt-4 text-sm text-tokyo_night-300">
        {isMemoMode ? 
          '메모 모드: 여러 숫자를 메모할 수 있습니다.' : 
          '입력 모드: 선택한 칸에 숫자를 입력합니다.'}
      </div>
    </div>
  );
};

export default NumberPad;
