"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        className:
          "rounded-2xl border-line bg-white text-ink shadow-lift font-sans",
      }}
    />
  );
}
