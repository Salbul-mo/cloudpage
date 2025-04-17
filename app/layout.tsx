import './globals.css'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="bg-tokyo_night-800">
            <body>{children}</body>
        </html>
    );
}
