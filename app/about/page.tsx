import Link from "next/link";
import '../globals.css'

export default function About() {
    return (
        <>
            <h1 className="text-3xl text-tokyo_green-500 my-10">About</h1>
            <div className="text-tokyo_green-500 text-2xl">
                <p>Back to <Link className="text-tokyo_red-500" href="/">Home</Link></p>
                <p>Contact me(Gmail) : salbul.mo91@gmail.com</p>
            </div>
        </>
    );
}
