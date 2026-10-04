import { DatabaseZap } from "lucide-react";

type PageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-semibold">{title}</h1>
        {description ? (
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** Explains why the admin is read-only (no database). */
export function ReadOnlyNotice({ reason }: { reason: string | null }) {
  if (!reason) {
    return null;
  }

  return (
    <p className="border-border bg-card text-muted-foreground mt-6 flex gap-3 rounded-xl border p-4 text-sm">
      <DatabaseZap className="text-primary-soft mt-0.5 size-5 shrink-0" />
      <span>{reason}</span>
    </p>
  );
}
