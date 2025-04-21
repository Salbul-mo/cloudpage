export function insertionSort(array: number[]) {
    // Best: Ω(N) => 이미 정리된 경우
    // Average: Θ(N^2)
    // Worst: O(N^2)
    // Space Complexity Worst: O(1)
    // 버블 정렬과 구조는 똑같지만
    // 버블 정렬이 항상 배열의 처음부터 끝까지 순회하는 것과 달리
    // 배열의 중간에서 for 문을 벗어날 수 있으므로 거리가 짧아 시간이 좀 더 단축된다.
    for (let i = 1; i < array.length; i++) {

        const value = array[i]
        let j = i - 1

        for (j; j >= 0; j--) {
            if (array[j] > value) {
                array[j + 1] = array[j]
            } else {
                break
            }
        }
        // 자바스크립트는 for 문 밖에도 변수 상태가 저장된다.
        // for 문을 벗어난 순간 j 의 값 + 1의 인덱스에 값 저장
        // => j = -1 또는 value가 최소값이 아니게 된 순간의 j + 1
        array[j + 1] = value
    }
    return array
}

