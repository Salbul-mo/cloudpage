import Link from 'next/link';
import Game from '../../components/tic-tac-toe/test'
import '../globals.css'

export default function Tic_Tac_Toe() {
    return (
        <div className="container mx-auto">
            <h1 className="text-tokyo_orange-500">Tic Tac Toe</h1>
            <Game />
            <Link href="/" />
        </div>

    )
}
