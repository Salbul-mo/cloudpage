import { numberGenerator } from './function/numberGen'
//
// function Box({ value, className, onBoxClick }) {
//
//     return (<button className={className} onClick={onBoxClick}>
//         {value}
//     </button>
//
//     )
//
// }
// export function SudokuBox({ row, col }: { row: number, col: number }) {
//
//     const set1 = numberGenerator()
//
//     function handleClick(arr: number[]) {
//         // arr => row, col, index
//     }
//
//
//     return (
//         <div className="boxSet">
//             {set1.map((item, index) => {
//                 return (
//                     <Box value={item} className={`sudokuBox ${index < 3 ? 'border-t-tokyo_night-50 border-t-3' : ''} ${6 <= index && index <= 8 ? 'border-b-tokyo_night-50 border-b-3' : ''} ${index % 3 === 0 ? 'border-l-tokyo_night-50 border-l-3' : ''} ${index % 3 === 2 ? 'border-r-tokyo_night-50 border-r-3' : ''}`} key={`${row} -${col} -${index}`} onBoxClick={() => handleClick([row, col, index])} />
//                 )
//             })}
//         </div >
//
//     )
// }
