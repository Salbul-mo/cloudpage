"use client";

import React from 'react';
import { CellStatus, GameMode } from '../types';

interface SudokuBoardProps {
  sudokuNumber: CellStatus[];
  isActive: boolean;
  setActive: (active: boolean) => void;
  onPlay: () => void;
  gameMode: GameMode;
  onCellClick: (index: number) => void;
  revealedBoard: number[];
}

const SudokuBoard: React.FC<SudokuBoardProps> = ({
  sudokuNumber,
  isActive,
  gameMode,
  onCellClick,
  revealedBoard
}) => {
  // 보드를 9x9 그리드로 렌더링
  const renderBoard = () => {
    return (
      <div className="grid grid-cols-9 gap-0 border-2 border-tokyo_night-400">
        {sudokuNumber.map((cell, index) => {
          const row = Math.floor(index / 9);
          const col = index % 9;
          
          // 테두리 스타일 계산
          const borderRight = (col === 2 || col === 5) ? 'border-r-2 border-tokyo_night-400' : 
                             (col === 8) ? '' : 'border-r border-tokyo_night-600';
          const borderBottom = (row === 2 || row === 5) ? 'border-b-2 border-tokyo_night-400' : 
                              (row === 8) ? '' : 'border-b border-tokyo_night-600';
          
          return (
            <div
              key={index}
              className={`
                w-10 h-10 flex items-center justify-center text-lg relative
                ${borderRight} ${borderBottom}
                ${cell.isSelected ? 'bg-tokyo_blue-900/40' : ''}
                ${cell.isFixed ? 'text-tokyo_orange-400 font-bold' : 'text-tokyo_green-400'}
                ${cell.isError ? 'text-tokyo_red-500' : ''}
                ${gameMode === GameMode.PLAYING ? 'cursor-pointer hover:bg-tokyo_night-700' : ''}
              `}
              onClick={() => onCellClick(index)}
            >
              {cell.value > 0 ? (
                <span>{cell.value}</span>
              ) : (
                // 메모 표시 
                <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <div 
                      key={num} 
                      className="flex items-center justify-center text-[8px] text-tokyo_blue-300"
                    >
                      {cell.memos.includes(num) ? num : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-center text-tokyo_night-200">
          {gameMode === GameMode.PRE_START && '게임 준비'}
          {gameMode === GameMode.PLAYING && '게임 중'}
          {gameMode === GameMode.COMPLETED && '게임 완료!'}
        </h2>
      </div>
      <div className="relative">
        {renderBoard()}
        
        {/* 로딩 오버레이 */}
        {!isActive && (
          <div className="absolute inset-0 bg-tokyo_night-900/80 flex items-center justify-center">
            <div className="text-tokyo_night-200 text-lg">로딩 중...</div>
          </div>
        )}
        
        {/* 게임 완료 오버레이 */}
        {gameMode === GameMode.COMPLETED && (
          <div className="absolute inset-0 bg-tokyo_green-900/40 flex items-center justify-center">
            <div className="bg-tokyo_night-800 p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-2xl font-bold text-tokyo_green-400 mb-2">축하합니다!</h3>
              <p className="text-tokyo_night-200 mb-4">스도쿠 퍼즐을 성공적으로 완료했습니다.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SudokuBoard;
