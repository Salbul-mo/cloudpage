export function bubbleSort(array: number[]) {
    // Best: Ω(N) => 이미 정리된 경우
    // Average: θ(N^2)
    // Worst: O(N^2)
    // Space Complexity Worst: O(1)
    for (let n = array.length; n >= 0; n--) {
        for (let i = 0; i < n - 1; i++) {
            if (array[i] > array[i + 1]) {
                // Swap Elements
                // ????
                ;[array[i], array[i + 1]] = [array[i + 1], array[i]]
            }
        }
    }

    return array
}
