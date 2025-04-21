export function selectionSort(array: number[]) {
    // Best: Ω(N^2) => 항상 배열 전체를 순회하며 비교를 수행하기 때문에 이미 배열된 경우도 똑같다.
    // Average: Θ(N^2)
    // Worst: O(N^2)
    // Space Complexity Worst: O(1)
    for (let i = 0; i < array.length - 1; i++) {

        let minIndex = i

        for (let j = i + 1; j < array.length; j++) {
            if (array[j] < array[minIndex]) {
                minIndex = j
            }
        }

        if (minIndex !== i) {
            // Swap Elements
            ;[array[i], array[minIndex]] = [array[minIndex], array[i]]
        }
    }

    return array
}
