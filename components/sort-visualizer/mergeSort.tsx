export function mergeSort(array: number[]): number[] {
    // Best: Ω(N*log(N)) => 이미 정렬된 배열이라도 무조건 실행하므로 평균 시간 복잡도와 같다.
    // Average: Θ(N*log(N))
    // Worst: O(N*log(N)) => 반드시 전체 요소 수 * 로그 횟수만큼 수행되므로 평균 시간 복잡도와 같다.
    // Space Complexity Worst: O(N) => 반드시 전체 요소 만큼 배열이 생성되므로 일정하다.
    if (array.length <= 1) {
        return array
    }

    // 분할 정복 전략의 대표적인 알고리즘 (Divide & Conquer Strategy)
    // 재귀 호출로 요소 갯수 만큼의 배열을 생성한다.(array.length = 1 이므로 array 반환)
    // 좌우 배열을 하나씩 비교하면서 result 배열에 삽입
    // 한 쪽 배열이 소모되면 자동으로 나머지 요소를 결과 배열에 붙인다. (어느쪽이든 무조건 크거나 작다.)
    // 반복되면서 정렬이 이루어진 청크 갯수가 지수적으로 줄어든다.
    const middle = Math.floor(array.length / 2)
    const left = mergeSort(array.slice(0, middle))
    const right = mergeSort(array.slice(middle))

    const result: number[] = []

    let i = 0,
        j = 0

    while (i < left.length && j < right.length) {
        if (left[i] < right[j]) {
            result.push(left[i])
            i++
        } else {
            result.push(right[j])
            j++
        }
    }

    return result.concat(left.slice(i)).concat(right.slice(j))
}
