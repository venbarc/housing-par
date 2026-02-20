"use client";

import { Toaster } from "react-hot-toast";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: "10px", background: "#0f172a", color: "#fff" },
        }}
      />
      {children}
    </>
  );
}
