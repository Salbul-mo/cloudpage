import Link from "next/link";

const Home = () => {
  return (
    <div className="container mx-auto flex flex-col">
      <h1 className="text-tokyo_green-500 text-5xl">개발 연습장 Salbul-mo</h1>

      <div className="my-10">
        <h1 className="text-tokyo_purple-500 text-3xl">개발 참고용 링크</h1>

        <div className="my-3">
          <p className="text-tokyo_skyblue-500 text-2xl">Tailwind</p>
          <p className="text-tokyo_skyblue-500 text-xl">
            <a
              href="https://tailwindcss.com/docs/installation/using-postcss"
              target="_blank"
            >
              테일윈드 공식 Doc{" "}
            </a>
          </p>
          <p className="text-tokyo_skyblue-500 text-xl">
            <a
              href="https://umeshmk.github.io/Tailwindcss-cheatsheet/"
              target="_blank"
            >
              테일윈드 치트시트
            </a>
          </p>
        </div>
        <div className="my-3">
          <p className="text-tokyo_skyblue-500 text-2xl">React</p>
          <p className="text-tokyo_skyblue-500 text-xl">
            <a href="https://react.dev/learn" target="_blank">
              리액트 튜토리얼
            </a>
          </p>
        </div>
        <div className="my-3">
          <p className="text-tokyo_skyblue-500 text-2xl">Next.js</p>
          <p className="text-tokyo_skyblue-500 text-xl">
            <a
              href="https://nextjs.org/docs/app/getting-started/installation"
              target="_blank"
            >
              Next.js 공식 Doc{" "}
            </a>
          </p>
        </div>
        <div className="my-3">
          <p className="text-tokyo_skyblue-500 text-2xl">Neovim</p>
          <p className="text-tokyo_skyblue-500 text-xl">
            <a href="https://neovim.io/doc/user/lua.html" target="_blank">
              Neovim.doc - Lua 란?
            </a>
          </p>
          <p className="text-tokyo_skyblue-500 text-xl">
            <a
              href="https://neovim.io/doc/user/#_api-(extensibility/scripting/plugins)"
              target="_blank"
            >
              Neovim.doc - API/LS{" "}
            </a>
          </p>
        </div>
        <div className="my-3">
          <p className="text-tokyo_skyblue-500 text-2xl">코드 컨벤션</p>
          <p className="text-tokyo_skyblue-500 text-xl">
            나사 Code Rule -{" "}
            <Link href="/code-rule">
              The Power of Ten - Rules for Developing Safety Critical Code
            </Link>
          </p>
        </div>
      </div>
      <div className="my-10">
        <div className="my-3">
          <h1 className="text-tokyo_orange-500 text-3xl">직접 개발하기</h1>

          <p className="text-tokyo_orange-500 text-2xl">
            <Link className="text-xl" href="/sal_calculator">
              급여 계산기(Salary Calculator) 비과세 시급 미포함 버전
            </Link>
          </p>

          <p className="text-tokyo_orange-500 text-2xl">
            <Link className="text-xl" href="/sal_calculator_v2">
              급여 계산기(Salary Calculator) 비과세 시급 포함 버전
            </Link>
          </p>

          <p className="text-tokyo_orange-500 text-2xl">
            <Link className="text-xl" href="/tic-tac-toe">
              틱-택-토 (Tic-Tac-Toe) Play
            </Link>
          </p>

          <p className="text-tokyo_orange-500 text-2xl">
            <Link className="text-xl" href="/sudokuSolver">
              스도쿠 풀이(Sudoku Solver){" "}
            </Link>
          </p>
          <p className="text-tokyo_orange-500 text-2xl">
            <Link className="text-xl" href="/sudokuSolverV2">
              스도쿠 풀이(Sudoku Solver V2){" "}
            </Link>
          </p>
          <p className="text-tokyo_orange-500 text-2xl">
            <Link className="text-xl" href="/sudokuGame">
              스도쿠 게임(Sudoku Game) -미완성-
            </Link>
          </p>

          {/* <p className="text-tokyo_orange-500 text-2xl">
                        <Link className="text-xl" href="/sudokuBoard">스도쿠 보드(Sudoku Board) - UI 체크용 - </Link>
                    </p> */}
          <div className="text-tokyo_orange-500 mb-2">
            <p className="text-2xl">
              <Link className="text-xl" href="/sudokuV2">
                스도쿠 V2{" "}
              </Link>
            </p>
            <span className="text-sm block ml-6">
              C 코드로 작성한 Algorithm X + Dancing Links Matrix 를 WASM 으로
              컴파일하여 사용해보는 테스트 작업
            </span>
          </div>
        </div>
        <div className="my-3">
          <p className="text-tokyo_orange-500 text-2xl">
            <Link className="text-xl" href="/about">
              Visit the About Me
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
