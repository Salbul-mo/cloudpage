'use client';

/**
 * Sudoku Board Component
 * 
 * 이 컴포넌트는 9x9 수독 게임판을 렌더링하고 다음과 같은 기능을 처리합니다:
 * 1. 게임판 셀 렌더링
 * 2. 셀 선택 및 하이라이트 관리
 * 3. 풀이 계산 및 표시
 * 4. 사용자 상호작용 처리
 * 
 * Props:
 * - sudokuNumber: 현재 게임판 상태 (81개 셀)
 * - isActive: 활성화/하이라이트된 셀을 나타내는 2D 배열
 * - setActive: 활성화 셀 업데이트 함수
 * - onPlay: 셀이 플레이될 때 호출되는 콜백
 * - gameMode: 현재 게임 모드
 * - onCellClick: 셀 클릭 이벤트 핸들러
 * - revealedBoard: 공개된 셀을 추적
 */

import { useState, useEffect } from 'react';
import NumberBox from './NumberBox';
import { SudokuBoardProps } from '../types';
import { sudokuCreator } from '../sudokuUtils';

const SudokuBoard = ({
    sudokuNumber,
    isActive,
    setActive,
    onPlay,
    gameMode,
    onCellClick,
    revealedBoard
}: SudokuBoardProps) => {
    // 풀이 결과를 저장하는 로컬 상태
    const [solution, setSolution] = useState<(number | null)[]>([]);

    /**
     * Effect: 풀이 계산
     * 
     * 실행 시점:
     * - 컴포넌트가 마운트될 때
     * - 퍼즐이 업데이트될 때 (sudokuNumber 변경 시)
     * 
     * solvePuzzle 유틸리티를 사용하여 풀이를 찾음
     * 풀이가 없을 경우 현재 상태를 기본값으로 사용
     */
    useEffect(() => {
        if (!sudokuNumber) {
            setSolution([]);
            return;
        }
        
        const result = sudokuCreator();
        setSolution(result);
    }, [sudokuNumber]);

    /**
     * Handles click events on Sudoku cells
     * 
     * 셀이 클릭될 때:
     * 1. 클릭된 셀의 정보를 data 속성에서 추출
     * 2. 부모 컴포넌트의 onCellClick 핸들러 호출
     * 3. PLAYING 모드일 때 관련 셀 하이라이트
     * 4. onPlay 콜백 트리거
     * 
     * @param e - 클릭된 셀의 마우스 이벤트
     */
    const handleBoxClick = (e: React.MouseEvent) => {
        // 클릭된 셀의 정보 가져오기
        const target = e.target as HTMLElement;
        const index = target.dataset.index;
        
        // 유효한 인덱스가 없으면 무시
        if (index === undefined) return;
        
        // 부모 컴포넌트에 셀 클릭 알림
        onCellClick(parseInt(index));
        
        // PLAYING 모드일 때 관련 셀 하이라이트
        if (gameMode === 'PLAYING') {
            // 모든 셀을 비활성화 상태로 초기화
            const newActive: boolean[][] = Array(81).fill(null).map(() => [false, false]);
            
            // 클릭된 셀의 위치 정보 추출
            const row = parseInt(target.dataset.row || '0');
            const col = parseInt(target.dataset.col || '0');
            const box = parseInt(target.dataset.box || '0');
            const value = target.textContent ? parseInt(target.textContent) : null;

            // 모든 셀을 순회하며 하이라이트할 셀 찾기
            for (let i = 0; i < 81; i++) {
                const currentRow = Math.floor(i / 9);
                const currentCol = i % 9;
                const currentBox = Math.floor(currentRow / 3) * 3 + Math.floor(currentCol / 3);
                
                // 다음 조건을 만족하는 셀 하이라이트:
                // - 같은 행에 있는 셀
                // - 같은 열에 있는 셀
                // - 같은 3x3 박스에 있는 셀
                // - 같은 숫자를 가진 셀
                if (currentRow === row || currentCol === col || currentBox === box || 
                    (value !== null && solution[i] === value)) {
                    newActive[i] = [true, i === parseInt(index)];
                }
            }
            
            // 활성화된 셀 상태 업데이트
            setActive(newActive);
        }
        
        // 부모 컴포넌트에 플레이 이벤트 알림
        onPlay();
    };

    /**
     * 9x9 수독 격자를 렌더링
     * 
     * 격자 레이아웃:
     * - 9x9 격자 사용 CSS Grid
     * - 3x3 박스 사이의 두꺼운 경계선
     * - 각 셀은 NumberBox 컴포넌트
     */
    if (!Array.isArray(solution)) return (
        <div>
            <p>Failed to load solution</p>
        </div>
    );
    return (
        <div className="grid grid-cols-9 gap-0 w-fit mx-auto border-2 border-tokyo_night-300 rounded-md overflow-hidden">
            {solution.map((value, index) => {
                // Calculate cell position
                const row = Math.floor(index / 9);
                const col = index % 9;
                const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
                const id = `cell-${row}-${col}`;
                
                // Dynamic class names for borders
                // - Thicker right border for box boundaries (every 3rd column except last)
                // - Thicker bottom border for box boundaries (every 3rd row except last)
                const className = `
                    ${col % 3 === 2 && col < 8 ? 'border-r-2' : 'border-r'}
                    ${row % 3 === 2 && row < 8 ? 'border-b-2' : 'border-b'}
                    border-tokyo_night-300
                `;

                return (
                    <NumberBox
                        key={id}
                        value={value}
                        index={index}
                        isActive={isActive[index] || [false, false]}
                        id={id}
                        box={box}
                        row={row}
                        col={col}
                        className={className}
                        onBoxClick={handleBoxClick}
                        isRevealed={revealedBoard[index]}
                    />
                );
            })}
        </div>
    );
};

export default SudokuBoard;
