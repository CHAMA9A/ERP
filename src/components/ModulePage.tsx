interface ModulePageProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function ModulePage({ title, subtitle, children }: ModulePageProps) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children || (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            Contenu à venir...
          </p>
        </div>
      )}
    </div>
  );
}
