// 전체 숫자 반환
export function GenerateTotalSet() {

    // null 로 채워진 9 X 9 2차원 배열 생성
    const numberSet = Array(9).fill(null).map(() => Array(9).fill(null))

    // 행 단위로? 박스 단위로? 열 단위로?



    return

}

// 숫자 섞기
export function ShuffleNumber(arr: number[]) {

    const newArray = [...arr]

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))

            ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
}

// 블럭 변환 팩터 F1
// 0 0 1
// 1 0 0
// 0 1 0
//
// 블럭 변환 팩터 F2
// 0 1 0
// 0 0 1
// 1 0 0
//
// S1 무작위 숫자로 블럭 생성
// a b c
// d e f 
// g h i
//
// F1 * S1
// 0*a+0*d+1*g    0*b+0*e+1*h    0*c+0*f+1*i       g h i
//
// 1*a+0*d+0*g    1*b+0*e+0*h    1*c+0*f+0*i   =>  a b c
//
// 0*a+1*d+0*g    0*b+1*e+0*h    0*c+1*f+0*i       d e f
//
// S1 * F1
// a*0+b*1+c*0    a*0+b*0+c*1    a*1+b*0+c*0       b c a
//
// d*0+e*1+f*0    d*0+e*0+f*1    d*1+e*0+f*0  =>   e f d
//
// g*0+h*1+i*0    g*0+h*0+i*1    g*1+h*0+i*0       h i g
//
// F1 변환 팩터는 뒷 행렬의 행을 하나씩 내린다
// F1 변환 팩터는 앞 행렬의 열을 하나씩 올린다 
// 
//
// F2 * S1
// d e f
// g h i
// a b c
//
// S1 * F2
// c a b
// f d e
// i g h
//
// F2 변환 팩터는 뒷 행렬의 행을 하나씩 올린다
// F2 변환 팩터는 앞 행렬의 열을 하나씩 내린다.
//
//
// 스도쿠 보드
// S1 S2 S3
// S4 S5 S6
// S7 S8 S9
//
// S1
// 0 1 2
// 3 4 5
// 6 7 8
//
// S2 => F2 * S1
// 3 4 5
// 6 7 8
// 0 1 2
//
// S3 => F1 * S1
// 6 7 8
// 0 1 2
// 3 4 5
//
// S4 => S1 * F1
// 1 2 0
// 4 5 3
// 7 8 6
//
// S5 => F2 * S1 * F1 = S2 * F1
// 4 5 3
// 7 8 6
// 1 2 0
//
// S6 => F1 * S1 * F1 = S3 * F1
// 7 8 6
// 1 2 0
// 4 5 3
//
// S7 => S1 * F2
// 2 0 1
// 5 3 4
// 8 6 7
//
//
// S8 => F2 * S1 * F2 = S2 * F2
// 5 3 4
// 8 6 7
// 2 0 1
//
// S9 => F1 * S1 * F2 = S3 * F2
// 8 6 7
// 2 0 1
// 5 3 4


// 스도쿠 숫자의 노드 구조
export function SudokuNode() {


    const row = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    const col = [0, 1, 2, 3, 4, 5, 6, 7, 8]

    const rootRow = Math.floor(Math.random() * 3) + 3
    const rootCol = Math.floor(Math.random() * 3) + 3

    // Root Node (Box4) 생성
    const rootNode: BoxNode = { row: 0, col: 1, childNode: null }


}

// 노드 인터페이스
interface BoxNode {
    row: number,
    col: number,
    childNode: BoxNode | null
}








