'use client';

import { NumberBoxProps } from '../types';

const NumberBox = ({
    value,
    index,
    isActive,
    id,
    box,
    row,
    col,
    className,
    onBoxClick,
    isRevealed
}: NumberBoxProps) => {
    const getBackgroundColor = () => {
        if (isActive[0] && isActive[1]) return 'bg-tokyo_blue-500/50';
        if (isActive[0]) return 'bg-tokyo_night-200/50';
        return 'bg-tokyo_night-400';
    };

    const getTextColor = () => {
        if (isRevealed) return 'text-tokyo_green-500';
        return 'text-tokyo_blue-500';
    };

    return (
        <button
            className={`${className} ${getBackgroundColor()} ${getTextColor()} 
                       w-16 h-16 border border-tokyo_night-300 flex items-center justify-center
                       text-2xl font-bold transition-colors duration-200`}
            data-index={index}
            data-box={box}
            data-row={row}
            data-col={col}
            id={id}
            onClick={onBoxClick}
        >
            {value}
        </button>
    );
};

export default NumberBox;
