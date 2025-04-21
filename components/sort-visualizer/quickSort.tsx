export function quickSort(array: number[]): number[] {
    // log(N) 은 대개 밑이 2인 log(N) 을 의미한다. 반복적으로 데이터 수를 절반으로 줄이는 알고리즘을 의미한다.
    // N*log(N) 은 각 데이터 요소를 로그 횟수만큼 처리하는 알고리즘을 의미한다.
    // Best: Ω(N*log(N)) => 이미 정렬된 경우라도 무조건 수행되기 때문에 평균 시간복잡도와 동일하다.
    // Average: Θ(N*log(N) => 재귀 호출 되면서 필요 연산 횟수가 절반씩 감소, 지수함수적 시간복잡도가 형성된다.
    // Worst: O(N^2) => 왼쪽 오른쪽 정렬이 한 요소씩 증감하면서 결과적으로 버블 정렬과 같아지는 경우
    // Space Complex Worst: O(log(N)) => 최악의 경우에 요소 갯수의 로그 횟수만큼 배열을 생성해야 한다.
    if (array.length <= 1) {
        return array
    }

    // 분할 정복 전략(Divide & Conquer Strategy)의 대표적인 알고리즘
    // pivot => 중심축이 되어 작으면 왼쪽, 크면 오른쪽
    // 좌우 배열을 요소로 재귀호출하여 정렬을 반복한다.
    // 정렬이 마무리되면 left right 배열은 요소가 0 이므로 
    // array.length 가 1이 되어 반환된다.
    // pivot 초기 pivot 의 위치에 따라 수행 시간이 달라진다.
    const pivot = array[array.length - 1]
    const left: number[] = []
    const right: number[] = []

    for (let i = 0; i < array.length - 1; i++) {
        if (array[i] < pivot) {
            left.push(array[i])
        } else {
            right.push(array[i])
        }
    }

    return [...quickSort(left), pivot, ...quickSort(right)]
}
