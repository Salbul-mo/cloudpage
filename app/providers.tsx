"use client";

import { AuthProvider } from "./providers/AuthContext"; // AuthContext 경로에 맞게 수정
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}