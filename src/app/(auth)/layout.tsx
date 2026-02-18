import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left branding panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-14 w-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
              <span className="text-primary-foreground text-2xl font-bold">R</span>
            </div>
            <span className="text-primary-foreground text-4xl font-bold tracking-tight">RIZAT</span>
          </div>
          <h2 className="text-primary-foreground text-2xl font-semibold">Bienvenue sur RIZAT</h2>
          <p className="text-primary-foreground/70 text-lg max-w-sm">
            Votre plateforme ERP professionnelle
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-foreground/5" />
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary-foreground/5" />
      </div>

      {/* Right content panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">R</span>
            </div>
            <span className="text-foreground text-xl font-bold tracking-tight">RIZAT</span>
          </div>

          {children}

          <p className="text-center text-xs text-muted-foreground mt-8">
            © 2026 RIZAT - Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}

