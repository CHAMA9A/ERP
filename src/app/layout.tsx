import type { ReactNode } from "react";
import type { Metadata } from "next";
import "../index.css";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "RIZAT ERP",
  description: "Interface ERP moderne RIZAT",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

