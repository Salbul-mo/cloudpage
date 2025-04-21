export function numberGenerator(): number[] {

    let array = getOneSet()

    return array
}

// 최댓값이 주어지지 않으면 1 ~ 9 중 하나 반환
// 최댓값이 주어지면 1 ~ 최댓값 이하 중 하나 반환
function getRandomInt(max: number | null): number {

    const number = Math.floor(Math.random() * (max ? max : 9)) + 1
    return number
}

function getOneSet(): number[] {

    const array: number[] = []

    while (array.length < 9) {
        let temp: number = getRandomInt(null)
        if (array.includes(temp)) {
            continue
        } else {
            array.push(temp)
        }

    }

    return array
}
