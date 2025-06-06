import Link from 'next/link'

export default function Code_Rule() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl justify-center text-tokyo_night-50">
            <nav className="mb-6">
                <Link className="text-tokyo_green-500 text-xl hover:underline" href="/">
                    Home
                </Link>
            </nav>

            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-4">안전 필수 코딩을 위한 10가지 규칙 - GPT 번역본</h1>
            </header>

            <section className="mb-10">
                <p className="mb-4">
                    대부분의 진지한 소프트웨어 개발 프로젝트에서는 코딩 가이드라인을 사용한다.
                </p>

                <p className="mb-4">
                    이러한 가이드라인은 작성될 소프트웨어의 기본 원칙을 정의하기 위한 것으로,
                    코드의 구조 방식과 사용해야 할 언어나 피해야 할 기능들을 규정한다. 하지만 흥미롭게도,
                    '좋은 코딩 표준'에 대한 일치된 견해는 거의 없다. 작성된 수많은 코딩 가이드라인들에는
                    공통된 패턴이 거의 없으며, 각 문서가 이전보다 더 길어지는 경향이 있다는 점만이 두드러진다.
                    그 결과 대부분의 가이드라인은 100개가 넘는 규칙을 포함하고 있으며,
                    때로는 정당성이 의심스러운 내용도 포함되어 있다.
                </p>

                <p className="mb-4">
                    공백(white-space) 사용 방식처럼 개인적 취향에 의해 만들어졌다고 여겨지는 규칙들도 있으며,
                    과거 조직 내 개발 중 발생한 아주 특정하고 드문 오류를 방지하려는 의도로 만들어진 규칙도 있다.
                    놀랍지 않게도, 기존의 코딩 가이드라인은 개발자들이 실제로 코드를 작성할 때 거의 영향을 미치지 못한다.
                    많은 가이드라인들이 가진 가장 치명적인 문제는 도구 기반의 규칙 준수 검증(compliance check)을
                    포괄적으로 허용하지 않는다는 점이다.
                </p>

                <p className="mb-4">
                    대형 애플리케이션의 수십만 줄에 이르는 코드를 수작업으로 검토하는 것이 사실상 불가능하므로,
                    도구 기반의 검사가 매우 중요하다. 이러한 이유로, 기존의 코딩 가이드라인은
                    심지어 중요한 애플리케이션에서도 실제로 얻는 이점이 거의 없다.
                </p>

                <p className="mb-4">
                    하지만 잘 선택된 소수의 규칙을 검증 가능한 방식으로 설정한다면,
                    해당 소프트웨어가 단순히 규칙을 지켰다는 것 이상의 특성들까지 더 철저히 분석할 수 있을 것이다.
                    이를 위해서는 규칙이 적고, 명확하며, 쉽게 이해되고 기억될 수 있어야 한다.
                    또 기계적으로 검증 가능한 수준으로 구체적이어야 한다.
                </p>

                <p className="mb-4">
                    효과적인 가이드라인을 위한 규칙의 상한선으로 쉽게 생각할 수 있는 수치는 열 개이다.
                    물론 열 개만으로 모든 것을 포괄할 수는 없지만, 측정 가능한 방식으로 소프트웨어의 신뢰성과
                    검증 가능성을 향상시키는 출발점이 될 수 있다. 이를 위해 규칙은 다소 엄격해야 하며,
                    이는 '드라코닉(Draconian)'하다고도 표현할 수 있다. 그러나 정말 중요한 경우라면,
                    약간 더 엄격한 규칙을 따르는 것이 충분한 보상을 가져다 줄 수 있다.
                    그 대가로 우리는 중요한 소프트웨어가 의도대로 작동함을 보다 명확히 증명할 수 있어야 한다.
                </p>
            </section>

            <div className="space-y-12">
                <section className="bg-tokyo_night-900 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-tokyo_green-400">1. 단순한 제어 흐름구조만을 사용한다.</h2>
                    <p className="mb-3"><strong className="text-tokyo_green-300">규칙:</strong> <code className="bg-tokyo_night-800 px-1 rounded">goto</code>, <code className="bg-tokyo_night-800 px-1 rounded">setjmp</code>, <code className="bg-tokyo_night-800 px-1 rounded">longjmp</code>, 직접/간접 재귀 사용 금지</p>
                    <p><strong className="text-tokyo_green-300">이유:</strong> 단순한 제어 흐름은 코드의 검증 능력을 높이고, 코드 가독성도 향상시킨다. 재귀를 금지하는 것은 놀라울 수 있지만, 재귀가 없으면 함수 호출 그래프가 비순환(acyclic)이 되므로, 이를 분석 도구가 활용할 수 있고 실행의 유한성도 검증 가능해진다.</p>
                </section>

                <section className="bg-tokyo_night-900 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-tokyo_green-400">2. 모든 루프는 정적으로 검증 가능한 고정된 상한값을 가져야 한다.</h2>
                    <p className="mb-3"><strong className="text-tokyo_green-300">규칙:</strong> 루프 반복 횟수는 정적으로 증명 가능해야 함</p>
                    <p><strong className="text-tokyo_green-300">이유:</strong> 재귀가 없고, 반복문에 상한이 있다면 코드가 무한 실행되는 것을 방지할 수 있다. 반복 횟수를 예측할 수 없는 경우에도, 명시적인 최대 반복 횟수를 설정하여 초과 시 오류를 발생시키고 함수가 실패를 리턴하도록 해야 한다.</p>
                </section>

                <section className="bg-tokyo_night-900 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-tokyo_green-400">3. 초기화 이후의 동적 메모리 할당 금지한다.</h2>
                    <p className="mb-3"><strong className="text-tokyo_green-300">규칙:</strong> <code className="bg-tokyo_night-800 px-1 rounded">malloc</code> 등의 메모리 할당자 사용 금지</p>
                    <p><strong className="text-tokyo_green-300">이유:</strong> malloc 등의 메모리 할당자는 예측 불가능한 동작을 할 수 있으며, 잘못된 사용이 많은 문제를 유발한다. 고정된, 사전에 할당된 메모리 내에서 동작하도록 제한하면, 오류 가능성과 검증 복잡성을 줄일 수 있다. 재귀가 없다면 스택 메모리의 최대 사용량도 정적으로 분석 가능하다.</p>
                </section>

                <section className="bg-tokyo_night-900 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-tokyo_green-400">4. 함수 길이를 제한한다.</h2>
                    <p className="mb-3"><strong className="text-tokyo_green-300">규칙:</strong> 한 페이지 내에 출력 가능한 길이 (약 60줄)</p>
                    <p><strong className="text-tokyo_green-300">이유:</strong> 함수는 이해 가능하고 검증 가능한 논리적 단위여야 한다. 지나치게 긴 함수는 코드 구조가 잘못되었음을 나타낸다.</p>
                </section>

                <section className="bg-tokyo_night-900 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-tokyo_green-400">5. 함수당 최소 두 개의 단언문(assert)을 사용한다.</h2>
                    <p className="mb-3"><strong className="text-tokyo_green-300">규칙:</strong> <code className="bg-tokyo_night-800 px-1 rounded">assert</code>는 부작용이 없어야 하며, 오류 발생 시 복구 절차 포함하여야 한다.</p>
                    <div className="bg-tokyo_night-800 p-3 rounded my-4 overflow-x-auto">
                        <code className="text-sm">
                            #define c_assert(e) ((e) ? (true) : \<br />
                            &nbsp;&nbsp;tst_debugging("%s,%d: assertion '%s' failed\n", __FILE__, __LINE__, #e), false)
                        </code>
                    </div>
                    <p><strong className="text-tokyo_green-300">이유:</strong> <code className="bg-tokyo_night-800 px-1 rounded">assert</code>는 예기치 않은 상황을 탐지하는 데 매우 유용하며, 단위 테스트 외에도 코드의 안정성을 높이는 방어적 코딩 전략이다. <code className="bg-tokyo_night-800 px-1 rounded">assert</code>는 항상 부작용이 없어야 하며, <code className="bg-tokyo_night-800 px-1 rounded">true</code> 혹은 <code className="bg-tokyo_night-800 px-1 rounded">false</code> 값을 반환하는 조건이어야 한다.</p>
                </section>

                <section className="bg-tokyo_night-900 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-tokyo_green-400">6. 변수는 최소한의 스코프에서 선언한다.</h2>
                    <p><strong className="text-tokyo_green-300">이유:</strong> 스코프를 좁히면 외부에서 값을 참조하거나 오염시킬 가능성이 줄어든다. 또한 디버깅 시 원인을 추적하기 쉽다. 변수 재사용으로 인한 오류도 방지된다.</p>
                </section>

                <section className="bg-tokyo_night-900 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-tokyo_green-400">7. 반환 값과 매개변수의 유효성 체크를 항상 수행한다.</h2>
                    <p className="mb-3"><strong className="text-tokyo_green-300">규칙:</strong> 모든 <code className="bg-tokyo_night-800 px-1 rounded">non-void</code> 함수 반환값 확인, 매개변수 유효성 검사 포함</p>
                    <p><strong className="text-tokyo_green-300">이유:</strong> 반환값을 무시하는 것은 심각한 오류로 이어질 수 있다. 불필요한 경우에는 (void) 캐스팅으로 무시 의도를 명확히 하도록 한다. 일반적으로는 반환값을 반드시 확인하고, 인자의 유효성을 점검하여 오류를 조기에 탐지할 수 있도록 해야 한다.</p>
                </section>

                <section className="bg-tokyo_night-900 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-tokyo_green-400">8. 전처리기(preprocessor) 사용을 제한한다.</h2>
                    <p className="mb-3"><strong className="text-tokyo_green-300">규칙:</strong> <code className="bg-tokyo_night-800 px-1 rounded">#include</code>, 간단한 매크로 외의 사용 금지 (토큰 붙이기, 재귀, 복잡한 조건부 컴파일 등 지양)</p>
                    <p><strong className="text-tokyo_green-300">이유:</strong> 전처리기는 코드의 명확성을 심각하게 훼손할 수 있으며, 복잡한 매크로나 조건부 컴파일 지시어는 분석 도구를 혼란스럽게 만든다. 조건부 컴파일이 불가피한 경우에도 최대한 제한해야 하며, 사용 시 정당한 이유가 명시되어야 한다.</p>
                </section>

                <section className="bg-tokyo_night-900 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-tokyo_green-400">9. 포인터 사용은 제한적으로 한다.</h2>
                    <p className="mb-3"><strong className="text-tokyo_green-300">규칙:</strong> 포인터 역참조는 1단계까지만 허용. 함수 포인터 금지</p>
                    <p><strong className="text-tokyo_green-300">이유:</strong> 포인터는 숙련된 개발자도 쉽게 실수할 수 있는 요소이다. 특히 함수 포인터는 정적 분석의 큰 방해 요소가 되므로 원칙적으로 사용을 금지한다. 불가피하게 사용할 경우, 대체 검증 수단이 반드시 제공되어야 한다.</p>
                </section>

                <section className="bg-tokyo_night-900 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-tokyo_green-400">10. 모든 컴파일 경고와 정적 분석 오류는 0개여야 함</h2>
                    <p className="mb-3"><strong className="text-tokyo_green-300">규칙:</strong> 모든 코드는 개발 첫날부터 컴파일러 경고를 가장 엄격한 수준에서 모두 활성화하고, 경고 없이 컴파일되어야 한다. 또한, 매일 정적 분석기로 검사하고 경고가 없어야 한다.</p>
                    <p><strong className="text-tokyo_green-300">이유:</strong> 최신 정적 분석 도구들은 빠르고 정확한 메시지를 제공하며, 코드의 품질을 비약적으로 향상시킬 수 있다. 오류 경고가 부정확하더라도, 해당 코드를 명확히 하여 경고가 발생하지 않도록 수정해야 한다.</p>
                </section>
            </div>

            <section className="mt-12 p-6 bg-tokyo_night-900 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-tokyo_green-400">결론</h2>
                <p className="leading-relaxed">
                    이 규칙들 중 처음 두 개는 명확한 제어 흐름 구조를 보장하며, 세 번째는 메모리 관련 문제를 제거한다.
                    이후의 규칙들(4~7)은 일반적으로 좋은 코딩 스타일로 알려져 있으며, '계약 기반 설계(Design by Contract)'와
                    유사한 접근을 포함하고 있다. 이 규칙들은 JPL의 미션 크리티컬 소프트웨어에서 실험적으로 사용되고 있으며,
                    초기에는 불편하더라도 개발자들이 익숙해지면 오히려 편리함을 느끼게 된다고 한다.
                </p>
                <p className="mt-4 leading-relaxed">
                    이러한 규칙들은 항공기, 원자력 발전소, 우주선 등 생명에 직결되는 시스템에서 코드의 정확성을
                    보장하기 위해 사용되는 안전벨트와 같은 것이다. 처음엔 불편할 수 있지만,
                    어느 순간에는 없으면 불안할 정도가 된다.
                </p>
            </section>

            <footer className="mt-10 pt-6 border-t border-tokyo_night-700 text-center text-md text-tokyo_green-500">
                <p>출처 : <a href=" https://spinroot.com/gerard/pdf/P10.pdf" target="_blank">https://spinroot.com/gerard/pdf/P10.pdf</a></p>
            </footer>
        </div>
    )
}
