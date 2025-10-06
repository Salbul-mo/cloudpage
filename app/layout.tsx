import type { Metadata } from "next";
import './globals.css'
import { Providers } from "./providers"; // 👈 새로 만든 Providers 컴포넌트를 import

export const metadata: Metadata = {
  title: "Salbul_mo's Cloudflare Pages App",
  description: "개발 연습용 프로젝트",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="bg-tokyo_night-800">
            <body>
                <Providers> {/* 👈 AuthProvider 대신 Providers로 children을 감쌉니다. */}
                    {children}
                </Providers>
            </body>
        </html>
    );
}
