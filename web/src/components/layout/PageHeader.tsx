import { ReactNode } from "react";

export function PageHeader({ crumbs, title, description, action }: { crumbs: string[]; title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <div className="crumbs">
          {crumbs.map((c, i) => (<span key={i}>{c}{i < crumbs.length - 1 && <span className="sep"> / </span>}</span>))}
        </div>
        <h1>{title}</h1>
        {description && <p className="desc">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}